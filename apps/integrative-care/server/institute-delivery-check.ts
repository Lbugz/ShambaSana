import { createHash } from "node:crypto";
import { billingMode, type Enrollment, type Purchase } from "./billing";
import { automationMode, type OnboardingJob } from "./institute-onboarding";
import { GoogleFailure, InstituteGoogle, unseal } from "./institute-google";
import type { CareStore } from "./care-store";

// Delivery rehearsal reads enrollment copy but never changes enrollment or grants paid-course access.
export const deliveryCheckRecipient = "langa@liferx.us";
const steps = ["receipt", "payment-invitation", "welcome", "classroom", "class-access"] as const;
type Step = typeof steps[number];
type Result = { status: "sending" | "sent" | "failed" | "uncertain"; startedAt: string; providerId?: string; error?: string };
type Check = { id: string; revision: number; courseId: string; recipient: string; results: Partial<Record<Step, Result>> };
export function deliveryCheckCourse() { return /^\d{1,80}$/.test(process.env.INSTITUTE_TEST_CLASSROOM_ID || "") ? process.env.INSTITUTE_TEST_CLASSROOM_ID! : undefined; }
const reject = (status: number, message: string): never => { throw Object.assign(new Error(message), { status, expose: true }); };
export class InstituteDeliveryCheck {
  constructor(private store: CareStore) {}
  private id(courseId: string, enrollmentId?: string) { return createHash("sha256").update(`google-delivery-check-v2:${courseId}:${deliveryCheckRecipient}:${enrollmentId || "diagnostic"}`).digest("hex"); }
  private async enrollment(id?: string) {
    if (!id) return undefined;
    const e = await this.store.get<Enrollment>("enrollment", id);
    const purchase = e?.purchaseId ? await this.store.get<Purchase>("purchase", e.purchaseId) : undefined;
    if (!e || e.email.toLowerCase() !== deliveryCheckRecipient || e.status !== "paid" || !e.sandboxPayment || !purchase || purchase.livemode !== false || purchase.status !== "paid") reject(409, "Select a paid sandbox enrollment for the designated test recipient.");
    return e;
  }
  async status(enrollmentId?: string) {
    await this.enrollment(enrollmentId);
    const courseId = deliveryCheckCourse();
    return { recipient: deliveryCheckRecipient, courseId, enabled: !!courseId && billingMode("institute") === "sandbox" && automationMode() === "sandbox", check: courseId ? await this.store.get<Check>("institute-delivery-check", this.id(courseId, enrollmentId)) : undefined };
  }
  async run(expectedRevision: number | null, checkedProviderHistory: boolean, enrollmentId?: string) {
    const courseId = deliveryCheckCourse();
    if (!courseId || billingMode("institute") !== "sandbox" || automationMode() !== "sandbox") reject(409, "Delivery checks require sandbox billing, sandbox automation and a configured test class.");
    const enrollment = await this.enrollment(enrollmentId);
    const id = this.id(courseId!, enrollmentId);
    let check = await this.store.get<Check>("institute-delivery-check", id);
    if ((check?.revision ?? null) !== expectedRevision) reject(409, "Refresh the delivery check before continuing.");
    if (!check) {
      check = { id, revision: 0, courseId: courseId!, recipient: deliveryCheckRecipient, results: {} };
      await this.store.put("institute-delivery-check", id, check);
    }
    const step = steps.find(name => check!.results[name]?.status !== "sent");
    if (!step) return this.status(enrollmentId);
    const previous = check.results[step];
    if (previous?.status === "sending" && Date.now() - Date.parse(previous.startedAt) < 120000) reject(409, "This delivery check is still running.");
    if ((previous?.status === "uncertain" || previous?.status === "sending") && !checkedProviderHistory) reject(409, "Check Google Sent and the test class before retrying an uncertain request.");
    const save = async (result: Result) => {
      const next = { ...check!, revision: check!.revision + 1, results: { ...check!.results, [step]: result } };
      await this.store.put("institute-delivery-check", id, next, check!.revision);
      check = next;
    };
    const startedAt = new Date().toISOString();
    await save({ status: "sending", startedAt }); // CAS prevents two staff clicks sending twice.
    const google = new InstituteGoogle(this.store);
    const copy: Record<Exclude<Step, "classroom">, { subject: string; text: string }> = {
      receipt: { subject: "Registration receipt", text: "This confirms the Institute registration receipt email can be delivered. No student registration was created." },
      "payment-invitation": { subject: "Payment invitation", text: "This checks delivery of a tuition payment invitation. Stripe remains in sandbox. No payment is requested by this test email." },
      welcome: { subject: "Payment confirmation and welcome", text: "This checks delivery of the welcome email. The $2,000 semester payment flow is a sandbox test; this email does not confirm a real payment or enrollment." },
      "class-access": { subject: "Class joining instructions", text: "The test-class invitation request was accepted by Google (or an invitation/membership already existed). Sign in as langa@liferx.us at https://classroom.google.com/ to review it. This grants access only to the dedicated test class." },
    };
    try {
      let subject = step === "classroom" ? "Classroom invitation" : copy[step].subject;
      let text = step === "classroom" ? "" : copy[step].text;
      if (enrollment && step !== "classroom") {
        const jobs = (await this.store.list<OnboardingJob>("institute-job")).filter(j => j.enrollmentId === enrollment.id && j.purpose === step).sort((a,b) => b.version - a.version);
        if (!jobs[0]) reject(409, "Process the selected enrollment's onboarding jobs before sending this step.");
        const payload = unseal<{to: string; subject: string; text: string}>(jobs[0].encryptedPayload);
        if (payload.to.toLowerCase() !== deliveryCheckRecipient) reject(409, "The onboarding recipient does not match the test recipient.");
        subject = payload.subject;
        text = step === "class-access" ? payload.text.replace("SANDBOX SIMULATION — no Classroom invitation was issued.", "TEST ONLY — joining instructions apply to the dedicated test class, not a paid course.") : payload.text;
      }
      const providerId = step === "classroom" ? await google.invite(courseId!, deliveryCheckRecipient) : await google.send({ to: deliveryCheckRecipient, subject: `[TEST ONLY] Shamba Sana — ${subject}`, text: `TEST ONLY — Institute delivery rehearsal\n\n${enrollment ? "This is an already-paid sandbox record." : "This is a delivery diagnostic."} No new payment is requested. Only the dedicated test class may be used.\n\n${text}\n\nNo real course enrollment is granted.\nTeaching mailbox: onlineclass@liferx.us\nTest class ID: ${courseId}` }, `${id}-${step}`);
      await save({ status: "sent", startedAt, providerId });
    } catch (error) {
      const uncertain = !(error instanceof GoogleFailure) || error.uncertain;
      await save({ status: uncertain ? "uncertain" : "failed", startedAt, error: error instanceof GoogleFailure ? `Google returned ${error.status}. Check mailbox permissions and test-class ownership.` : "Delivery outcome is uncertain. Check Google Sent / Classroom before retrying." });
    }
    return this.status(enrollmentId);
  }
}
