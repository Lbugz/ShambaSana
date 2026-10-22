import { createHash, createHmac } from "node:crypto";
import type { Enrollment, Purchase } from "./billing";
import { ConflictError, type CareStore } from "./care-store";
import { GoogleFailure, InstituteGoogle, instituteEmail, seal, unseal } from "./institute-google";

type Purpose = "receipt" | "payment-invitation" | "welcome" | "classroom" | "class-access" | "refund";
export type OnboardingJob = { id: string; revision: number; enrollmentId: string; purpose: Purpose; version: number; status: "queued" | "sending" | "sent" | "simulated" | "failed" | "uncertain" | "cancelled"; attempts: number; createdAt: string; nextAttemptAt: string; claimedAt?: string; completedAt?: string; providerId?: string; error?: string; encryptedPayload: string; sandbox: boolean };
type Payload = { to: string; subject: string; text: string; courseId?: string };
export const automationMode = () => process.env.INSTITUTE_AUTOMATION_MODE === "live" ? "live" : process.env.INSTITUTE_AUTOMATION_MODE === "sandbox" ? "sandbox" : "off";
export function invitationToken(id: string, version: number) {
  return createHmac("sha256", process.env.INSTITUTE_SERVICE_TOKEN!).update(`institute-invitation:${id}:${version}`).digest("hex");
}
export function invitationUrl(e: Enrollment) {
  if (!e.invitationVersion) return undefined;
  const token = invitationToken(e.id, e.invitationVersion);
  if (createHash("sha256").update(token).digest("hex") !== e.accessHash) return undefined;
  return `${new URL(process.env.APP_BASE_URL!).origin}/#/course-payment?${new URLSearchParams({ enrollment: e.id, token })}`;
}
export class InstituteOnboarding {
  private running = false;
  private google: InstituteGoogle;
  constructor(private store: CareStore) { this.google = new InstituteGoogle(store); }
  private async queue(e: Enrollment, purpose: Purpose, version: number, payload: Payload, sandbox = false) {
    const id = createHash("sha256").update(`${e.id}:${purpose}:${version}`).digest("hex");
    if (await this.store.get("institute-job", id)) return;
    const at = new Date().toISOString();
    try { await this.store.put<OnboardingJob>("institute-job", id, { id, revision: 0, enrollmentId: e.id, purpose, version, status: "queued", attempts: 0, createdAt: at, nextAttemptAt: at, encryptedPayload: seal(payload), sandbox }); }
    catch (error) { if (!(error instanceof ConflictError)) throw error; }
  }
  async reconcile(e: Enrollment) {
    if (!e.automationVersion) return; // Do not email legacy registrations retroactively.
    const intro = `Hello ${e.name},\n\n${e.course} — ${e.term || "your requested term"}\nReference: ${e.id}\n\n`;
    const footer = `\n\nQuestions? Reply to ${instituteEmail}.\nShamba Sana Institute`;
    const message = (subject: string, text: string): Payload => ({ to: e.email, subject, text: intro + text + footer });
    await this.queue(e, "receipt", 1, message("We received your course registration", "Thank you for registering. We will review your prerequisites and contact you with confirmed course details. This receipt does not confirm admission or reserve a place. No payment has been collected."));
    if (e.status === "payment-ready" && e.invitationVersion) {
      const url = invitationUrl(e);
      if (url) await this.queue(e, "payment-invitation", e.invitationVersion, message("Your course payment invitation", `Review your confirmed course details and student policies using your private invitation:\n${url}\n\nTuition is $1,350 USD, paid in full.\n${e.cohort}\n\nDo not share this private link. Payment does not replace prerequisite completion.`), e.sandboxPayment === true);
    }
    const purchase = e.purchaseId ? await this.store.get<Purchase>("purchase", e.purchaseId) : undefined;
    const sandbox = purchase?.livemode !== true;
    if (e.status === "paid") {
      await this.queue(e, "welcome", 1, message("Payment confirmed — your Institute next steps", `${sandbox ? "SANDBOX SIMULATION — no real enrollment or class access is granted.\n\n" : ""}Your $1,350 USD course payment is confirmed.\n\n${e.cohort}\n\nKeep your receipt and review your course documents:\n${e.policyUrl}\n\nClass access follows verification that all prerequisites are complete. We will send separate joining instructions when your access is ready.${e.orientationUrl ? `\n\nOrientation information: ${e.orientationUrl}` : ""}`), sandbox);
      if (e.accessApprovedAt && e.classroomCourseId) {
        await this.queue(e, "classroom", e.accessVersion || 1, { to: e.email, subject: "Classroom invitation", text: "", courseId: e.classroomCourseId }, sandbox);
        const jobs = await this.store.list<OnboardingJob>("institute-job");
        if (jobs.some(j => j.enrollmentId === e.id && j.purpose === "classroom" && j.version === (e.accessVersion || 1) && ["sent", "simulated"].includes(j.status))) {
          await this.queue(e, "class-access", e.accessVersion || 1, message("Your class joining instructions", `${sandbox ? "SANDBOX SIMULATION — no Classroom invitation was issued.\n\n" : "Your prerequisites have been verified. Your Google Classroom invitation is ready.\n\n"}Sign in to Google Classroom using this email address to accept the course invitation:\nhttps://classroom.google.com/\n\n${e.cohort}${e.orientationUrl ? `\n\nOrientation: ${e.orientationUrl}` : ""}`), sandbox);
        }
      }
    }
    if (e.status === "refunded") await this.queue(e, "refund", 1, message("Your course payment was refunded", `${sandbox ? "SANDBOX SIMULATION\n\n" : ""}Your full tuition refund has been recorded. Contact the Institute about your enrollment. If you already joined Classroom, staff will review your access separately.`), sandbox);
  }
  async tick() {
    if (this.running || automationMode() === "off") return;
    this.running = true;
    try {
      for (const e of await this.store.list<Enrollment>("enrollment")) await this.reconcile(e);
      const jobs = (await this.store.list<OnboardingJob>("institute-job")).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      for (const job of jobs) {
        if (job.status === "sending" && Date.now() - Date.parse(job.claimedAt || job.createdAt) > 120000) {
          await this.update(job, { status: job.purpose === "classroom" ? "queued" : "uncertain", error: "Delivery was interrupted. Review provider history before retrying email." });
          continue;
        }
        if (job.status !== "queued" || Date.parse(job.nextAttemptAt) > Date.now()) continue;
        const e = await this.store.get<Enrollment>("enrollment", job.enrollmentId);
        if (!e) { await this.update(job, { status: "cancelled" }); continue; }
        if ((e.status === "refunded" && job.purpose !== "refund" && job.purpose !== "receipt") || (job.purpose === "payment-invitation" && (e.status !== "payment-ready" || e.invitationVersion !== job.version)) || (["classroom", "class-access"].includes(job.purpose) && (e.status !== "paid" || !e.accessApprovedAt || e.accessVersion !== job.version))) {
          await this.update(job, { status: "cancelled" }); continue;
        }
        const claimed = { ...job, revision: job.revision + 1, status: "sending" as const, attempts: job.attempts + 1, claimedAt: new Date().toISOString() };
        try { await this.store.put("institute-job", job.id, claimed, job.revision); } catch (error) { if (error instanceof ConflictError) continue; throw error; }
        try {
          if (automationMode() === "sandbox" || job.sandbox) { await this.update(claimed, { status: "simulated", completedAt: new Date().toISOString() }); continue; }
          const payload = unseal<Payload>(job.encryptedPayload);
          if (payload.to.endsWith(".invalid")) { await this.update(claimed, { status: "cancelled", error: "Synthetic recipient — delivery suppressed." }); continue; }
          const id = job.purpose === "classroom" ? await this.google.invite(payload.courseId!, payload.to) : await this.google.send(payload, job.id);
          await this.update(claimed, { status: "sent", providerId: id, completedAt: new Date().toISOString(), error: undefined });
        } catch (error) {
          const uncertain = error instanceof GoogleFailure ? error.uncertain : job.purpose !== "classroom";
          const retry = !uncertain && error instanceof GoogleFailure && error.status === 429 && claimed.attempts < 8;
          await this.update(claimed, { status: uncertain ? "uncertain" : retry ? "queued" : "failed", nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** claimed.attempts)).toISOString(), error: uncertain ? "Receipt is uncertain. Check Google Sent before retrying." : "Google delivery failed. Check the connection, account permissions and course, then retry." });
        }
      }
    } finally { this.running = false; }
  }
  private async update(job: OnboardingJob, changes: Partial<OnboardingJob>) {
    try { await this.store.put("institute-job", job.id, { ...job, ...changes, revision: job.revision + 1 }, job.revision); }
    catch (error) { if (!(error instanceof ConflictError)) throw error; }
  }
}
