import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardList,
  FlaskConical,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { ReportView } from "@/components/ReportView";
import { VerifiedLabResults } from "@/components/VerifiedLabResults";
import {
  useAuth,
  useCases,
  useCase,
  useCaseAction,
  useCareConfig,
  api,
  money,
  uploadDocument,
} from "@/lib/care";
import { caseStatus, type CareCase, type CareConfig, type Document } from "@shared/care";
import { intakeSections, intakeLabels, intakeAnswer } from "@shared/intake-journey";
import { clientJourney } from "@shared/client-journey";
import { LabDocuments } from "@/components/LabDocuments";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SandboxNotice } from "@/components/SandboxNotice";

export default function Dashboard() {
  const auth = useAuth("customer");
  const cases = useCases(auth.user?.role === "customer");
  const config = useCareConfig();
  const client = useQueryClient();
  const [selected, setSelected] = useState("");
  const [consent, setConsent] = useState(false);
  const [newCase, setNewCase] = useState(false);
  const enroll = useMutation({
    mutationFn: (pilot: boolean) =>
      api<CareCase>("/cases", "POST", { consent, pilot }),
    onSuccess: (c) => {
      client.invalidateQueries({ queryKey: ["care-cases"] });
      client.setQueryData(["care-case", c.id], c);
      setSelected(c.id);
      setNewCase(false);
    },
  });
  if (auth.isLoading)
    return <p className="p-10">Loading your care workspace…</p>;
  return (
    <CareLayout>
      <SandboxNotice compact />
      <ErrorMessage error={auth.error || cases.error || config.error} />
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
            Your Shamba Sana care
          </p>
          <h1 className="text-3xl md:text-4xl">
            Welcome, {auth.user?.name.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your story, labs and next steps—in one place.
          </p>
        </div>
        {!!cases.data?.length && (
          <Button variant="outline" onClick={() => setNewCase(!newCase)}>
            {newCase ? "Return to my case" : "Start another care episode"}
          </Button>
        )}
      </div>
      {cases.isLoading && <p>Loading your care records…</p>}
      {cases.isSuccess && (!cases.data.length || newCase) ? (
        <section className="max-w-2xl rounded-2xl border border-border bg-card p-7">
          <h2 className="text-2xl">Enroll in the integrative care pilot</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            A TCM intake, review of existing labs and a practitioner-approved
            report.{" "}
            {config.data && (
              <strong className="text-primary">
                {money(config.data.amount)} for one care episode.
              </strong>
            )}{" "}
            New tests and treatments are separate.
          </p>
          <label className="my-6 flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              I am 18 or older and understand the pilot’s{" "}
              <Link className="underline" href="/terms">
                care scope
              </Link>{" "}
              and{" "}
              <Link className="underline" href="/privacy">
                information practices
              </Link>
              . I agree to provide my intake and labs for practitioner review.
            </span>
          </label>
          <ErrorMessage error={enroll.error} />
          <div className="mt-5 flex flex-wrap gap-3">
            {config.data?.checkout && (
              <Button
                disabled={!consent || enroll.isPending}
                onClick={() => enroll.mutate(false)}
              >
                {config.data?.billingMode === "live" ? "Enroll and continue to payment" : "Continue to test payment"}
              </Button>
            )}
            {config.data?.pilot && (
              <Button
                variant={config.data.checkout ? "outline" : "default"}
                disabled={!consent || enroll.isPending}
                onClick={() => enroll.mutate(true)}
              >
                Start unpaid pilot
              </Button>
            )}
          </div>
          {!config.data?.checkout && (
            <p className="mt-4 text-xs text-muted-foreground">
              Paid enrollment is not available yet.
            </p>
          )}
          {config.data?.pilot && (
            <p className="mt-4 text-xs text-muted-foreground">
              The unpaid pilot records a care episode without charging you.
            </p>
          )}
        </section>
      ) : (
        !!cases.data?.length && (
          <>
            <div className="mb-6">
              <label
                htmlFor="case-select"
                className="mr-3 text-xs text-muted-foreground"
              >
                Care episode
              </label>
              <select
                id="case-select"
                className="mt-2 min-h-12 w-full min-w-0 max-w-full rounded-lg border border-border bg-card p-3 text-sm"
                value={selected || cases.data[0].id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {cases.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {new Date(c.createdAt).toLocaleString()} · {c.id.slice(-6)} ·{" "}
                    {caseStatus(c)}
                  </option>
                ))}
              </select>
            </div>
            <CustomerCase
              key={selected || cases.data[0].id}
              id={selected || cases.data[0].id}
            />
          </>
        )
      )}
    </CareLayout>
  );
}
function CustomerCase({id}:{id:string}) {
  const query=useCase(id);
  const action=useCaseAction(id);
  const config=useCareConfig();
  const [notice,setNotice]=useState("");
  const c=query.data;
  async function perform(path:string,body:unknown,method="POST") {
    setNotice("");
    const result=await action.mutateAsync({path,body,method});setNotice("Your care record has been updated.");return result;
  }
  if(!c)return <><ErrorMessage error={query.error}/>{!query.error && <p>Loading your case…</p>}</>;
  return <><ErrorMessage error={query.error}/>{notice && <p role="status" className="mb-5 rounded-xl bg-secondary p-4 text-sm">{notice}</p>}<ClientCaseWorkspace c={c} config={config.data} busy={action.isPending} refreshing={query.isFetching} refresh={()=>{void query.refetch();}} perform={perform} onUpload={async(file,kind)=>{await perform("/documents",{...await uploadDocument(file,"lab",c.revision),kind});}}/></>;
}

type ClientAction=(path:string,body:unknown,method?:string)=>Promise<unknown>;
export function ClientCaseWorkspace({c,config,busy,refreshing,refresh,perform,onUpload}:{c:CareCase;config?:CareConfig;busy:boolean;refreshing?:boolean;refresh:()=>void;perform:ClientAction;onUpload:(file:File,kind?:Document["kind"])=>Promise<void>}) {
  const journey=clientJourney(c);
  const [tab,setTab]=useState("overview");
  const [reportId,setReportId]=useState("");
  const [reply,setReply]=useState(c.followupResponse?.message || "");
  const [error,setError]=useState<unknown>();
  const [checkoutBusy,setCheckoutBusy]=useState(false);
  const tabRef=useRef<HTMLDivElement>(null);
  const previousReports=useRef(c.reports.length);
  useEffect(()=>{setReply(c.followupResponse?.message || "");},[c.followupRequest,c.followupResponse]);
  useEffect(()=>{if(c.reports.length>previousReports.current)setTab("report");previousReports.current=c.reports.length;},[c.reports.length]);
  const report=c.reports.find(r=>r.id===reportId)||c.reports.at(-1);
  const locked=!!c.reports.length || !journey.enrolled;
  async function act(path:string,body:unknown,method="POST") {setError(undefined);try{await perform(path,body,method);}catch(e){setError(e);}}
  async function checkout(){setError(undefined);setCheckoutBusy(true);try{const result=await api<{url:string}>(`/cases/${c.id}/checkout`,"POST",{revision:c.revision});window.location.assign(result.url);}catch(e){setError(e);}finally{setCheckoutBusy(false);}}
  function go(next:string){setTab(next);requestAnimationFrame(()=>tabRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));}
  return <div className="min-w-0 space-y-6">
    <section aria-label="Your care progress" className="rounded-2xl bg-primary p-5 text-white sm:p-8 print:hidden">
      <p className="mb-3 text-xs uppercase tracking-[.16em] text-white/70">{c.payment.status==="unpaid-pilot"?"Unpaid pilot":"Integrative Care"} · Your care episode</p><h2 className="text-2xl text-white sm:text-3xl">{journey.title}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">{journey.detail}</p>
      <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{journey.milestones.map((m,i)=><li key={m.label} className="flex items-center gap-3 text-xs leading-5 sm:text-sm"><span aria-label={m.done?"Complete":"Not complete"} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${m.done?"border-white/40 bg-white/15":"border-white/30"}`}>{m.done?<Check aria-hidden="true" className="h-4 w-4"/>:i+1}</span>{m.label}</li>)}</ol>
      <div className="mt-6 flex flex-wrap gap-3">{journey.tab==="intake"?<Link href={`/tcm-assessment?case=${c.id}`} className="inline-flex min-h-12 items-center justify-center rounded-lg bg-secondary px-5 text-sm font-medium text-primary">Continue intake<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4"/></Link>:<Button variant="secondary" className="min-h-12 whitespace-normal" onClick={()=>go(journey.tab)}>{journey.action}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4"/></Button>}<Button variant="ghost" className="min-h-12 text-white hover:bg-white/10 hover:text-white" disabled={refreshing || busy} onClick={refresh}><RefreshCw aria-hidden="true" className={`mr-2 h-4 w-4 ${refreshing?"animate-spin":""}`}/>{refreshing?"Checking…":"Refresh status"}</Button></div><p className="mt-4 text-xs leading-6 text-white/65">Record updated {new Date(c.updatedAt).toLocaleString()} · Status refreshes automatically while this page is open.</p>
    </section>
    <ErrorMessage error={error}/>
    <Tabs value={tab} onValueChange={setTab} className="min-w-0">
      <div ref={tabRef} className="scroll-mt-5 print:hidden"><TabsList aria-label="Your care sections" className="mb-6 grid h-auto w-full grid-cols-4 gap-1 rounded-xl bg-secondary/40 p-1.5">{[["overview","Overview"],["documents","Documents"],["results","Results"],["report","Care report"]].map(([value,label])=><TabsTrigger key={value} value={value} className="min-h-12 whitespace-normal px-1 text-xs sm:text-sm">{label}</TabsTrigger>)}</TabsList></div>
      <TabsContent value="overview" className="space-y-5 print:hidden">
        {c.followupRequest && <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-7"><MessageSquare aria-hidden="true" className="mb-3 h-6 w-6"/><h3 className="text-xl">A question from your practitioner</h3><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{c.followupRequest}</p>{c.followupResponse && <p role="status" className="mt-4 text-xs leading-6">Reply sent {new Date(c.followupResponse.sentAt).toLocaleString()}. Waiting for practitioner review.</p>}{!locked && <><label htmlFor="followup-reply" className="mt-5 block text-sm font-medium">Your reply</label><Textarea id="followup-reply" className="mt-2 min-h-32 text-base" maxLength={5000} value={reply} onChange={e=>setReply(e.target.value)} disabled={busy}/><p className="mt-3 text-xs leading-6">Add relevant details here. Use your intake to correct health history and Documents to add original results. This workspace is not monitored for emergencies.</p><Button className="mt-4 min-h-12" disabled={busy || !reply.trim() || reply.trim()===c.followupResponse?.message} onClick={()=>act("/followup-response",{revision:c.revision,message:reply})}>{busy?"Saving…":c.followupResponse?"Update reply":"Send reply for review"}</Button></>}</section>}
        {!journey.enrolled?<section className="rounded-2xl border border-border bg-card p-6"><h3 className="text-xl">{c.payment.status==="refunded"?"Enrollment paused":"Complete enrollment"}</h3><p className="my-4 text-sm leading-7 text-muted-foreground">{c.payment.status==="refunded"?"This episode is read-only after a refund. Contact your care team for next steps.":`${money(c.payment.amount)} for this care episode. Care is currently a test experience; no live payment is enabled.`}</p>{c.payment.status==="pending" && <Button className="min-h-12" disabled={busy || checkoutBusy || !config?.checkout} onClick={checkout}>{checkoutBusy?"Opening checkout…":"Continue to test checkout"}</Button>}</section>:<div className="grid gap-5 md:grid-cols-2"><section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><ClipboardList aria-hidden="true" className="mb-4 h-6 w-6 text-primary"/><h3 className="text-xl">Your health intake</h3><p className="my-4 text-sm leading-7 text-muted-foreground">{journey.intakeDone?(locked?"Your submitted answers are preserved with this completed episode. You can read them below.":"Submitted for practitioner review. If you update your answers, submit them again when finished."):"Share your goals, health history and observations. Save progress and return without starting over."}</p>{!locked?<Link href={`/tcm-assessment?case=${c.id}`} className="inline-flex min-h-12 items-center rounded-lg border border-border px-4 text-sm">{journey.intakeDone?"Review or update intake":"Continue intake"}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4"/></Link>:null}</section><section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><FlaskConical aria-hidden="true" className="mb-4 h-6 w-6 text-primary"/><h3 className="text-xl">Documents and results</h3><p className="my-4 text-sm leading-7 text-muted-foreground">{c.documents.filter(d=>d.purpose==="lab").length} lab {c.documents.filter(d=>d.purpose==="lab").length===1?"document":"documents"} received. Verified measurements appear in Results; original files stay in Documents.</p><Button variant="outline" className="min-h-12" onClick={()=>go("documents")}>View documents<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4"/></Button></section></div>}
        {journey.intakeDone && <details className="group rounded-2xl border border-border bg-card p-5 sm:p-7"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">View your submitted intake<ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"/></summary><div className="mt-5 space-y-6">{intakeSections.map(section=><section key={section.title}><h3 className="text-lg">{section.title}</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2">{section.keys.map(key=><div key={key}><dt className="text-xs text-muted-foreground">{intakeLabels[key]}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{intakeAnswer(c.intake,key)}</dd></div>)}</dl></section>)}</div></details>}
        {report?<section className="rounded-2xl border border-primary/20 bg-secondary/30 p-5 sm:p-7"><FileCheck2 aria-hidden="true" className="mb-4 h-6 w-6"/><h3 className="text-xl">Your reviewed care plan</h3><p className="my-4 text-sm leading-7 text-muted-foreground">Read the findings, recommendations and follow-up plan approved by {report.author}.</p><Button className="min-h-12" onClick={()=>go("report")}>Read your care report</Button></section>:<section className="rounded-2xl border border-dashed border-border p-5 sm:p-7"><h3 className="text-xl">What happens next?</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Your practitioner checks the submitted intake and original results, asks any follow-up questions, and prepares your report. Only an approved report appears here. Check this workspace for updates; email notifications are not configured.</p></section>}
        {(config?.ai || c.aiConsent) && <details className="rounded-xl border border-border bg-card p-5"><summary className="min-h-11 cursor-pointer text-sm font-medium">Optional AI processing permission</summary><p className="my-4 text-sm leading-7 text-muted-foreground">With permission, lab documents and intake may be sent to OpenAI for drafting. Practitioner review is required. You can use manual review and withdraw permission for future processing.</p><Button variant="outline" className="min-h-12" disabled={busy || locked} onClick={()=>act("/ai-consent",{revision:c.revision,consent:!c.aiConsent})}>{c.aiConsent?"Withdraw AI permission":"Allow AI-assisted processing"}</Button></details>}
      </TabsContent>
      <TabsContent value="documents" className="space-y-6 print:hidden"><LabDocuments c={c} busy={busy} onUpload={onUpload} onRemove={async documentId=>{await perform(`/documents/${documentId}`,{revision:c.revision},"DELETE");}}/>{journey.enrolled && <section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><h3 className="text-xl">Need new lab tests?</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Your practitioner can review what testing may be appropriate. A request does not place a lab order; testing fees are separate.</p>{c.labRequest?<div className="mt-4 rounded-xl bg-secondary/30 p-4"><p className="text-sm font-medium">{c.labRequest.status==="ordered"?"External lab order recorded":"Testing request received"}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{c.labRequest.details || "Your practitioner will review this request and record the next steps."}</p>{c.labRequest.externalReference && <p className="mt-3 break-words text-xs">Order reference: {c.labRequest.externalReference}</p>}</div>:!locked && <Button variant="outline" className="mt-4 min-h-12" disabled={busy} onClick={()=>act("/lab-request",{revision:c.revision})}>Request help with lab testing</Button>}</section>}</TabsContent>
      <TabsContent value="results" className="print:hidden">{journey.milestones[2].done || c.documents.some(d=>d.kind==="laboratory-results" && d.verifiedAt)?<VerifiedLabResults documents={c.documents} documentUrl={id=>`/api/cases/${c.id}/documents/${id}`}/>:<section className="rounded-2xl border border-dashed border-border p-6"><h2 className="text-2xl">Results appear after verification</h2><p className="my-4 text-sm leading-7 text-muted-foreground">Your practitioner checks original results before measurements are shown here. Uploaded files alone do not create verified results.</p><Button variant="outline" className="min-h-12" onClick={()=>go("documents")}>View your documents</Button></section>}</TabsContent>
      <TabsContent value="report" className="space-y-5">{report?<><div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><h2 className="text-2xl">Your approved care report</h2>{c.reports.length>1 && <label className="text-xs">Report version<select className="ml-2 min-h-12 rounded-lg border bg-card p-3 text-sm" value={report.id} onChange={e=>setReportId(e.target.value)}>{c.reports.map((r,i)=><option key={r.id} value={r.id}>Version {i+1} · {new Date(r.approvedAt).toLocaleDateString()}</option>)}</select></label>}</div><ReportView report={report} customerName={c.customerName}/></>:<section className="rounded-2xl border border-dashed border-border p-6"><h2 className="text-2xl">Your care report is not ready yet</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">You will see the approved report here after practitioner review. Drafts and private clinical notes are not shared in your workspace.</p></section>}</TabsContent>
    </Tabs>
  </div>;
}
