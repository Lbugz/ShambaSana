import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
  createHmac,
} from "node:crypto";
import { z } from "zod";
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
const checkoutConfigured = () =>
  !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.APP_BASE_URL
  );
const now = () => new Date().toISOString();
function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  const computed = scryptSync(password, salt, 64);
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
    documents: c.documents.map((d) =>
      d.verifiedAt ? d : { ...d, extraction: undefined },
    ),
  };
}
export async function registerRoutes(
  httpServer: Server,
  app: Express,
  suppliedStore?: CareStore,
): Promise<Server> {
  const store = suppliedStore || (await createCareStore());
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
        passwordHash: passwordHash(process.env.PRACTITIONER_PASSWORD),
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
      req.path !== "/stripe/webhook"
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
  app.get("/api/config", (_req, res) =>
    res.json({
      pilot: pilotMode(),
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
        passwordHash: passwordHash(data.password),
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
      const valid = verifyPassword(
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
        c.followupRequest = "";
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
      const file = await store.get<Attachment>("attachment", d!.id);
      if (!file) failure(404, "Source document not found.");
      d!.extraction = await extractLabs(file!);
      d!.verifiedAt = undefined;
      d!.verifiedBy = undefined;
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
      d!.extraction = data.extraction;
      d!.verifiedAt = now();
      d!.verifiedBy = u.id;
      d!.verificationNote = data.verificationNote;
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
      c.followupRequest = data.followupRequest;
      c.draft = undefined;
      await save(c, expected, u.id, "practitioner-review-saved");
      res.json(c);
    }),
  );
  function ready(c: CareCase) {
    enrolled(c);
    if (!c.intakeSubmittedAt || intakeErrors(c.intake).length)
      failure(409, "Complete and submit the intake first.");
    const labs = c.documents.filter((d) => d.purpose === "lab");
    if (!labs.length || labs.some((d) => !d.verifiedAt))
      failure(
        409,
        "Verify all uploaded lab documents before drafting a combined report.",
      );
    if (c.followupRequest)
      failure(
        409,
        "Resolve the follow-up request before drafting or releasing a report.",
      );
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
  app.post(
    "/api/cases/:id/checkout",
    route(async (req, res) => {
      const [c, u] = await getCase(req, "customer");
      const expected = revision(req, c);
      if (!checkoutConfigured()) failure(503, "Payment is not configured.");
      if (c.payment.status !== "pending")
        failure(409, "This case does not need a payment.");
      if (c.payment.checkoutId) {
        const previous = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(c.payment.checkoutId)}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            },
            signal: AbortSignal.timeout(20000),
          },
        );
        if (!previous.ok)
          failure(
            502,
            "Unable to check your existing payment session. Please try again.",
          );
        const existing = (await previous.json()) as {
          status: string;
          url?: string;
        };
        if (
          existing.status === "open" &&
          existing.url?.startsWith("https://checkout.stripe.com/")
        ) {
          res.json({ url: existing.url });
          return;
        }
        if (existing.status === "complete")
          failure(
            409,
            "Your checkout is complete. Refresh your case while payment confirmation arrives.",
          );
        if (existing.status !== "expired")
          failure(409, "Unable to open another payment session yet.");
      }
      const base = new URL(process.env.APP_BASE_URL!).origin;
      const body = new URLSearchParams({
        mode: "payment",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(c.payment.amount),
        "line_items[0][price_data][product_data][name]":
          "Shamba Sana Integrative Care Pilot",
        "line_items[0][quantity]": "1",
        "metadata[caseId]": c.id,
        "payment_intent_data[metadata][caseId]": c.id,
        client_reference_id: c.id,
        customer_email: u.email,
        success_url: `${base}/#/dashboard?payment=returned`,
        cancel_url: `${base}/#/dashboard?payment=canceled`,
      });
      const payment = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Idempotency-Key": `shamba-${c.id}-${expected}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
          signal: AbortSignal.timeout(20000),
        },
      );
      if (!payment.ok)
        failure(
          502,
          "Payment service is unavailable. No payment status was changed.",
        );
      const result = (await payment.json()) as { id: string; url: string };
      if (!result.id || !result.url?.startsWith("https://checkout.stripe.com/"))
        failure(502, "Payment service returned an invalid session.");
      c.payment.checkoutId = result.id;
      await save(c, expected, u.id, "checkout-created");
      res.json({ url: result.url });
    }),
  );
  app.post(
    "/api/stripe/webhook",
    route(async (req, res) => {
      if (!process.env.STRIPE_WEBHOOK_SECRET)
        failure(503, "Payment webhook is not configured.");
      const parts = (req.get("stripe-signature") || "").split(",");
      const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2) || "";
      const wanted = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!)
        .update(`${timestamp}.`)
        .update(req.rawBody as Buffer)
        .digest();
      const valid =
        /^\d+$/.test(timestamp) &&
        Math.abs(Date.now() / 1000 - Number(timestamp)) < 300 &&
        parts
          .filter((p) => p.startsWith("v1="))
          .some((p) => {
            const b = Buffer.from(p.slice(3), "hex");
            return b.length === wanted.length && timingSafeEqual(b, wanted);
          });
      if (!valid) failure(400, "Invalid payment signature.");
      const event = req.body;
      if (
        [
          "checkout.session.completed",
          "checkout.session.async_payment_succeeded",
        ].includes(event.type)
      ) {
        const obj = event.data?.object;
        const id = obj?.metadata?.caseId;
        for (let attempt = 0; attempt < 3; attempt++) {
          const c =
            typeof id === "string"
              ? await store.get<CareCase>("case", id)
              : undefined;
          if (!c || c.payment.status === "paid") break;
          if (
            obj.payment_status !== "paid" ||
            obj.id !== c.payment.checkoutId ||
            obj.amount_total !== c.payment.amount ||
            obj.currency !== "usd"
          )
            failure(400, "Payment does not match the case.");
          const expected = c.revision;
          c.payment.status = "paid";
          c.payment.paymentIntent =
            typeof obj.payment_intent === "string"
              ? obj.payment_intent
              : undefined;
          try {
            await save(c, expected, "stripe", "payment-confirmed");
            break;
          } catch (e) {
            if (!(e instanceof ConflictError) || attempt === 2) throw e;
          }
        }
      }
      if (event.type === "charge.refunded") {
        const obj = event.data?.object;
        const id = obj?.metadata?.caseId;
        for (let attempt = 0; attempt < 3; attempt++) {
          const c =
            typeof id === "string"
              ? await store.get<CareCase>("case", id)
              : undefined;
          if (
            !c ||
            c.payment.status === "refunded" ||
            obj.amount_refunded < obj.amount
          )
            break;
          if (
            obj.payment_intent !== c.payment.paymentIntent ||
            obj.amount !== c.payment.amount ||
            obj.currency !== "usd"
          )
            failure(400, "Refund does not match the case.");
          const expected = c.revision;
          c.payment.status = "refunded";
          c.draft = undefined;
          try {
            await save(c, expected, "stripe", "full-refund-recorded");
            break;
          } catch (e) {
            if (!(e instanceof ConflictError) || attempt === 2) throw e;
          }
        }
      }
      res.json({ received: true });
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
