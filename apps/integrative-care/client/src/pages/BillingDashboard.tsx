import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, money, useAuth } from "@/lib/care";

type Enrollment = { id: string; revision: number; course: string; name: string; email: string; status: string; cohort?: string; policyUrl?: string; term?: string; foundationsStatus?: string; psycheStatus?: string; priorCohort?: string; message?: string; classroomCourseId?: string; orientationUrl?: string; accessApprovedAt?: string; sandboxPayment?: boolean };
type Job = { id: string; revision: number; enrollmentId: string; purpose: string; status: string; attempts: number; error?: string; providerId?: string; completedAt?: string; sandbox: boolean };
type Automation = { mode: string; googleConfigured: boolean; connectedEmail?: string; billingMode: string; checkout: boolean };
type Order = { id: string; offering: string; referenceId: string; email: string; amount: number; status: string };
export default function BillingDashboard() {
  const auth = useAuth("practitioner");
  const query = useQuery<{ orders: Order[]; enrollments: Enrollment[]; jobs: Job[]; automation: Automation }>({ queryKey: ["billing-admin"], queryFn: () => api("/billing/admin"), enabled: auth.user?.role === "practitioner" });
  const [operationError, setOperationError] = useState<unknown>();
  const [processing, setProcessing] = useState(false);
  async function connectGoogle() {
    setOperationError(undefined);
    try { const result = await api<{ url: string }>("/institute/google/connect", "POST", {}); window.location.assign(result.url); } catch (error) { setOperationError(error); }
  }
  async function process() {
    setProcessing(true); setOperationError(undefined);
    try { await api("/institute/automation/process", "POST", {}); await query.refetch(); } catch (error) { setOperationError(error); } finally { setProcessing(false); }
  }
  return <CareLayout practitioner>
    <h1 className="text-3xl">Billing and course enrollments</h1>
    <p className="my-5 text-sm text-muted-foreground">Care episodes and Institute tuition share one payment ledger. Review course details before creating a private payment invitation.</p>
    <ErrorMessage error={auth.error || query.error} />
    <Button variant="outline" onClick={() => query.refetch()}>Refresh billing</Button>
    {query.data?.automation && <section className="my-8 rounded-xl border border-border p-6"><h2 className="text-2xl">Payments and Google onboarding</h2>
      <p className="my-4 text-sm">Stripe: {query.data.automation.billingMode} · checkout {query.data.automation.checkout ? "configured" : "disabled"}. Automation: {query.data.automation.mode}.</p>
      <p className="my-4 text-sm">Google: {query.data.automation.connectedEmail || "Not connected"}. Uses Gmail sending and Classroom roster permissions for onlineclass@liferx.us.</p>
      <p className="my-4 text-sm">Sandbox creates previews and simulated invitations. It sends no emails and changes no Classroom rosters. Test payments never grant real class access.</p>
      <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={!query.data.automation.googleConfigured} onClick={connectGoogle}>{query.data.automation.connectedEmail ? "Reconnect Google" : "Connect teaching mailbox"}</Button><Button variant="outline" disabled={processing || query.data.automation.mode === "off"} onClick={process}>{processing ? "Processing…" : "Process queued onboarding"}</Button></div><ErrorMessage error={operationError} />
    </section>}
    <h2 className="mb-5 mt-10 text-2xl">Institute registrations</h2>
    {query.isLoading && <p>Loading…</p>}
    {query.data?.enrollments.length === 0 && <p>No course registrations yet.</p>}
    <div className="space-y-5">{query.data?.enrollments.map(e => <Invitation key={e.id} enrollment={e} sandbox={query.data?.automation?.billingMode !== "live"} refresh={() => query.refetch()} />)}</div>
    <h2 className="mb-5 mt-10 text-2xl">Onboarding delivery</h2>
    <p className="mb-5 text-sm text-muted-foreground">Sent means Google accepted the request; it does not confirm inbox delivery or that a student accepted the Classroom invitation. Review Google Sent before retrying an uncertain email. Full refunds stop pending access jobs; staff must review any existing Classroom membership.</p>
    <div className="space-y-4">{query.data?.jobs?.map(job => <Delivery key={job.id} job={job} refresh={() => query.refetch()} />)}</div>
    <h2 className="mb-5 mt-10 text-2xl">Payment ledger</h2>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Offering", "Reference", "Customer", "Amount", "Status"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead>
      <tbody>{query.data?.orders.map(o => <tr className="border-t border-border" key={o.id}><td className="p-3">{o.offering}</td><td className="p-3 break-all">{o.referenceId}</td><td className="p-3">{o.email}</td><td className="p-3">{money(o.amount)}</td><td className="p-3">{o.status}</td></tr>)}</tbody></table></div>
  </CareLayout>;
}
function Invitation({ enrollment: e, sandbox, refresh }: { enrollment: Enrollment; sandbox: boolean; refresh: () => unknown }) {
  const [cohort, setCohort] = useState(e.cohort || "");
  const [policyUrl, setPolicy] = useState(e.policyUrl || "");
  const [confirm, setConfirm] = useState(false);
  const [prerequisitesReviewed, setPrerequisitesReviewed] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [classroomCourseId, setClassroom] = useState(e.classroomCourseId || "");
  const [orientationUrl, setOrientation] = useState(e.orientationUrl || "");
  const [completed, setCompleted] = useState(false);
  async function access() {
    setBusy(true); setError(undefined);
    try { await api(`/institute/enrollments/${e.id}/access`, "POST", { revision: e.revision, completed, classroomCourseId, orientationUrl: orientationUrl || undefined }); setCompleted(false); refresh(); } catch (error) { setError(error); } finally { setBusy(false); }
  }
  async function invite() {
    setBusy(true); setError(undefined); setUrl("");
    try { const result = await api<{ url: string }>(`/institute/enrollments/${e.id}/invite`, "POST", { revision: e.revision, cohort, policyUrl, confirm, prerequisitesReviewed, classroomCourseId: classroomCourseId || undefined, orientationUrl: orientationUrl || undefined }); setUrl(result.url); refresh(); }
    catch (error) { setError(error); } finally { setBusy(false); }
  }
  return <section className="rounded-xl border border-border p-6">
    <h3 className="text-xl">{e.name} · {e.course}</h3><p className="my-3 text-sm">{e.email} · {e.status}{e.sandboxPayment && " · SANDBOX"}</p><p className="text-xs">Reference: {e.id}</p>
    <dl className="my-4 space-y-2 text-sm"><div><dt className="font-semibold">Requested term</dt><dd>{e.term || "Not recorded — confirm with student"}</dd></div><div><dt className="font-semibold">Foundations status (student reported)</dt><dd>{e.foundationsStatus || "Not recorded"}</dd></div>{e.psycheStatus && <div><dt className="font-semibold">Psyche status (student reported)</dt><dd>{e.psycheStatus}</dd></div>}<div><dt className="font-semibold">Earlier cohort(s)</dt><dd>{e.priorCohort || "Not provided"}</dd></div>{e.message && <div><dt className="font-semibold">Additional information</dt><dd className="whitespace-pre-wrap">{e.message}</dd></div>}</dl>
    {["review", "payment-ready"].includes(e.status) && <>
      {sandbox && <p className="my-4 font-semibold">Sandbox only — use clearly labeled test details. No final terms are implied.</p>}
      <label className="my-4 block text-sm">Confirmed cohort dates, time zone and session times<Input className="mt-2" value={cohort} onChange={event => setCohort(event.target.value)} maxLength={500} /></label>
      <label className="my-4 block text-sm">Published student policy URL<Input type="url" className="mt-2" value={policyUrl} onChange={event => setPolicy(event.target.value)} /></label>
      <label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={confirm} onChange={event => setConfirm(event.target.checked)} />{sandbox ? "I am preparing a sandbox payment invitation with test course details. No real enrollment is confirmed." : "I have reviewed this registration, confirmed the course details and published the final student policies. Tuition is $1,350, paid in full."}</label>
      <label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={prerequisitesReviewed} onChange={event => setPrerequisitesReviewed(event.target.checked)} />I have reviewed prerequisite records and confirmed eligibility or documented the required completion conditions with this student. Registration or payment alone does not satisfy prerequisites.</label>
      <Button disabled={busy || !confirm || !prerequisitesReviewed || !cohort.trim() || !policyUrl.trim()} onClick={invite}>{busy ? "Creating…" : "Create payment invitation"}</Button>
      <p className="mt-3 text-xs text-muted-foreground">Creating another invitation replaces the previous invitation and queues its email. Sandbox saves a preview only; live sending requires a connected Google mailbox and live automation.</p>
    </>}
    {["review", "payment-ready", "paid"].includes(e.status) && <div className="my-6 border-t border-border pt-4">
      <label className="my-4 block text-sm">Google Classroom course ID {e.status !== "paid" && "(optional until access approval)"}<Input value={classroomCourseId} onChange={event => setClassroom(event.target.value)} placeholder="Numeric course ID from Classroom settings/API" maxLength={80} /></label>
      <label className="my-4 block text-sm">Orientation URL (optional)<Input type="url" value={orientationUrl} onChange={event => setOrientation(event.target.value)} placeholder="https://…" /></label>
      {e.status === "paid" && <><p className="my-3 text-sm">{e.accessApprovedAt ? "Access was approved. Reissue only if the course or instructions need to change." : "Payment is confirmed. Verify completion of all prerequisite courses before issuing access."}</p><label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={completed} onChange={event => setCompleted(event.target.checked)} />I verified that all required prerequisite courses are complete.</label><Button disabled={busy || !completed || !/^\d+$/.test(classroomCourseId)} onClick={access}>{e.sandboxPayment || sandbox ? "Simulate Classroom onboarding" : "Approve and queue Classroom invitation"}</Button></>}
    </div>}
    <ErrorMessage error={error} />
    {url && <label className="mt-5 block text-sm">Private student payment link<Input readOnly value={url} onFocus={event => event.currentTarget.select()} className="mt-2" /><span className="mt-2 block text-xs">Share only with this student.</span></label>}
  </section>;
}

function Delivery({ job, refresh }: { job: Job; refresh: () => unknown }) {
  const [preview, setPreview] = useState<{ to: string; subject: string; text: string; courseId?: string }>();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  async function inspect() { setError(undefined); try { setPreview(await api(`/institute/jobs/${job.id}/preview`)); } catch (error) { setError(error); } }
  async function retry() { setBusy(true); setError(undefined); try { await api(`/institute/jobs/${job.id}/retry`, "POST", { revision: job.revision, checkedProviderHistory: checked }); refresh(); } catch (error) { setError(error); } finally { setBusy(false); } }
  return <section className="rounded-xl border border-border p-5"><h3 className="font-semibold">{job.purpose} · {job.status}</h3><p className="my-2 break-all text-xs">{job.enrollmentId} · Attempts: {job.attempts}{job.sandbox && " · Sandbox payment"}</p>{job.error && <p className="my-3 text-sm">{job.error}</p>}<Button variant="outline" onClick={inspect}>Preview message</Button>{preview && <div className="mt-4 whitespace-pre-wrap break-words border-t border-border pt-4 text-sm"><p>To: {preview.to}</p><p>Subject: {preview.subject}</p>{preview.courseId && <p>Classroom course ID: {preview.courseId}</p>}<p className="mt-4">{preview.text}</p></div>}{["failed", "uncertain"].includes(job.status) && <div className="mt-4"><label className="my-3 flex gap-3 text-sm"><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />I checked Google Sent / Classroom and confirmed this request needs retrying.</label><Button disabled={!checked || busy} onClick={retry}>Queue retry</Button></div>}<ErrorMessage error={error} /></section>;
}
