import { generateFictionalLabPreview } from "./structured-lab-preview";
import { labPreviewToolHtml } from "./lab-preview-tool";
import { fictionalLabFixture, type FictionalPreviewEnvelope } from "../shared/structured-lab-preview";
import { platform } from "./platform";
import { billingConfigured, billingMode } from "./billing";
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import {
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { z } from "zod";
import { promisify } from "node:util";
import {
  blankIntake,
  intakeSchema,
  intakeErrors,
  extractionSchema,
  reportSchema,
  type CareCase,
  type User,
  type PublicUser,
  type Document,
} from "../shared/care";
import { createCareStore, ConflictError, type CareStore } from "./care-store";
import { documentKinds, reviewBlockers, verificationProblems } from "../shared/care-review";
import {
  aiConfigured,
  extractLabs,
  draftAssessment,
} from "./assessment-engine";

type Session = { userId: string; expires: number };
type Attachment = { caseId: string; mime: string; name: string; data: string };
type AuthRequest = Request & { careUser?: User };
const cookieName = "shamba_session";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const failure = (status: number, message: string): never => {
  throw Object.assign(new Error(message), { status });
};
const publicUser = ({ passwordHash: _, ...u }: User): PublicUser => u;
const normalizeEmail = (s: string) => s.trim().toLowerCase();
const pilotMode = () =>
  process.env.NODE_ENV !== "production" || process.env.PILOT_MODE === "true";
const price = () => {
  const value = Number(process.env.PILOT_PRICE_CENTS || 49900);
  if (!Number.isSafeInteger(value) || value < 100 || value > 1000000)
    throw new Error("PILOT_PRICE_CENTS must be a valid amount.");
  return value;
};
const checkoutConfigured = billingConfigured;
const now = () => new Date().toISOString();
const derivePassword = promisify(scrypt);
async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${((await derivePassword(password, salt, 64)) as Buffer).toString("hex")}`;
}
async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  const computed = (await derivePassword(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
const userFor = (req: Request, role?: PublicUser["role"]): User => {
  const u = (req as AuthRequest).careUser;
  if (!u) return failure(401, "Sign in to continue.");
  if (role && u.role !== role)
    return failure(403, "This action requires a practitioner account.");
  return u;
};
const route =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
function visibleCase(c: CareCase, u: User) {
  if (u.role === "practitioner") return c;
  const { draft: _, practitionerNotes: __, events: ___, ...rest } = c;
  return {
    ...rest,
    documents: c.documents.map((d) => {
      const {criticalReview: _, ...visible}=d;
      return d.verifiedAt && d.kind === "laboratory-results" ? visible : {...visible,extraction:undefined};
    }),
  };
}
export async function registerRoutes(
  httpServer: Server,
  app: Express,
  suppliedStore?: CareStore,
): Promise<Server> {
  const store = suppliedStore || (await createCareStore());
  app.get("/health", route(async (_req, res) => {
    await store.list("health-probe");
    res.setHeader("Cache-Control", "no-store");
    res.json({ status: "ok" });
  }));
  if (!suppliedStore) {
    const shutdown = () => {
      httpServer.close(() => { void store.close().then(() => process.exit(0)); });
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.once("SIGTERM", shutdown);
    process.once("SIGINT", shutdown);
  }
  price();
  const practitionerEmail = normalizeEmail(
    process.env.PRACTITIONER_EMAIL || "",
  );
  if (practitionerEmail && process.env.PRACTITIONER_PASSWORD) {
    const id = hash(practitionerEmail);
    const existing = await store.get<User>("user", id);
    if (existing && existing.role !== "practitioner")
      throw new Error(
        "The practitioner email already belongs to a customer account.",
      );
    if (!existing) {
      if (process.env.PRACTITIONER_PASSWORD.length < 12)
        throw new Error(
          "PRACTITIONER_PASSWORD must have at least 12 characters.",
        );
      await store.put("user", id, {
        id,
        name: process.env.PRACTITIONER_NAME || "Care practitioner",
        email: practitionerEmail,
        role: "practitioner",
        passwordHash: await passwordHash(process.env.PRACTITIONER_PASSWORD),
      });
    }
  }
  const authAttempts = new Map<string, { count: number; expires: number }>();
  const authLimit = (req: Request) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const old = authAttempts.get(key);
    const entry =
      old && old.expires > Date.now()
        ? old
        : { count: 0, expires: Date.now() + 15 * 60 * 1000 };
    entry.count++;
    authAttempts.set(key, entry);
    if (entry.count > 30)
      failure(429, "Too many sign-in attempts. Try again in 15 minutes.");
    if (authAttempts.size > 5000)
      for (const [k, v] of authAttempts)
        if (v.expires < Date.now()) authAttempts.delete(k);
  };
  const session = async (res: Response, u: User) => {
    const token = randomBytes(32).toString("hex");
    await store.put("session", hash(token), {
      userId: u.id,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  };
  app.use("/api", (req: AuthRequest, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      !["/stripe/webhook", "/billing/webhook", "/institute/billing/webhook/test", "/institute/billing/webhook/live", "/institute/registrations"].includes(req.path)
    ) {
      const expected = process.env.APP_BASE_URL
        ? new URL(process.env.APP_BASE_URL).origin
        : `${req.protocol}://${req.get("host")}`;
      if (req.get("Origin") !== expected) {
        res.status(403).json({ message: "Request origin was not accepted." });
        return;
      }
      if (!req.is("application/json")) {
        res.status(415).json({ message: "Use a JSON request." });
        return;
      }
    }
    const token = req.headers.cookie
      ?.split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
    (async () => {
      if (token && /^[a-f0-9]{64}$/.test(token)) {
        const s = await store.get<Session>("session", hash(token));
        if (s && s.expires > Date.now())
          req.careUser = await store.get<User>("user", s.userId);
        else if (s) await store.remove("session", hash(token));
      }
      next();
    })().catch(next);
  });
  const previewAttempts=new Map<string,{count:number;until:number}>();
  const previewBusy=new Set<string>();
  function previewStaff(req:Request){
    const u=userFor(req,"practitioner");
    if(u.email!==practitionerEmail)failure(403,"This preview is restricted to the configured staff administrator.");
    if(process.env.LAB_REPORT_PREVIEW_ENABLED!=="true")failure(403,"The fictional AI preview is not enabled.");
    return u;
  }
  app.get("/api/admin/lab-report-preview/tool",route(async(req,res)=>{
    previewStaff(req);res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");res.type("html").send(labPreviewToolHtml);
  }));
  app.get("/api/admin/lab-report-preview/result",route(async(req,res)=>{
    const u=previewStaff(req);const value=await store.get<FictionalPreviewEnvelope>("fictional-ai-preview",u.id);
    if(!value)failure(404,"No fictional AI draft has been generated.");res.json(value);
  }));
  app.post("/api/admin/lab-report-preview",route(async(req,res)=>{
    const u=previewStaff(req);
    z.object({fixtureId:z.literal(fictionalLabFixture.id),confirm:z.literal(true)}).strict().parse(req.body);
    if(!aiConfigured())failure(503,"OpenAI is not configured on this service.");
    const old=previewAttempts.get(u.id);const window=old && old.until>Date.now()?old:{count:0,until:Date.now()+15*60*1000};
    if(previewBusy.has(u.id))failure(429,"A fictional draft is already being generated. Wait for it to finish.");
    if(window.count>=3)failure(429,"The fictional AI test limit is three attempts per 15 minutes. Please wait before retrying.");
    window.count++;previewAttempts.set(u.id,window);previewBusy.add(u.id);
    try{const value=await generateFictionalLabPreview();await store.put("fictional-ai-preview",u.id,value);res.json(value);}finally{previewBusy.delete(u.id);}
  }));
  app.get("/api/config", (_req, res) =>
    res.json({
      pilot: pilotMode(),
      billingMode: billingMode(),
      checkout: checkoutConfigured(),
      ai: aiConfigured(),
      amount: price(),
      currency: "usd",
    }),
  );
  app.get("/api/auth/me", (req, res) =>
    res.json({
      user: (req as AuthRequest).careUser
        ? publicUser((req as AuthRequest).careUser!)
        : null,
    }),
  );
  const authSchema = z.object({
    email: z.string().email().max(254),
    password: z.string().min(12).max(128),
    name: z.string().trim().min(2).max(100).optional(),
  });
  app.post(
    "/api/auth/register",
    route(async (req, res) => {
      authLimit(req);
      const data = authSchema
        .extend({ name: z.string().trim().min(2).max(100) })
        .parse(req.body);
      const email = normalizeEmail(data.email);
      if (email === practitionerEmail)
        failure(403, "Use practitioner sign-in for this email.");
      const id = hash(email);
      if (await store.get("user", id))
        failure(409, "Unable to create this account. Try signing in.");
      const u: User = {
        id,
        email,
        name: data.name,
        role: "customer",
        passwordHash: await passwordHash(data.password),
      };
      await store.put("user", id, u);
      await session(res, u);
      res.status(201).json({ user: publicUser(u) });
    }),
  );
  app.post(
    "/api/auth/login",
    route(async (req, res) => {
      authLimit(req);
      const data = authSchema.parse(req.body);
      const u = await store.get<User>("user", hash(normalizeEmail(data.email)));
      const valid = await verifyPassword(
        data.password,
        u?.passwordHash || `${"0".repeat(32)}:${"0".repeat(128)}`,
      );
      if (!u || !valid) failure(401, "Email or password was not recognized.");
      await session(res, u!);
      res.json({ user: publicUser(u!) });
    }),
  );
  app.post(
    "/api/auth/logout",
    route(async (req, res) => {
      const token = req.headers.cookie
        ?.split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith(`${cookieName}=`))
        ?.slice(cookieName.length + 1);
      if (token) await store.remove("session", hash(token));
      res.clearCookie(cookieName, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.json({ ok: true });
    }),
  );
  async function getCase(
    req: Request,
    role?: PublicUser["role"],
  ): Promise<[CareCase, User]> {
    const u = userFor(req, role);
    const c = await store.get<CareCase>("case", req.params.id);
    if (!c || (u.role === "customer" && c.customerId !== u.id))
      return failure(404, "Case not found.");
    return [c, u];
  }
  function revision(req: Request, c: CareCase) {
    const expected = z.number().int().nonnegative().parse(req.body.revision);
    if (expected !== c.revision) throw new ConflictError();
    return expected;
  }
  async function save(
    c: CareCase,
    expected: number,
    actor: string,
    action: string,
  ) {
    c.revision = expected + 1;
    c.updatedAt = now();
    c.events.push({ at: now(), actor, action });
    await store.put("case", c.id, c, expected);
  }
  const enrolled = (c: CareCase) => {
    if (!["paid", "unpaid-pilot"].includes(c.payment.status))
      failure(409, "Complete payment before continuing.");
  };
  const unpublished = (c: CareCase) => {
    if (c.reports.length)
      failure(
        409,
        "This case has a released report. Start a new care case for updated source information.",
      );
  };
  app.get(
    "/api/cases",
    route(async (req, res) => {
      const u = userFor(req);
      const cases = (
        await store.list<CareCase>(
          "case",
          u.role === "customer" ? u.id : undefined,
        )
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      res.json(cases.map((c) => visibleCase(c, u)));
    }),
  );
  app.get(
    "/api/cases/:id",
    route(async (req, res) => {
      const [c, u] = await getCase(req);
      res.json(visibleCase(c, u));
    }),
  );
  app.post(
    "/api/cases",
    route(async (req, res) => {
      const u = userFor(req, "customer");
      const input = z
        .object({ consent: z.literal(true), pilot: z.boolean() })
        .parse(req.body);
      if (input.pilot && !pilotMode())
        failure(403, "Unpaid pilot enrollment is not enabled.");
      if (!input.pilot && !checkoutConfigured())
        failure(503, "Paid enrollment is not available yet.");
      const c: CareCase = {
        id: randomUUID(),
        revision: 0,
        customerId: u.id,
        customerName: u.name,
        customerEmail: u.email,
        createdAt: now(),
        updatedAt: now(),
        consent: { version: "pilot-v1", acceptedAt: now() },
        payment: {
          status: input.pilot ? "unpaid-pilot" : "pending",
          amount: price(),
          currency: "usd",
        },
        intake: { ...blankIntake, name: u.name },
        documents: [],
        practitionerNotes: "",
        followupRequest: "",
        reports: [],
        events: [{ at: now(), actor: u.id, action: "case-created" }],
      };
      await store.put("case", c.id, c);
      res.status(201).json(visibleCase(c, u));
    }),
  );
  app.put(
    "/api/cases/:id/intake",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      c.intake = intakeSchema.parse(req.body.intake);
      if (req.body.submit === true) {
        const errors = intakeErrors(c.intake);
        if (errors.length) failure(400, errors.join(" "));
        c.intakeSubmittedAt = now();
      } else c.intakeSubmittedAt = undefined;
      c.draft = undefined;
      await save(
        c,
        expected,
        u.id,
        req.body.submit ? "intake-submitted" : "intake-saved",
      );
      res.json(visibleCase(c, u));
    }),
  );
  app.post("/api/cases/:id/followup-response", route(async(req,res)=>{
    const [c,u]=await getCase(req,"customer");enrolled(c);unpublished(c);
    const expected=revision(req,c);
    const input=z.object({message:z.string().trim().min(1).max(5000)}).parse(req.body);
    if(!c.followupRequest.trim())failure(409,"There is no open practitioner question. Refresh your care record.");
    if((c.followupResponses?.length || 0)>=100)failure(409,"The reply limit for this episode has been reached. Contact your care team.");
    c.followupResponse={request:c.followupRequest,message:input.message,sentAt:now()};
    c.followupResponses=[...(c.followupResponses || []),c.followupResponse];
    c.draft=undefined;
    await save(c,expected,u.id,"client-followup-response-saved");res.json(visibleCase(c,u));
  }));
  app.post(
    "/api/cases/:id/ai-consent",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      const expected = revision(req, c);
      const { consent } = z.object({ consent: z.boolean() }).parse(req.body);
      c.aiConsent = consent
        ? { version: "ai-v1", acceptedAt: now() }
        : undefined;
      c.draft = undefined;
      await save(
        c,
        expected,
        u.id,
        consent ? "ai-consent-granted" : "ai-consent-withdrawn",
      );
      res.json(visibleCase(c, u));
    }),
  );
  app.post(
    "/api/cases/:id/documents",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      const input = z
        .object({
          name: z.string().min(1).max(160),
          mime: z.enum([
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "text/plain",
            "text/csv",
          ]),
          data: z.string().max(7_000_000),
          purpose: z.enum(["lab", "tongue"]),
          kind: z.enum(documentKinds).optional(),
        })
        .parse(req.body);
      if (c.documents.length >= 12)
        failure(400, "This case already has 12 documents.");
      const bytes = Buffer.from(input.data, "base64");
      if (
        !bytes.length ||
        bytes.length > 5 * 1024 * 1024 ||
        bytes.toString("base64") !== input.data
      )
        failure(400, "Upload a valid file under 5 MB.");
      const valid =
        input.mime === "application/pdf"
          ? bytes.subarray(0, 5).toString() === "%PDF-"
          : input.mime === "image/png"
            ? bytes
                .subarray(0, 8)
                .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            : input.mime === "image/jpeg"
              ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
              : input.mime === "image/webp"
                ? bytes.subarray(0, 4).toString() === "RIFF" &&
                  bytes.subarray(8, 12).toString() === "WEBP"
                : bytes.length <= 512 * 1024 && !bytes.includes(0);
      if (
        !valid ||
        (input.purpose === "tongue" && !input.mime.startsWith("image/"))
      )
        failure(400, "The file content does not match its type.");
      const id = randomUUID();
      const name = input.name.replace(/[\x00-\x1f\x7f/\\]/g, "_");
      const document: Document = {
        id,
        name,
        mime: input.mime,
        purpose: input.purpose,
        kind: input.purpose === "lab" ? input.kind : undefined,
        size: bytes.length,
        uploadedAt: now(),
      };
      await store.put("attachment", id, {
        caseId: c.id,
        name,
        mime: input.mime,
        data: input.data,
      });
      c.documents.push(document);
      c.draft = undefined;
      try {
        await save(c, expected, u.id, "document-uploaded");
      } catch (e) {
        await store.remove("attachment", id);
        throw e;
      }
      res.status(201).json(visibleCase(c, u));
    }),
  );
  app.get(
    "/api/cases/:id/documents/:documentId",
    route(async (req, res) => {
      const [c] = await getCase(req);
      if (!c.documents.some((d) => d.id === req.params.documentId))
        failure(404, "Document not found.");
      const file = await store.get<Attachment>(
        "attachment",
        req.params.documentId,
      );
      if (!file || file.caseId !== c.id) failure(404, "Document not found.");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(file!.name)}`,
      );
      res.type(file!.mime).send(Buffer.from(file!.data, "base64"));
    }),
  );
  app.delete(
    "/api/cases/:id/documents/:documentId",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      if (!c.documents.some((d) => d.id === req.params.documentId))
        failure(404, "Document not found.");
      c.documents = c.documents.filter((d) => d.id !== req.params.documentId);
      c.draft = undefined;
      await save(c, expected, u.id, "document-removed");
      await store.remove("attachment", req.params.documentId);
      res.json(visibleCase(c, u));
    }),
  );
  app.post(
    "/api/cases/:id/lab-request",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      if (c.labRequest) failure(409, "A lab request is already recorded.");
      c.labRequest = { requestedAt: now(), status: "requested" };
      c.draft = undefined;
      await save(c, expected, u.id, "lab-order-requested");
      res.json(visibleCase(c, u));
    }),
  );
  app.post(
    "/api/cases/:id/lab-order",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      const data = z
        .object({
          details: z.string().trim().min(3).max(3000),
          externalReference: z.string().trim().min(2).max(300),
        })
        .parse(req.body);
      if (!c.labRequest)
        failure(409, "The customer has not requested a lab order.");
      c.labRequest = {
        ...c.labRequest!,
        ...data,
        status: "ordered",
        orderedAt: now(),
      };
      c.draft = undefined;
      await save(c, expected, u.id, "external-lab-order-recorded");
      res.json(c);
    }),
  );
  app.put("/api/cases/:id/documents/:documentId/kind", route(async (req, res) => {
    const [c,u] = await getCase(req,"practitioner"); enrolled(c); unpublished(c);
    const expected = revision(req,c);
    const input = z.object({kind:z.enum(documentKinds)}).parse(req.body);
    const d = c.documents.find(d=>d.id===req.params.documentId && d.purpose==="lab");
    if(!d) failure(404,"Supporting document not found.");
    if(d!.kind!==input.kind){d!.kind=input.kind; d!.extraction=undefined; d!.verifiedAt=undefined; d!.verifiedBy=undefined; d!.verificationNote=undefined; d!.criticalReview=undefined; c.draft=undefined;}
    await save(c,expected,u.id,"document-type-confirmed"); res.json(c);
  }));
  app.post(
    "/api/cases/:id/labs/:documentId/extract",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      if (!c.aiConsent)
        failure(409, "The customer has not consented to AI processing.");
      const d = c.documents.find(
        (d) => d.id === req.params.documentId && d.purpose === "lab",
      );
      if (!d) failure(404, "Lab document not found.");
      if (d!.kind !== "laboratory-results") failure(409,"Classify this as original laboratory results before extracting measurements.");
      const file = await store.get<Attachment>("attachment", d!.id);
      if (!file) failure(404, "Source document not found.");
      d!.extraction = await extractLabs(file!);
      d!.verifiedAt = undefined;
      d!.verifiedBy = undefined;
      d!.criticalReview = undefined;
      c.draft = undefined;
      await save(c, expected, u.id, "lab-extracted");
      res.json(c);
    }),
  );
  app.put(
    "/api/cases/:id/labs/:documentId/verify",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      enrolled(c);
      unpublished(c);
      const expected = revision(req, c);
      const data = z
        .object({
          extraction: extractionSchema,
          identityConfirmed: z.literal(true),
          verificationNote: z.string().trim().min(3).max(2000),
        })
        .parse(req.body);
      if (!data.extraction.results.length)
        failure(400, "Enter at least one lab result.");
      const d = c.documents.find(
        (d) => d.id === req.params.documentId && d.purpose === "lab",
      );
      if (!d) failure(404, "Lab document not found.");
      const problems = verificationProblems({...d!,extraction:data.extraction});
      if(problems.length) failure(409,problems.join(" "));
      d!.extraction = data.extraction;
      d!.verifiedAt = now();
      d!.verifiedBy = u.id;
      d!.verificationNote = data.verificationNote;
      d!.criticalReview = undefined;
      c.draft = undefined;
      await save(c, expected, u.id, "lab-verified");
      res.json(c);
    }),
  );
  app.put(
    "/api/cases/:id/review",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      const expected = revision(req, c);
      const data = z
        .object({
          practitionerNotes: z.string().max(10000),
          followupRequest: z.string().max(5000),
        })
        .parse(req.body);
      c.practitionerNotes = data.practitionerNotes;
      if(c.followupRequest !== data.followupRequest)c.followupResponse=undefined;
      c.followupRequest = data.followupRequest;
      c.draft = undefined;
      await save(c, expected, u.id, "practitioner-review-saved");
      res.json(c);
    }),
  );
  app.put("/api/cases/:id/labs/:documentId/critical-review",route(async(req,res)=>{
    const [c,u]=await getCase(req,"practitioner"); enrolled(c); unpublished(c);
    const expected=revision(req,c);
    const input=z.object({confirmed:z.literal(true),action:z.string().trim().min(10).max(3000)}).parse(req.body);
    const d=c.documents.find(d=>d.id===req.params.documentId && d.kind==="laboratory-results" && d.verifiedAt);
    if(!d?.extraction?.results.some(r=>r.flag==="critical")) failure(409,"No verified critical laboratory flag is recorded here.");
    d!.criticalReview={reviewedAt:now(),reviewedBy:u.id,action:input.action};c.draft=undefined;
    await save(c,expected,u.id,"critical-result-followup-recorded");res.json(c);
  }));
  function ready(c: CareCase) {
    const blockers=reviewBlockers(c);
    if(blockers.length) failure(409,blockers.join(" "));
  }
  app.post(
    "/api/cases/:id/draft",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      const expected = revision(req, c);
      ready(c);
      const useAi = req.body.ai === true;
      if (useAi && !c.aiConsent)
        failure(409, "The customer has not consented to AI processing.");
      const content = useAi
        ? await draftAssessment(c)
        : reportSchema.parse(req.body.content);
      c.draft = {
        content,
        author: u.id,
        createdAt: now(),
        source: useAi ? "ai" : "manual",
        basedOnRevision: expected + 1,
      };
      await save(
        c,
        expected,
        u.id,
        useAi ? "ai-draft-created" : "report-draft-saved",
      );
      res.json(c);
    }),
  );
  app.post(
    "/api/cases/:id/approve",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "practitioner");
      const expected = revision(req, c);
      ready(c);
      z.object({ confirmation: z.literal(true) }).parse(req.body);
      if (!c.draft || c.draft.basedOnRevision !== c.revision)
        failure(409, "Save a current draft before releasing it.");
      if (Object.values(c.draft!.content).some((v) => !v.trim()))
        failure(400, "Complete every report section before release.");
      c.reports.push({
        id: randomUUID(),
        content: c.draft!.content,
        createdAt: c.draft!.createdAt,
        author: u.name,
        approvedAt: now(),
        sourceRevision: c.revision,
      });
      c.draft = undefined;
      await save(c, expected, u.id, "report-approved-and-released");
      res.json(c);
    }),
  );
  const billing = platform(app, store, suppliedStore ? undefined : httpServer);
  app.post(
    "/api/cases/:id/checkout",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      const expected = revision(req, c);
      if (c.payment.status !== "pending") failure(409, "This case does not need a payment.");
      const purchase = await billing.order("care", c.id, u.email, "Shamba Sana Integrative Care Pilot", c.payment.amount);
      const result = await billing.checkout(purchase.id, "/#/dashboard?payment=returned");
      c.payment.checkoutId = result.order.checkoutId;
      await save(c, expected, u.id, "checkout-created");
      res.json({ url: result.url });
    }),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API endpoint not found." }),
  );
  app.use(
    "/api",
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status =
        err instanceof z.ZodError
          ? 400
          : err instanceof ConflictError
            ? 409
            : err.status || 500;
      res.status(status).json({
        message:
          err instanceof z.ZodError
            ? "Some fields are missing or invalid. Check your entries."
            : status < 500 || err.status
              ? err.message
              : "Unable to complete this request. Please try again.",
      });
    },
  );
  return httpServer;
}
