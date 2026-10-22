import { createHash } from "node:crypto";
import { billingMode } from "./billing";
import { automationMode } from "./institute-onboarding";
import { GoogleFailure, InstituteGoogle } from "./institute-google";
import type { CareStore } from "./care-store";

// This diagnostic is independent of enrollment jobs. It cannot unlock a paid course.
export const deliveryCheckRecipient = "langa@liferx.us";
const steps = ["receipt", "payment-invitation", "welcome", "classroom", "class-access"] as const;
type Step = typeof steps[number];
type Result = { status: "sending" | "sent" | "failed" | "uncertain"; startedAt: string; providerId?: string; error?: string };
type Check = { id: string; revision: number; courseId: string; recipient: string; results: Partial<Record<Step, Result>> };
export function deliveryCheckCourse() { return /^\d{1,80}$/.test(process.env.INSTITUTE_TEST_CLASSROOM_ID || "") ? process.env.INSTITUTE_TEST_CLASSROOM_ID! : undefined; }
const reject = (status: number, message: string): never => { throw Object.assign(new Error(message), { status, expose: true }); };
export class InstituteDeliveryCheck {
  constructor(private store: CareStore) {}
  private id(courseId: string) { return createHash("sha256").update(`google-delivery-check-v1:${courseId}:${deliveryCheckRecipient}`).digest("hex"); }
  async status() {
    const courseId = deliveryCheckCourse();
    return { recipient: deliveryCheckRecipient, courseId, enabled: !!courseId && billingMode() === "sandbox" && automationMode() === "sandbox", check: courseId ? await this.store.get<Check>("institute-delivery-check", this.id(courseId)) : undefined };
  }
  async run(expectedRevision: number | null, checkedProviderHistory: boolean) {
    const courseId = deliveryCheckCourse();
    if (!courseId || billingMode() !== "sandbox" || automationMode() !== "sandbox") reject(409, "Delivery checks require sandbox billing, sandbox automation and a configured test class.");
    const id = this.id(courseId!);
    let check = await this.store.get<Check>("institute-delivery-check", id);
    if ((check?.revision ?? null) !== expectedRevision) reject(409, "Refresh the delivery check before continuing.");
    if (!check) {
      check = { id, revision: 0, courseId: courseId!, recipient: deliveryCheckRecipient, results: {} };
      await this.store.put("institute-delivery-check", id, check);
    }
    const step = steps.find(name => check!.results[name]?.status !== "sent");
    if (!step) return this.status();
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
      welcome: { subject: "Payment confirmation and welcome", text: "This checks delivery of the welcome email. The $1,350 payment flow is a sandbox test; this email does not confirm a real payment or enrollment." },
      "class-access": { subject: "Class joining instructions", text: "The test-class invitation request was accepted by Google (or an invitation/membership already existed). Sign in as langa@liferx.us at https://classroom.google.com/ to review it. This grants access only to the dedicated test class." },
    };
    try {
      const providerId = step === "classroom" ? await google.invite(courseId!, deliveryCheckRecipient) : await google.send({ to: deliveryCheckRecipient, subject: `[TEST ONLY] Shamba Sana — ${copy[step].subject}`, text: `TEST ONLY — Institute delivery check\n\n${copy[step].text}\n\nNo real course enrollment is granted.\nTeaching mailbox: onlineclass@liferx.us\nTest class ID: ${courseId}` }, `${id}-${step}`);
      await save({ status: "sent", startedAt, providerId });
    } catch (error) {
      const uncertain = !(error instanceof GoogleFailure) || error.uncertain;
      await save({ status: uncertain ? "uncertain" : "failed", startedAt, error: error instanceof GoogleFailure ? `Google returned ${error.status}. Check mailbox permissions and test-class ownership.` : "Delivery outcome is uncertain. Check Google Sent / Classroom before retrying." });
    }
    return this.status();
  }
}
