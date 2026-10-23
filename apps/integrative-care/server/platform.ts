import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Billing, billingConfigured, billingMode, courseNames, verifyServiceKey, verifyPaymentToken, paymentTokenHash, type Enrollment, type Purchase } from "./billing";
import type { Server } from "node:http";
import { randomBytes, createHash } from "node:crypto";
import { InstituteOnboarding, automationMode, invitationToken, type OnboardingJob } from "./institute-onboarding";
import { googleConfigured, googleRedirect, googleScopes, instituteEmail, seal, unseal, type GoogleConnection } from "./institute-google";
import { ConflictError, type CareStore } from "./care-store";
import type { CareCase, User } from "../shared/care";
import { InstituteDeliveryCheck, deliveryCheckRecipient, deliveryCheckCourse } from "./institute-delivery-check";
import { semesterPrice, semesterDescription } from "./institute-offerings";
import { InstitutePayments, currentPaymentTermsVersion } from "./institute-payments";
import { instituteLaunchDetails } from "./payment-config";
import { instituteReadiness } from "./institute-readiness";

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };
const fail = (status: number, message: string): never => { throw Object.assign(new Error(message), { status, expose: true }); };
function practitioner(req: Request) {
  const user = (req as Request & { careUser?: User }).careUser;
  if (user?.role !== "practitioner") fail(403, "Practitioner sign-in required.");
}

export function platform(app: Express, store: CareStore, httpServer?: Server) {
  const onboarding = new InstituteOnboarding(store);
  const deliveryCheck = new InstituteDeliveryCheck(store);
  const reconcile = async (e: Enrollment) => {
    try { await onboarding.reconcile(e); } catch { console.error("Institute onboarding reconciliation deferred."); }
  };
  if (httpServer) {
    const tick = () => { void onboarding.tick().catch(() => console.error("Institute onboarding worker needs attention.")); };
    const timer = setInterval(tick, 15000); timer.unref();
    httpServer.once("listening", tick);
    httpServer.once("close", () => clearInterval(timer));
  }
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
        if (enrollment.status === "refunded" || latest.status === "pending" || enrollment.status === latest.status) { await reconcile(enrollment); return; }
        enrollment.status = latest.status;
        const testClass = deliveryCheckCourse();
        if (latest.directCheckout && !latest.livemode && latest.status === "paid" && enrollment.course === courseNames[0] && enrollment.semester === 1 && testClass) {
          enrollment.classroomCourseId = testClass;
          enrollment.accessApprovedAt = new Date().toISOString();
          enrollment.accessVersion = 1;
        }
        const launch = instituteLaunchDetails();
        if (latest.directCheckout && latest.livemode && latest.status === "paid" && enrollment.course === courseNames[0] && enrollment.semester === 1 && launch.ready && process.env.INSTITUTE_FOUNDATIONS_1_AUTO_ACCESS_APPROVED === "true") {
          enrollment.classroomCourseId = launch.classroom;
          enrollment.orientationUrl = launch.orientation;
          enrollment.accessApprovedAt = new Date().toISOString();
          enrollment.accessVersion = 1;
        }
      }
      record!.revision++;
      try { await store.put(kind, record!.id, record, revision); if (kind === "enrollment") await reconcile(record as Enrollment); return; }
      catch (error) { if (!(error instanceof ConflictError) || attempt === 4) throw error; }
    }
  };
  const billing = new Billing(store, apply);
  const semesterPayments = new InstitutePayments(store, billing, apply);
  billing.instituteEvent = event => semesterPayments.event(event);
  billing.registerWebhook(app);
  app.get("/api/institute/registration-settings", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ paymentMode: billingMode("institute"), paymentTermsVersion: currentPaymentTermsVersion(), liveCheckoutOpen: billingMode("institute") === "live" && billingConfigured("institute") });
  });

  // Only the website server can submit a registration. Enrollment stays under review.
  app.post("/api/institute/registrations", wrap(async (req, res) => {
    verifyServiceKey(req);
    if (process.env.INSTITUTE_REGISTRATION_OPEN !== "true") fail(503, "Course registration is closed.");
    const input = z.object({ reference: z.string().regex(/^SS-[a-f0-9-]{36}$/), course: z.enum(courseNames), semester: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1), learningFormat: z.enum(["live-online", "self-paced"]).default("live-online"), term: z.enum(["Fall 2026", "Spring 2027", "Summer 2027", "To be confirmed"]), foundationsStatus: z.enum(["completed", "in-progress", "registered", "not-started"]), psycheStatus: z.enum(["completed", "in-progress", "registered", "not-started"]).optional(), priorCohort: z.string().trim().max(240), prerequisiteAcknowledgement: z.literal(true), name: z.string().trim().min(2).max(120), email: z.string().email().max(254), phone: z.string().max(40), timezone: z.string().max(80), message: z.string().max(1000), consent: z.literal(true) }).parse(req.body);
    const foundations = input.course === courseNames[0];
    const expectedTerm = foundations ? ({ 1: "Fall 2026", 2: "Spring 2027", 3: "To be confirmed" } as const)[input.semester] : input.course === courseNames[1] ? "Spring 2027" : "Summer 2027";
    if (input.term !== expectedTerm || (!foundations && (input.semester !== 1 || input.learningFormat !== "live-online")) || (foundations && ((input.semester === 1) !== (input.learningFormat === "self-paced"))) || (input.course === courseNames[2] && !input.psycheStatus)) fail(400, "Check the requested course, semester, format and prerequisite details.");
    const allowed = (process.env.INSTITUTE_OPEN_COURSES || courseNames.slice(1).join("|")).split("|").map(course => course.trim());
    if (!foundations && !allowed.includes(input.course)) fail(503, "Registration review for this course is not open.");
    const payment = z.object({ paymentPlan: z.enum(["full", "monthly"]).optional(), paymentConsent: z.boolean().optional(), paymentTermsVersion: z.string().optional() }).parse(req.body);
    if (payment.paymentPlan && (!foundations || !payment.paymentConsent || payment.paymentTermsVersion !== currentPaymentTermsVersion())) fail(400, "Review the semester payment choice and terms.");
    if (payment.paymentPlan && billingMode("institute") === "live" && !billingConfigured("institute")) fail(503, "Live tuition collection is not open. Contact admissions for enrollment assistance.");
    const enrollment: Enrollment = { ...input, id: input.reference, revision: 0, createdAt: new Date().toISOString(), status: "review", automationVersion: 1, sandboxPayment: billingMode("institute") !== "live", paymentPlan: payment.paymentPlan, paymentTermsVersion: payment.paymentTermsVersion, paymentConsentAt: payment.paymentConsent ? new Date().toISOString() : undefined };
    try { await store.put("enrollment", enrollment.id, enrollment); }
    catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      const old = await store.get<Enrollment>("enrollment", enrollment.id);
      if (old?.email !== input.email || old?.course !== input.course || (old?.semester ?? 1) !== input.semester || (old?.learningFormat ?? "live-online") !== input.learningFormat || old?.term !== input.term || old?.paymentPlan !== payment.paymentPlan) throw error;
    }
    let current = (await store.get<Enrollment>("enrollment", enrollment.id))!;
    let paymentUrl: string | undefined;
    let checkoutUrl: string | undefined;
    // No prerequisite is required for Foundations Semester 1. This draft path
    // simulates eligibility only; all live payments remain explicitly blocked.
    if (payment.paymentPlan && foundations && input.semester === 1 && billingConfigured("institute")) {
      if (current.status === "review") {
        const order = await semesterPayments.order(current, payment.paymentPlan);
        const version = current.revision + 1;
        const token = invitationToken(current.id, version);
        if (current.sandboxPayment !== (order.livemode !== true)) fail(409, "A sandbox registration cannot be reused for live tuition.");
        const launch = instituteLaunchDetails();
        const updated: Enrollment = { ...current, revision: version, status: "payment-ready", purchaseId: order.id, tuitionCents: order.amount, sandboxPayment: order.livemode !== true, accessHash: paymentTokenHash(token), invitationVersion: version, policyAcceptedAt: current.paymentConsentAt, policyUrl: "https://institute.shambasana.com/student-information.html#tuition", cohort: order.livemode ? launch.cohort : "Foundations Semester 1 — self-paced catch-up. Sandbox draft; learning plan, support and access arrangements require confirmation before live enrollment.", orientationUrl: order.livemode ? launch.orientation : undefined, prerequisitesReviewedAt: new Date().toISOString() };
        try { await store.put("enrollment", current.id, updated, current.revision); current = updated; }
        catch (error) { if (!(error instanceof ConflictError)) throw error; current = (await store.get<Enrollment>("enrollment", current.id))!; }
      }
      if (current.status === "payment-ready" && current.invitationVersion && current.purchaseId) {
        const token = invitationToken(current.id, current.invitationVersion);
        const returnPath = `/#/course-payment?enrollment=${encodeURIComponent(current.id)}&token=${token}`;
        paymentUrl = `${new URL(process.env.APP_BASE_URL!).origin}${returnPath}`;
        try { checkoutUrl = (await semesterPayments.checkout(current.purchaseId, returnPath)).url; }
        catch { console.error("Institute checkout deferred; registration and private payment page are preserved."); }
      }
    }
    await reconcile(current);
    res.json({ received: true, reference: enrollment.id, paymentUrl, checkoutUrl, sandbox: current.sandboxPayment !== false });
  }));

  app.get("/api/billing/admin", wrap(async (req, res) => {
    practitioner(req);
    const orders = await store.list<Purchase>("purchase");
    const enrollments = await store.list<Enrollment>("enrollment");
    const connection = await store.get<GoogleConnection>("institute-google", "sender");
    const jobs = await store.list<OnboardingJob>("institute-job");
    res.json({ orders, enrollments: enrollments.map(({ accessHash: _, ...e }) => ({ ...e, paymentAmount: semesterPrice(e) })), automation: { mode: automationMode(), googleConfigured: googleConfigured(), connectedEmail: connection?.email, billingMode: billingMode("institute"), careBillingMode: billingMode(), checkout: billingConfigured("institute") }, readiness: await instituteReadiness(store), jobs: jobs.map(({ encryptedPayload: _, ...job }) => job) });
  }));
  app.post("/api/institute/enrollments/:id/invite", wrap(async (req, res) => {
    practitioner(req);
    if (!billingConfigured("institute")) fail(503, "Institute checkout is not configured or live collection is disabled.");
    if (!process.env.INSTITUTE_WEBSITE_URL) fail(503, "The Institute website is not configured.");
    const data = z.object({ revision: z.number().int().nonnegative(), cohort: z.string().trim().min(3).max(500), policyUrl: z.string().url().max(2000), orientationUrl: z.string().url().max(2000).optional(), classroomCourseId: z.string().regex(/^\d+$/).max(80).optional(), confirm: z.literal(true), prerequisitesReviewed: z.literal(true) }).parse(req.body);
    const policy = new URL(data.policyUrl);
    if (policy.protocol !== "https:" || policy.origin !== new URL(process.env.INSTITUTE_WEBSITE_URL!).origin) fail(400, "Use a published student policy on the Institute website.");
    if (data.orientationUrl && new URL(data.orientationUrl).protocol !== "https:") fail(400, "Orientation must use HTTPS.");
    const e = await store.get<Enrollment>("enrollment", req.params.id);
    if (!e || !["review", "payment-ready"].includes(e.status)) fail(409, "Enrollment is not awaiting payment.");
    if (e!.sandboxPayment !== false && billingMode("institute") === "live") fail(409, "Create a new live registration; do not convert a sandbox record.");
    if (billingMode("institute") === "live" && data.classroomCourseId === deliveryCheckCourse()) fail(409, "The rehearsal classroom cannot be used for live enrollment.");
    if (e!.revision !== data.revision) throw new ConflictError();
    const amount = semesterPrice(e!);
    if (!amount) fail(409, "Semester pricing or learning-format terms need confirmation before a new payment invitation.");
    const version = e!.revision + 1;
    const token = invitationToken(e!.id, version);
    const purchase = e!.paymentPlan ? await semesterPayments.order(e!, e!.paymentPlan) : await billing.order("institute", e!.id, e!.email, `Shamba Sana Institute — ${semesterDescription(e!)}`, amount!);
    if (purchase.amount !== amount) fail(409, "An existing payment has a different price. Staff must reconcile it before proceeding.");
    if (purchase.status !== "pending" || purchase.checkoutId) fail(409, "Checkout has already started. Resolve the existing payment before replacing its invitation.");
    const updated: Enrollment = { ...e!, tuitionCents: purchase.amount, revision: version, status: "payment-ready", purchaseId: purchase.id, accessHash: paymentTokenHash(token), invitationVersion: version, automationVersion: 1, sandboxPayment: purchase.livemode !== true, policyUrl: data.policyUrl, cohort: data.cohort, orientationUrl: data.orientationUrl, classroomCourseId: data.classroomCourseId, prerequisitesReviewedAt: new Date().toISOString(), policyAcceptedAt: undefined };
    await store.put("enrollment", e!.id, updated, e!.revision);
    await reconcile(updated);
    res.json({ url: `${new URL(process.env.APP_BASE_URL!).origin}/#/course-payment?enrollment=${encodeURIComponent(e!.id)}&token=${token}` });
  }));
  app.post("/api/institute/payment", wrap(async (req, res) => {
    const input = z.object({ enrollment: z.string().max(100), token: z.string().max(128), checkout: z.boolean().optional(), acceptPolicies: z.boolean().optional() }).parse(req.body);
    const e = await store.get<Enrollment>("enrollment", input.enrollment);
    verifyPaymentToken(input.token, e);
    const order = e!.purchaseId ? await store.get<Purchase>("purchase", e!.purchaseId) : undefined;
    if (!order) fail(409, "The payment record needs staff review.");
    if (!input.checkout) return res.json({ course: e!.course, semester: e!.semester, learningFormat: e!.learningFormat, cohort: e!.cohort, policyUrl: e!.policyUrl, amount: order!.amount, status: e!.status, paymentPlan: order!.semesterPlan, paidAmount: order!.paidAmount, refundedAmount: order!.refundedAmount, planState: order!.planState, sandbox: e!.sandboxPayment === true, accessApproved: !!e!.accessApprovedAt && !e!.sandboxPayment, orientationUrl: e!.status === "paid" && !e!.sandboxPayment ? e!.orientationUrl : undefined });
    if (input.acceptPolicies !== true || e!.status !== "payment-ready" || !e!.purchaseId) fail(409, "Review the course policies before checkout.");
    if (!e!.policyAcceptedAt) {
      const revision = e!.revision;
      e!.policyAcceptedAt = new Date().toISOString(); e!.revision++;
      await store.put("enrollment", e!.id, e, revision);
    }
    const returnPath = `/#/course-payment?enrollment=${encodeURIComponent(e!.id)}&token=${input.token}`;
    const result = order!.directCheckout ? await semesterPayments.checkout(e!.purchaseId!, returnPath) : await billing.checkout(e!.purchaseId!, returnPath);
    res.json({ url: result.url });
  }));

  app.post("/api/institute/enrollments/:id/access", wrap(async (req, res) => {
    practitioner(req);
    const input = z.object({ revision: z.number().int().nonnegative(), completed: z.literal(true), classroomCourseId: z.string().regex(/^\d+$/).max(80), orientationUrl: z.string().url().max(2000).optional() }).parse(req.body);
    const e = await store.get<Enrollment>("enrollment", req.params.id);
    if (!e || e.status !== "paid") fail(409, "Payment must be confirmed first.");
    if (!e!.sandboxPayment && input.classroomCourseId === deliveryCheckCourse()) fail(409, "The rehearsal classroom cannot be used for live enrollment.");
    if (e!.revision !== input.revision) throw new ConflictError();
    if (input.orientationUrl && new URL(input.orientationUrl).protocol !== "https:") fail(400, "Orientation must use HTTPS.");
    const updated = { ...e!, revision: e!.revision + 1, accessVersion: (e!.accessVersion || 0) + 1, accessApprovedAt: new Date().toISOString(), classroomCourseId: input.classroomCourseId, orientationUrl: input.orientationUrl };
    await store.put("enrollment", e!.id, updated, e!.revision);
    await reconcile(updated);
    res.json({ queued: true, sandbox: e!.sandboxPayment === true || automationMode() !== "live" });
  }));

  app.get("/api/institute/jobs/:id/preview", wrap(async (req, res) => {
    practitioner(req);
    const job = await store.get<OnboardingJob>("institute-job", req.params.id);
    if (!job) fail(404, "Notification not found.");
    res.setHeader("Cache-Control", "no-store");
    res.json(unseal(job!.encryptedPayload));
  }));
  app.post("/api/institute/jobs/:id/retry", wrap(async (req, res) => {
    practitioner(req);
    const input = z.object({ revision: z.number().int().nonnegative(), checkedProviderHistory: z.literal(true) }).parse(req.body);
    const job = await store.get<OnboardingJob>("institute-job", req.params.id);
    if (!job || !["failed", "uncertain"].includes(job.status)) fail(409, "This notification does not need retrying.");
    if (input.revision !== job!.revision) throw new ConflictError();
    await store.put("institute-job", job!.id, { ...job, revision: job!.revision + 1, status: "queued", error: undefined, nextAttemptAt: new Date().toISOString() }, job!.revision);
    res.json({ queued: true });
  }));
  app.post("/api/institute/automation/process", wrap(async (req, res) => { practitioner(req); await onboarding.tick(); res.json({ processed: true }); }));

  const deliveryCheckStaff = (req: Request) => {
    practitioner(req);
    if ((req as Request & { careUser: User }).careUser.email.toLowerCase() !== deliveryCheckRecipient) fail(403, "Only the designated test administrator can run this check.");
  };
  app.get("/api/institute/delivery-check", wrap(async (req, res) => {
    deliveryCheckStaff(req); res.setHeader("Cache-Control", "no-store"); const input = z.object({ enrollment: z.string().regex(/^SS-[a-f0-9-]{36}$/).optional() }).parse(req.query); res.json(await deliveryCheck.status(input.enrollment));
  }));
  app.get("/api/institute/installment-clock", wrap(async (req, res) => {
    deliveryCheckStaff(req); res.setHeader("Cache-Control", "no-store"); res.json(await semesterPayments.clockStatus());
  }));
  app.post("/api/institute/installment-clock", wrap(async (req, res) => {
    deliveryCheckStaff(req);
    if (automationMode() !== "sandbox") fail(409, "Keep onboarding in sandbox for this rehearsal.");
    const { action } = z.object({ action: z.enum(["create", "checkout", "advance"]), confirmSandbox: z.literal(true) }).parse(req.body);
    res.json(action === "create" ? await semesterPayments.createClock() : action === "checkout" ? await semesterPayments.clockCheckout() : await semesterPayments.advanceClock());
  }));
  app.post("/api/institute/delivery-check", wrap(async (req, res) => {
    deliveryCheckStaff(req);
    const input = z.object({ revision: z.number().int().nonnegative().nullable(), confirmRealDelivery: z.literal(true), enrollment: z.string().regex(/^SS-[a-f0-9-]{36}$/).optional(), checkedProviderHistory: z.boolean().optional() }).parse(req.body);
    res.json(await deliveryCheck.run(input.revision, input.checkedProviderHistory === true, input.enrollment));
  }));

  app.post("/api/institute/google/connect", wrap(async (req, res) => {
    practitioner(req);
    if (!googleConfigured()) fail(503, "Configure Google OAuth in Railway first.");
    const state = randomBytes(32).toString("hex");
    await store.put("institute-oauth", createHash("sha256").update(state).digest("hex"), { revision: 0, userId: (req as Request & { careUser: User }).careUser.id, expiresAt: Date.now() + 600000, used: false });
    const query = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: googleRedirect(), response_type: "code", scope: googleScopes.join(" "), access_type: "offline", prompt: "consent", state, login_hint: instituteEmail });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${query}` });
  }));
  app.get("/api/institute/google/callback", wrap(async (req, res) => {
    practitioner(req);
    const input = z.object({ state: z.string().regex(/^[a-f0-9]{64}$/), code: z.string().min(1).max(4096) }).parse(req.query);
    const id = createHash("sha256").update(input.state).digest("hex");
    const state = await store.get<{ revision: number; userId: string; expiresAt: number; used: boolean }>("institute-oauth", id);
    if (!state || state.used || state.expiresAt < Date.now() || state.userId !== (req as Request & { careUser: User }).careUser.id) fail(400, "Google authorization expired. Start again from the staff dashboard.");
    await store.put("institute-oauth", id, { ...state!, used: true, revision: state!.revision + 1 }, state!.revision);
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ code: input.code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: googleRedirect(), grant_type: "authorization_code" }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) fail(400, "Google authorization failed. Reconnect from the staff dashboard.");
    const token = await response.json();
    if (!token.refresh_token || typeof token.access_token !== "string" || !googleScopes.filter(s => s.startsWith("https:")).every(s => String(token.scope).split(" ").includes(s))) fail(400, "The required Google permissions were not granted.");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, signal: AbortSignal.timeout(15000) });
    if (!profileResponse.ok) fail(400, "Google account could not be verified.");
    const profile = await profileResponse.json();
    if (profile.email?.toLowerCase() !== instituteEmail || profile.email_verified !== true) fail(400, "Connect the Institute teaching mailbox.");
    const previous = await store.get<GoogleConnection>("institute-google", "sender");
    await store.put<GoogleConnection>("institute-google", "sender", { revision: previous ? previous.revision + 1 : 0, email: instituteEmail, connectedAt: new Date().toISOString(), encryptedRefreshToken: seal(token.refresh_token) }, previous?.revision);
    res.setHeader("Referrer-Policy", "no-referrer");
    res.redirect(303, "/#/admin/billing?google=connected");
  }));
  return billing;
}
