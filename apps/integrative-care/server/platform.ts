import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Billing, billingConfigured, courseNames, coursePrice, verifyServiceKey, verifyPaymentToken, issuePaymentToken, paymentTokenHash, type Enrollment, type Purchase } from "./billing";
import { ConflictError, type CareStore } from "./care-store";
import type { CareCase, User } from "../shared/care";

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };
const fail = (status: number, message: string): never => { throw Object.assign(new Error(message), { status }); };
function practitioner(req: Request) {
  const user = (req as Request & { careUser?: User }).careUser;
  if (user?.role !== "practitioner") fail(403, "Practitioner sign-in required.");
}

export function platform(app: Express, store: CareStore) {
  const apply = async (purchase: Purchase) => {
    // Always reload the durable billing status: an older delivery cannot undo a refund.
    for (let attempt = 0; attempt < 5; attempt++) {
      const latest = (await store.get<Purchase>("purchase", purchase.id))!;
      const kind = latest.offering === "care" ? "case" : "enrollment";
      const record = await store.get<CareCase | Enrollment>(kind, latest.referenceId);
      if (!record) fail(409, "Purchase destination is missing.");
      const revision = record!.revision;
      if (kind === "case") {
        const c = record as CareCase;
        if (c.payment.status === "refunded" || c.payment.status === latest.status) return;
        if (latest.status === "pending") return;
        c.payment = { ...c.payment, status: latest.status, checkoutId: latest.checkoutId, paymentIntent: latest.paymentIntent };
        c.updatedAt = new Date().toISOString();
        if (latest.status === "refunded") c.draft = undefined;
        c.events.push({ at: c.updatedAt, actor: "stripe", action: latest.status === "paid" ? "payment-confirmed" : "full-refund-recorded" });
      } else {
        const enrollment = record as Enrollment;
        if (enrollment.status === "refunded" || latest.status === "pending" || enrollment.status === latest.status) return;
        enrollment.status = latest.status;
      }
      record!.revision++;
      try { await store.put(kind, record!.id, record, revision); return; }
      catch (error) { if (!(error instanceof ConflictError) || attempt === 4) throw error; }
    }
  };
  const billing = new Billing(store, apply);
  billing.registerWebhook(app);

  // Only the website server can submit a registration. Enrollment stays under review.
  app.post("/api/institute/registrations", wrap(async (req, res) => {
    verifyServiceKey(req);
    if (process.env.INSTITUTE_REGISTRATION_OPEN !== "true") fail(503, "Course registration is closed.");
    const input = z.object({ reference: z.string().regex(/^SS-[a-f0-9-]{36}$/), course: z.enum(courseNames), term: z.enum(["Spring 2027", "Summer 2027"]), foundationsStatus: z.enum(["completed", "in-progress", "not-started"]), psycheStatus: z.enum(["completed", "in-progress", "registered", "not-started"]).optional(), priorCohort: z.string().trim().max(240), prerequisiteAcknowledgement: z.literal(true), name: z.string().trim().min(2).max(120), email: z.string().email().max(254), phone: z.string().max(40), timezone: z.string().max(80), message: z.string().max(1000), consent: z.literal(true) }).parse(req.body);
    const expectedTerm = input.course === courseNames[1] ? "Spring 2027" : input.course === courseNames[2] ? "Summer 2027" : undefined;
    if (!expectedTerm || input.term !== expectedTerm || (input.course === courseNames[2] && !input.psycheStatus)) fail(400, "Check the selected term and prerequisite information. Fall 2026 registration is closed.");
    const allowed = (process.env.INSTITUTE_OPEN_COURSES || courseNames.slice(1).join("|")).split("|").map(course => course.trim());
    if (!allowed.includes(input.course)) fail(503, "This course is not open.");
    const enrollment: Enrollment = { ...input, id: input.reference, revision: 0, createdAt: new Date().toISOString(), status: "review" };
    try { await store.put("enrollment", enrollment.id, enrollment); }
    catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      const old = await store.get<Enrollment>("enrollment", enrollment.id);
      if (old?.email !== input.email || old?.course !== input.course) throw error;
    }
    res.json({ received: true, reference: enrollment.id });
  }));

  app.get("/api/billing/admin", wrap(async (req, res) => {
    practitioner(req);
    const orders = await store.list<Purchase>("purchase");
    const enrollments = await store.list<Enrollment>("enrollment");
    res.json({ orders, enrollments: enrollments.map(({ accessHash: _, ...e }) => e) });
  }));
  app.post("/api/institute/enrollments/:id/invite", wrap(async (req, res) => {
    practitioner(req);
    if (!billingConfigured()) fail(503, "Checkout is not configured.");
    if (!process.env.INSTITUTE_WEBSITE_URL) fail(503, "The Institute website is not configured.");
    const data = z.object({ revision: z.number().int().nonnegative(), cohort: z.string().trim().min(3).max(500), policyUrl: z.string().url().max(2000), confirm: z.literal(true), prerequisitesReviewed: z.literal(true) }).parse(req.body);
    const policy = new URL(data.policyUrl);
    if (policy.protocol !== "https:" || policy.origin !== new URL(process.env.INSTITUTE_WEBSITE_URL!).origin) fail(400, "Use a published student policy on the Institute website.");
    const e = await store.get<Enrollment>("enrollment", req.params.id);
    if (!e || !["review", "payment-ready"].includes(e.status)) fail(409, "Enrollment is not awaiting payment.");
    if (e!.revision !== data.revision) throw new ConflictError();
    const token = issuePaymentToken();
    const purchase = await billing.order("institute", e!.id, e!.email, `Shamba Sana Institute — ${e!.course}`, coursePrice);
    if (purchase.status !== "pending" || purchase.checkoutId) fail(409, "Checkout has already started. Resolve the existing payment before replacing its invitation.");
    await store.put("enrollment", e!.id, { ...e, revision: e!.revision + 1, status: "payment-ready", purchaseId: purchase.id, accessHash: paymentTokenHash(token), policyUrl: data.policyUrl, cohort: data.cohort, prerequisitesReviewedAt: new Date().toISOString(), policyAcceptedAt: undefined }, e!.revision);
    res.json({ url: `${new URL(process.env.APP_BASE_URL!).origin}/#/course-payment?enrollment=${encodeURIComponent(e!.id)}&token=${token}` });
  }));
  app.post("/api/institute/payment", wrap(async (req, res) => {
    const input = z.object({ enrollment: z.string().max(100), token: z.string().max(128), checkout: z.boolean().optional(), acceptPolicies: z.boolean().optional() }).parse(req.body);
    const e = await store.get<Enrollment>("enrollment", input.enrollment);
    verifyPaymentToken(input.token, e);
    if (!input.checkout) return res.json({ course: e!.course, cohort: e!.cohort, policyUrl: e!.policyUrl, amount: coursePrice, status: e!.status });
    if (input.acceptPolicies !== true || e!.status !== "payment-ready" || !e!.purchaseId) fail(409, "Review the course policies before checkout.");
    if (!e!.policyAcceptedAt) {
      const revision = e!.revision;
      e!.policyAcceptedAt = new Date().toISOString(); e!.revision++;
      await store.put("enrollment", e!.id, e, revision);
    }
    const result = await billing.checkout(e!.purchaseId!, `/#/course-payment?enrollment=${encodeURIComponent(e!.id)}&token=${input.token}`);
    res.json({ url: result.url });
  }));
  return billing;
}
