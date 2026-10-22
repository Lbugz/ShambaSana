import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, money, useAuth } from "@/lib/care";

type Enrollment = { id: string; revision: number; course: string; name: string; email: string; status: string; cohort?: string; policyUrl?: string; term?: string; foundationsStatus?: string; psycheStatus?: string; priorCohort?: string; message?: string };
type Order = { id: string; offering: string; referenceId: string; email: string; amount: number; status: string };
export default function BillingDashboard() {
  const auth = useAuth("practitioner");
  const query = useQuery<{ orders: Order[]; enrollments: Enrollment[] }>({ queryKey: ["billing-admin"], queryFn: () => api("/billing/admin"), enabled: auth.user?.role === "practitioner" });
  return <CareLayout practitioner>
    <h1 className="text-3xl">Billing and course enrollments</h1>
    <p className="my-5 text-sm text-muted-foreground">Care episodes and Institute tuition share one payment ledger. Review course details before creating a private payment invitation.</p>
    <ErrorMessage error={auth.error || query.error} />
    <Button variant="outline" onClick={() => query.refetch()}>Refresh billing</Button>
    <h2 className="mb-5 mt-10 text-2xl">Institute registrations</h2>
    {query.isLoading && <p>Loading…</p>}
    {query.data?.enrollments.length === 0 && <p>No course registrations yet.</p>}
    <div className="space-y-5">{query.data?.enrollments.map(e => <Invitation key={e.id} enrollment={e} refresh={() => query.refetch()} />)}</div>
    <h2 className="mb-5 mt-10 text-2xl">Payment ledger</h2>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Offering", "Reference", "Customer", "Amount", "Status"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead>
      <tbody>{query.data?.orders.map(o => <tr className="border-t border-border" key={o.id}><td className="p-3">{o.offering}</td><td className="p-3 break-all">{o.referenceId}</td><td className="p-3">{o.email}</td><td className="p-3">{money(o.amount)}</td><td className="p-3">{o.status}</td></tr>)}</tbody></table></div>
  </CareLayout>;
}
function Invitation({ enrollment: e, refresh }: { enrollment: Enrollment; refresh: () => unknown }) {
  const [cohort, setCohort] = useState(e.cohort || "");
  const [policyUrl, setPolicy] = useState(e.policyUrl || "");
  const [confirm, setConfirm] = useState(false);
  const [prerequisitesReviewed, setPrerequisitesReviewed] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  async function invite() {
    setBusy(true); setError(undefined); setUrl("");
    try { const result = await api<{ url: string }>(`/institute/enrollments/${e.id}/invite`, "POST", { revision: e.revision, cohort, policyUrl, confirm, prerequisitesReviewed }); setUrl(result.url); refresh(); }
    catch (error) { setError(error); } finally { setBusy(false); }
  }
  return <section className="rounded-xl border border-border p-6">
    <h3 className="text-xl">{e.name} · {e.course}</h3><p className="my-3 text-sm">{e.email} · {e.status}</p>
    <dl className="my-4 space-y-2 text-sm"><div><dt className="font-semibold">Requested term</dt><dd>{e.term || "Not recorded — confirm with student"}</dd></div><div><dt className="font-semibold">Foundations status (student reported)</dt><dd>{e.foundationsStatus || "Not recorded"}</dd></div>{e.psycheStatus && <div><dt className="font-semibold">Psyche status (student reported)</dt><dd>{e.psycheStatus}</dd></div>}<div><dt className="font-semibold">Earlier cohort(s)</dt><dd>{e.priorCohort || "Not provided"}</dd></div>{e.message && <div><dt className="font-semibold">Additional information</dt><dd className="whitespace-pre-wrap">{e.message}</dd></div>}</dl>
    {["review", "payment-ready"].includes(e.status) && <>
      <label className="my-4 block text-sm">Confirmed cohort dates, time zone and session times<Input className="mt-2" value={cohort} onChange={event => setCohort(event.target.value)} maxLength={500} /></label>
      <label className="my-4 block text-sm">Published student policy URL<Input type="url" className="mt-2" value={policyUrl} onChange={event => setPolicy(event.target.value)} /></label>
      <label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={confirm} onChange={event => setConfirm(event.target.checked)} />I have reviewed this registration, confirmed the course details and published the final student policies. Tuition is $1,350, paid in full.</label>
      <label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={prerequisitesReviewed} onChange={event => setPrerequisitesReviewed(event.target.checked)} />I have reviewed prerequisite records and confirmed eligibility or documented the required completion conditions with this student. Registration or payment alone does not satisfy prerequisites.</label>
      <Button disabled={busy || !confirm || !prerequisitesReviewed || !cohort.trim() || !policyUrl.trim()} onClick={invite}>{busy ? "Creating…" : "Create payment invitation"}</Button>
      <p className="mt-3 text-xs text-muted-foreground">Creating another invitation replaces the previous invitation. Send it to the student using your normal contact process; email delivery is not automated.</p>
    </>}
    <ErrorMessage error={error} />
    {url && <label className="mt-5 block text-sm">Private student payment link<Input readOnly value={url} onFocus={event => event.currentTarget.select()} className="mt-2" /><span className="mt-2 block text-xs">Share only with this student.</span></label>}
  </section>;
}
