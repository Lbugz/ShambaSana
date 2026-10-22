import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brand } from "@/components/Brand";
import { ErrorMessage } from "@/components/CareLayout";
import { Button } from "@/components/ui/button";
import { api, hashParams, money } from "@/lib/care";

type Details = { course: string; semester?: number; learningFormat?: string; cohort: string; policyUrl: string; amount: number; status: string; sandbox?: boolean; accessApproved?: boolean; orientationUrl?: string };
export default function CoursePayment() {
  const params = hashParams();
  const enrollment = params.get("enrollment") || "";
  const token = params.get("token") || "";
  const [acceptPolicies, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const query = useQuery<Details>({ queryKey: ["course-payment", enrollment, token], queryFn: () => api("/institute/payment", "POST", { enrollment, token }), enabled: !!enrollment && !!token, refetchInterval: 15000 });
  async function checkout() {
    setBusy(true); setError(undefined);
    try { const result = await api<{ url: string }>("/institute/payment", "POST", { enrollment, token, checkout: true, acceptPolicies }); window.location.assign(result.url); }
    catch (error) { setError(error); setBusy(false); }
  }
  const d = query.data;
  return <main className="mx-auto max-w-2xl px-5 py-12"><Brand subtitle="THE INSTITUTE" />
    <h1 className="mt-10 text-3xl">Your Institute enrollment</h1>
    {(!enrollment || !token) && <p className="mt-5">Open the private payment invitation sent to you by the Institute.</p>}
    {query.isLoading && <p className="mt-5">Loading your course details…</p>}
    <ErrorMessage error={query.error || error} />
    {d && <section className="mt-8 rounded-xl border border-border p-6"><h2 className="text-2xl">{d.course}</h2>
      {d.sandbox && <p role="status" className="my-5 font-semibold">Stripe sandbox — use test payment details only. This does not purchase a real course or grant class access.</p>}
      {d.semester && <p className="mt-4 font-semibold">Semester {d.semester} · {d.learningFormat === "self-paced" ? "Self-paced catch-up" : "Live online"}</p>}
      <p className="my-5 whitespace-pre-wrap text-sm">{d.cohort}</p><p>{d.semester ? "Semester tuition" : "Tuition for this invitation"}: {money(d.amount)} · one payment</p>
      <p className="mt-4 text-sm">Later semesters require a separate confirmation and payment. You will not be automatically charged.</p>
      {d.status === "paid" ? <div role="status" className="mt-6"><p>{d.sandbox ? "Test payment confirmed. No real enrollment or Classroom invitation is issued." : "Payment confirmed. Your welcome message is queued for email. Class access follows verification of prerequisite completion."}</p>{d.accessApproved && <p className="mt-4">Class access approved. Check your email and <a href="https://classroom.google.com/" className="underline">Google Classroom</a> for your invitation.</p>}{d.orientationUrl && <p className="mt-4"><a className="underline" href={d.orientationUrl}>Open orientation information</a></p>}</div> : d.status === "refunded" ? <p className="mt-6">Your payment was refunded. Contact the Institute about your enrollment.</p> : <>
        <label className="my-6 flex gap-3 text-sm"><input type="checkbox" checked={acceptPolicies} onChange={event => setAccept(event.target.checked)} /><span>{d.sandbox ? "I understand this is a sandbox payment and these are test course documents: " : "I have reviewed the course details and accept the "}<a href={d.policyUrl} target="_blank" rel="noopener noreferrer" className="underline">{d.sandbox ? "view test documents" : "student policies, including cancellation and refund terms"}</a>.</span></label>
        <Button disabled={!acceptPolicies || busy || d.status !== "payment-ready"} onClick={checkout}>{busy ? "Opening checkout…" : "Continue to Stripe checkout"}</Button>
        <p className="mt-4 text-xs text-muted-foreground">Payment is confirmed after Stripe verifies it. Returning from checkout alone does not confirm payment.</p>
      </>}
      <Button variant="outline" className="mt-5" onClick={() => query.refetch()}>Refresh payment status</Button>
    </section>}
  </main>;
}
