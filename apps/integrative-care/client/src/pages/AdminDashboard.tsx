import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, ChevronDown, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { intakeSections, intakeLabels, intakeAnswer } from "@shared/intake-journey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { LabEducationPanel } from "@/components/LabEducationPanel";
import { prepareReferenceLabSection } from "@shared/lab-education";
import { ReportContent, ReportView } from "@/components/ReportView";
import { documentKinds, documentLabels, reviewBlockers } from "@shared/care-review";
import {
  useAuth,
  useCases,
  useCase,
  useCaseAction,
  useCareConfig,
} from "@/lib/care";
import {
  blankReport,
  caseStatus,
  reportFields,
  type CareCase,
  type Document,
  type Extraction,
  type Report,
  type LabRow,
} from "@shared/care";

export default function AdminDashboard() {
  const auth=useAuth("practitioner");
  const cases=useCases(auth.user?.role==="practitioner");
  const [selected,setSelected]=useState("");
  const [search,setSearch]=useState("");
  const [showQueue,setShowQueue]=useState(true);
  const searchRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(showQueue)searchRef.current?.focus();},[showQueue]);
  if(auth.isLoading)return <p className="p-10">Loading the practitioner workspace…</p>;
  const filtered=(cases.data || []).filter(c=>`${c.customerName} ${c.customerEmail} ${caseStatus(c)}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return <CareLayout practitioner>
    <header className="mb-8"><p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">Shamba Sana · Practitioner workspace</p><h1 className="text-3xl md:text-4xl">Care, connected.</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">Review your cases, verify the evidence and prepare clear guidance.</p></header>
    <ErrorMessage error={auth.error || cases.error}/>
    <section hidden={!showQueue} aria-labelledby="case-queue-title" className="min-w-0 rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border p-5 sm:p-6"><div><h2 id="case-queue-title" className="text-2xl">Care cases</h2><p className="mt-2 text-xs text-muted-foreground">{filtered.length} {filtered.length===1?"case":"cases"} · Most recently updated first</p></div><div className="flex w-full flex-wrap items-end gap-3 sm:w-auto"><div className="min-w-0 flex-1 sm:w-64"><Label htmlFor="case-search">Find a case</Label><Input ref={searchRef} id="case-search" className="mt-2 min-h-12" placeholder="Name, email or status" value={search} onChange={e=>setSearch(e.target.value)}/></div><Button variant="outline" className="min-h-12" onClick={()=>cases.refetch()}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true"/>Refresh</Button></div></div>
      {cases.isLoading && <p className="p-6 text-sm">Loading cases…</p>}
      {cases.isSuccess && !filtered.length && <p className="p-6 text-sm text-muted-foreground">{search?"No matching cases. Try a different name, email or status.":"No care cases yet."}</p>}
      {!!filtered.length && <table className="w-full table-fixed text-left text-sm"><caption className="sr-only">Care cases. Open a case to review intake, labs, assessments and reports.</caption><thead className="border-b border-border bg-secondary/30 text-xs text-muted-foreground"><tr><th scope="col" className="w-[37%] px-3 py-4 font-medium sm:w-[28%] sm:px-6">Client</th><th scope="col" className="w-[35%] px-2 py-4 font-medium sm:w-[22%]">Status</th><th scope="col" className="hidden p-4 font-medium md:table-cell">Intake</th><th scope="col" className="hidden p-4 font-medium lg:table-cell">Labs verified</th><th scope="col" className="hidden p-4 font-medium lg:table-cell">Updated</th><th scope="col" className="w-[28%] px-2 py-4 font-medium sm:w-[14%] sm:px-6"><span className="sr-only">Open case</span></th></tr></thead><tbody>{filtered.map(c=>{const labs=c.documents.filter(d=>d.kind==="laboratory-results" && d.purpose==="lab");return <tr key={c.id} className={`border-b border-border last:border-0 ${selected===c.id?"bg-secondary/40":"hover:bg-secondary/20"}`}><th scope="row" className="break-words px-3 py-5 align-top font-normal sm:px-6"><span className="font-semibold">{c.customerName}</span><span className="mt-2 hidden break-all text-xs text-muted-foreground sm:block">{c.customerEmail}</span></th><td className="break-words px-2 py-5 align-top text-xs leading-6 text-primary">{caseStatus(c)}</td><td className="hidden p-4 align-top text-xs leading-6 md:table-cell">{c.intakeSubmittedAt?"Submitted":"Draft"}</td><td className="hidden p-4 align-top text-xs leading-6 lg:table-cell">{labs.length?`${labs.filter(d=>d.verifiedAt).length} of ${labs.length}`:"No results"}</td><td className="hidden p-4 align-top text-xs leading-6 text-muted-foreground lg:table-cell">{new Date(c.updatedAt).toLocaleDateString()}</td><td className="px-2 py-3 align-top sm:px-6"><Button variant="outline" className="min-h-12 w-full px-2" aria-label={`Open case for ${c.customerName}`} onClick={()=>{setSelected(c.id);setShowQueue(false);window.scrollTo({top:0,behavior:"instant"});}}>Open<ArrowRight className="ml-1 hidden h-3.5 w-3.5 sm:block" aria-hidden="true"/></Button></td></tr>;})}</tbody></table>}
    </section>
    <div hidden={showQueue} className="min-w-0">{selected && <><Button variant="ghost" className="mb-5 min-h-12" onClick={()=>{setShowQueue(true);window.scrollTo({top:0,behavior:"instant"});}}><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true"/>Back to cases</Button><PractitionerCase key={selected} id={selected}/></>}</div>
  </CareLayout>;
}

function PractitionerCase({id}:{id:string}) {
  const query=useCase(id);
  const action=useCaseAction(id);
  const config=useCareConfig();
  const c=query.data;
  const [error,setError]=useState<unknown>();
  const [notice,setNotice]=useState("");
  const [tab,setTab]=useState("intake");
  const [reportId,setReportId]=useState("");
  const initialized=useRef(false);
  const titleRef=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(c && !initialized.current){initialized.current=true;setTab(c.reports.length?"reports":!c.intakeSubmittedAt?"intake":reviewBlockers(c).length?"labs":"assessment");titleRef.current?.focus();}},[c]);
  const perform=async(path:string,body:unknown,method="POST")=>{
    setError(undefined);setNotice("");
    try{const result=await action.mutateAsync({path,body,method});setNotice("Saved to the care record.");if(path==="/approve"){setReportId(result.reports.at(-1)?.id || "");setTab("reports");}return result;}catch(e){setError(e);return undefined;}
  };
  if(!c)return <><ErrorMessage error={query.error}/>{!query.error && <p>Loading case…</p>}</>;
  const blockers=reviewBlockers(c);
  const report=c.reports.find(r=>r.id===reportId)||c.reports.at(-1);
  const tabItems=[{value:"intake",label:"Intake"},{value:"labs",label:`Labs (${c.documents.filter(d=>d.purpose==="lab").length})`},{value:"assessment",label:"Assessment"},{value:"reports",label:`Reports (${c.reports.length})`},{value:"activity",label:"Activity"}];
  return <div className="min-w-0 space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-primary p-6 sm:p-7"><div className="min-w-0"><p className="mb-3 text-xs uppercase tracking-[.15em] text-white/65">{c.payment.status==="unpaid-pilot"?"Unpaid pilot":"Integrative Care"} · Revision {c.revision}</p><h2 ref={titleRef} tabIndex={-1} className="break-words text-2xl text-white outline-none">{c.customerName}</h2><p className="mt-3 text-sm text-white/75">{caseStatus(c)}</p></div><Button variant="secondary" className="min-h-12" disabled={action.isPending} onClick={()=>query.refetch()}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true"/>Refresh case</Button></header>
    <ErrorMessage error={error || action.error}/>{notice && <p role="status" className="rounded-xl bg-secondary/40 p-4 text-sm">{notice}</p>}
    <Tabs value={tab} onValueChange={setTab} className="min-w-0">
      <TabsList aria-label="Care case sections" className="mb-5 grid h-auto w-full grid-cols-3 gap-2 bg-secondary/40 p-2 sm:grid-cols-5">{tabItems.map(t=><TabsTrigger key={t.value} value={t.value} className="min-h-12 whitespace-normal px-2 text-xs sm:text-sm">{t.label}</TabsTrigger>)}</TabsList>
      <p className="mb-6 text-xs leading-6 text-muted-foreground">Switch tabs to review this case. Save edits with the controls in each section.</p>
      <TabsContent value="intake" forceMount hidden={tab!=="intake"} className="space-y-5 data-[state=inactive]:hidden"><section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><h3 className="text-2xl">Health history and TCM intake</h3><p className="mt-3 text-xs leading-6 text-muted-foreground">{c.intakeSubmittedAt?`Submitted ${new Date(c.intakeSubmittedAt).toLocaleString()}`:"Intake is still a draft. It must be submitted before report release."}</p><div className="mt-6 space-y-6">{intakeSections.map(section=><section key={section.title} className="rounded-xl border border-border p-4 sm:p-5"><h4 className="mb-5 text-lg">{section.title}</h4><dl className="grid gap-5 sm:grid-cols-2">{section.keys.map(key=><div key={key}><dt className="text-xs text-muted-foreground">{intakeLabels[key]}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{intakeAnswer(c.intake,key)}</dd></div>)}</dl></section>)}</div>{c.documents.filter(d=>d.purpose==="tongue").map(d=><p key={d.id} className="mt-5 break-words text-sm"><a className="underline" href={`/api/cases/${id}/documents/${d.id}`}>Download tongue photo: {d.name}</a></p>)}<p className="mt-5 text-xs leading-6 text-muted-foreground">Tongue observations are self-reported. This remote intake does not include a measured pulse examination.</p></section></TabsContent>
      <TabsContent value="labs" forceMount hidden={tab!=="labs"} className="space-y-5 data-[state=inactive]:hidden">{c.labRequest && <LabOrder c={c} busy={action.isPending} perform={perform}/>}<section className="space-y-4"><h3 className="text-2xl">Lab source and verification</h3>{!c.documents.some(d=>d.purpose==="lab") && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">No lab documents uploaded yet.</p>}{c.documents.filter(d=>d.purpose==="lab").map(d=><LabEditor key={d.id} c={c} document={d} busy={action.isPending} aiAvailable={!!config.data?.ai && !!c.aiConsent} perform={perform}/>)}</section></TabsContent>
      <TabsContent value="assessment" forceMount hidden={tab!=="assessment"} className="space-y-5 data-[state=inactive]:hidden"><section aria-label="Assessment readiness" className="rounded-2xl border border-border bg-card p-6"><h3 className="text-xl">Assessment readiness</h3>{blockers.length?<ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">{blockers.map(reason=><li key={reason}>{reason}</li>)}</ul>:<p className="mt-3 text-sm leading-7 text-muted-foreground">Source checks are complete. Review the intake, evidence and safety considerations before saving and approving a report{c.reports.length?" version":""}.</p>}</section><ReviewNotes c={c} busy={action.isPending} perform={perform}/><ReportEditor c={c} busy={action.isPending} aiAvailable={!!config.data?.ai && !!c.aiConsent} perform={perform}/></TabsContent>
      <TabsContent value="reports" forceMount hidden={tab!=="reports"} className="space-y-6 data-[state=inactive]:hidden"><section className="overflow-hidden rounded-2xl border border-border bg-card"><h3 className="p-5 text-2xl sm:p-6">Released reports</h3>{!c.reports.length?<p className="px-6 pb-6 text-sm leading-7 text-muted-foreground">No report has been released. Complete the source checks and approve a saved assessment to create the first report version.</p>:<table className="w-full text-left text-sm"><caption className="sr-only">Released report versions</caption><thead className="border-y border-border bg-secondary/30 text-xs text-muted-foreground"><tr><th scope="col" className="p-3 sm:p-5">Version</th><th scope="col" className="p-3 sm:p-5">Reviewed</th><th scope="col" className="hidden p-5 sm:table-cell">Practitioner</th><th scope="col" className="p-3 sm:p-5"><span className="sr-only">View report</span></th></tr></thead><tbody>{c.reports.map((r,i)=><tr key={r.id} className={`border-b border-border last:border-0 ${report?.id===r.id?"bg-secondary/30":""}`}><th scope="row" className="p-3 text-xs font-medium sm:p-5">Version {i+1}</th><td className="p-3 text-xs sm:p-5">{new Date(r.approvedAt).toLocaleDateString()}</td><td className="hidden break-words p-5 text-xs sm:table-cell">{r.author}</td><td className="p-3 sm:p-5"><Button variant="outline" className="min-h-12" aria-label={`View report version ${i+1}`} aria-pressed={report?.id===r.id} onClick={()=>setReportId(r.id)}>{report?.id===r.id?"Viewing":"View"}</Button></td></tr>)}</tbody></table>}</section>{report && <ReportView report={report} customerName={c.customerName} printable={false}/>}</TabsContent>
      <TabsContent value="activity" forceMount hidden={tab!=="activity"} className="data-[state=inactive]:hidden"><section className="overflow-hidden rounded-2xl border border-border bg-card"><h3 className="p-5 text-2xl sm:p-6">Case activity</h3><table className="w-full table-fixed text-left text-xs"><caption className="sr-only">Case activity, most recent first</caption><thead className="border-y border-border bg-secondary/30 text-muted-foreground"><tr><th scope="col" className="w-[40%] p-4 font-medium">Time</th><th scope="col" className="p-4 font-medium">Action</th></tr></thead><tbody>{c.events.slice().reverse().map((e,i)=><tr key={i} className="border-b border-border last:border-0"><td className="p-4 align-top leading-6">{new Date(e.at).toLocaleString()}</td><td className="break-words p-4 align-top capitalize leading-6">{e.action.replace(/-/g," ")}</td></tr>)}</tbody></table>{!c.events.length && <p className="p-6 text-sm text-muted-foreground">No case activity yet.</p>}</section></TabsContent>
    </Tabs>
  </div>;
}
type Perform = (
  path: string,
  body: unknown,
  method?: string,
) => Promise<CareCase | undefined>;
type PanelProps = { c: CareCase; busy: boolean; perform: Perform };
function LabOrder({ c, busy, perform }: PanelProps) {
  const [details, setDetails] = useState(c.labRequest?.details || "");
  const [reference, setReference] = useState(
    c.labRequest?.externalReference || "",
  );
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-xl">Lab order request</h3>
      <p className="my-4 text-sm leading-7 text-muted-foreground">
        Arrange testing through your laboratory or ordering system, then record
        the issued order here. Saving this form does not place an order with a
        lab.
      </p>
      <Label htmlFor="order-details">
        Ordered tests and customer instructions
      </Label>
      <Textarea
        id="order-details"
        className="my-2"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <Label htmlFor="order-reference">External order reference</Label>
      <Input
        id="order-reference"
        className="my-2"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <Button
        className="mt-4"
        disabled={
          busy ||
          details.trim().length < 3 ||
          reference.trim().length < 2 ||
          !!c.reports.length
        }
        onClick={() =>
          perform("/lab-order", {
            revision: c.revision,
            details,
            externalReference: reference,
          })
        }
      >
        Record issued lab order
      </Button>
    </section>
  );
}
export function LabEditor({
  c,
  document: d,
  busy,
  aiAvailable,
  perform,
  demo = false,
}: PanelProps & { document: Document; aiAvailable: boolean; demo?: boolean }) {
  const empty: Extraction = {
    patientName: "",
    collectionDate: "",
    laboratory: "",
    uncertainty: "",
    results: [],
  };
  const [extraction, setExtraction] = useState<Extraction>(
    d.extraction || empty,
  );
  const [identity, setIdentity] = useState(false);
  const [note, setNote] = useState(d.verificationNote || "");
  const [kind,setKind]=useState(d.kind || "");
  const [criticalAction,setCriticalAction]=useState(d.criticalReview?.action || "");
  const [criticalConfirmed,setCriticalConfirmed]=useState(false);
  useEffect(()=>setKind(d.kind || ""),[d.kind]);
  useEffect(() => {
    setExtraction(d.extraction || empty);
    setIdentity(false);
  }, [d.extraction]);
  useEffect(() => setIdentity(false), [extraction]);
  const changeRow = (i: number, key: keyof LabRow, value: string) => {
    setIdentity(false);
    setExtraction({
      ...extraction,
      results: extraction.results.map((row, j) =>
        j === i ? { ...row, [key]: value } : row,
      ),
    });
  };
  const missingSource = [!extraction.patientName.trim() && "patient name", !extraction.collectionDate.trim() && "collection date", !extraction.laboratory.trim() && "laboratory", !extraction.results.length && "at least one result", ...extraction.results.flatMap((r,i)=>[(!r.name.trim() || !r.value.trim() || !r.sourcePage.trim()) && `complete source details for result ${i+1}`])].filter(Boolean);
  const classification=<div className="my-5 rounded-xl border border-border bg-secondary/20 p-4"><Label htmlFor={`${d.id}-kind`}>Document type</Label><select id={`${d.id}-kind`} value={kind} onChange={e=>setKind(e.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-border bg-card px-3 text-sm"><option value="">Select document type</option>{documentKinds.map(k=><option key={k} value={k}>{documentLabels[k]}</option>)}</select><p className="my-3 text-xs leading-6 text-muted-foreground">Orders list requested tests. Interpretations explain results. Only an original laboratory report supplies measurements. Changing the type clears extracted values, verification and any assessment draft.</p><Button variant="outline" disabled={busy || !kind || kind===d.kind || !!c.reports.length} onClick={()=>perform(`/documents/${d.id}/kind`,{revision:c.revision,kind},"PUT")}>Confirm document type</Button></div>;
  if(d.kind!=="laboratory-results") return <section className="rounded-2xl border border-border bg-card p-6"><h3 className="break-words text-xl">{d.name}</h3>{classification}<p className="text-sm leading-7 text-muted-foreground">{d.kind ? "Supporting context only. This document is excluded from laboratory measurements and result comparisons." : "Confirm the document type before extracting or verifying results."}</p>{!demo && <a className="mt-4 inline-flex min-h-11 items-center text-sm underline" href={`/api/cases/${c.id}/documents/${d.id}`}>Download original</a>}</section>;
  return (
    <details open className="group rounded-2xl border border-border bg-card p-4 sm:p-6">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden"><span className="min-w-0"><span className="block break-words font-serif text-lg">{d.name}</span><span className="mt-2 block text-xs text-muted-foreground">{d.verifiedAt ? "Verified source on file · save corrections to re-verify" : "Source verification needed"}</span></span><ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"/></summary>
      {classification}
      <div className="my-5 flex flex-wrap gap-3">
        {!demo && <a
          className="rounded-lg border border-border px-4 py-2 text-sm underline"
          href={`/api/cases/${c.id}/documents/${d.id}`}
        >
          Download original
        </a>}
        <Button
          variant="outline"
          disabled={busy || !aiAvailable || !!c.reports.length}
          onClick={() =>
            perform(`/labs/${d.id}/extract`, { revision: c.revision })
          }
        >
          {busy ? "Processing…" : "Extract lab facts with AI"}
        </Button>
      </div>
      {!aiAvailable && (
        <p className="mb-5 text-xs leading-6 text-muted-foreground">
          AI extraction needs server configuration and the customer’s AI
          permission. You can enter values from the original document below.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {(["patientName", "collectionDate", "laboratory"] as const).map(
          (key) => (
            <div key={key}>
              <Label htmlFor={`${d.id}-${key}`}>
                {key === "patientName"
                  ? "Patient name on document"
                  : key === "collectionDate"
                    ? "Collection date on document"
                    : "Laboratory"}
              </Label>
              <Input
                id={`${d.id}-${key}`}
                className="mt-2"
                value={extraction[key]}
                onChange={(e) =>
                  (setIdentity(false), setExtraction({ ...extraction, [key]: e.target.value }))
                }
              />
            </div>
          ),
        )}
      </div>
      <p className="my-5 text-xs leading-6 text-muted-foreground">
        Copy the original result, unit and laboratory reference interval. Do not
        substitute an “optimal” range or infer a flag that is absent from the
        source. Flag critical results for prompt clinical review.
      </p>
      <div>
        <table className="block w-full text-left text-xs lg:table">
          <caption className="sr-only">Laboratory results copied from the original report</caption>
          <thead className="hidden lg:table-header-group">
            <tr>
              {[
                "Marker",
                "Result",
                "Unit",
                "Reference range",
                "Source flag",
                "Page",
                "",
              ].map((t) => (
                <th className="p-2 font-medium" key={t}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="grid gap-4 lg:table-row-group">
            {extraction.results.map((row, i) => (
              <tr key={i} className="grid min-w-0 grid-cols-2 gap-3 rounded-xl border border-border p-4 lg:table-row lg:border-0 lg:p-0">
                {(["name", "value", "unit", "referenceRange"] as const).map(
                  (key) => (
                    <td key={key} className={`${key==="name"?"col-span-2":""} block min-w-0 lg:table-cell lg:p-1`}>
                      <span className="mb-2 block text-xs text-muted-foreground lg:hidden">{{name:"Marker",value:"Result",unit:"Unit",referenceRange:"Laboratory range"}[key]}</span>
                      <Input
                        aria-label={`${key} for result ${i + 1}`}
                        className="min-h-11 min-w-0 px-2 text-sm"
                        value={row[key]}
                        onChange={(e) => changeRow(i, key, e.target.value)}
                      />
                    </td>
                  ),
                )}
                <td className="block min-w-0 lg:table-cell lg:p-1">
                  <span className="mb-2 block text-xs text-muted-foreground lg:hidden">Source flag</span>
                  <select
                    aria-label={`Flag for result ${i + 1}`}
                    className="min-h-11 w-full rounded-lg border bg-background p-2 text-sm"
                    value={row.flag}
                    onChange={(e) => changeRow(i, "flag", e.target.value)}
                  >
                    {["unknown", "normal", "high", "low", "critical"].map(
                      (o) => (
                        <option key={o}>{o}</option>
                      ),
                    )}
                  </select>
                </td>
                <td className="block min-w-0 lg:table-cell lg:p-1">
                  <span className="mb-2 block text-xs text-muted-foreground lg:hidden">Source page</span>
                  <Input
                    aria-label={`Source page for result ${i + 1}`}
                    value={row.sourcePage}
                    className="min-h-11 w-full px-2 text-sm lg:w-16"
                    onChange={(e) => changeRow(i, "sourcePage", e.target.value)}
                  />
                </td>
                <td className="col-span-2 block lg:table-cell">
                  <Button
                    aria-label={`Remove result ${i + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExtraction({
                        ...extraction,
                        results: extraction.results.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4"/><span className="ml-2 lg:sr-only">Remove result</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="my-4"
        onClick={() =>
          setExtraction({
            ...extraction,
            results: [
              ...extraction.results,
              {
                name: "",
                value: "",
                unit: "",
                referenceRange: "",
                flag: "unknown",
                sourcePage: "",
              },
            ],
          })
        }
      >
        Add lab result
      </Button>
      <div>
        <Label htmlFor={`${d.id}-uncertainty`}>
          Extraction uncertainties or missing information
        </Label>
        <Textarea
          id={`${d.id}-uncertainty`}
          className="mt-2"
          value={extraction.uncertainty}
          onChange={(e) =>
            setExtraction({ ...extraction, uncertainty: e.target.value })
          }
        />
      </div>
      <div className="my-5 rounded-xl bg-secondary/30 p-4 text-sm leading-6"><h4 className="font-semibold">Before saving verification</h4>{missingSource.length ? <p className="mt-2">Complete: {missingSource.join(", ")}. Use the original report; do not guess missing details.</p> : <p className="mt-2">Required source details are filled in. Check values, units, ranges and flags against the original; leave units or ranges blank only if absent from the report. Confirm below and record a verification note.</p>}</div>
      <label className="my-5 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          checked={identity}
          onChange={(e) => setIdentity(e.target.checked)}
        />
        I checked the document’s patient identity and collection date against
        this customer, and reviewed every result against the original.
      </label>
      <Label htmlFor={`${d.id}-verification`}>Verification note</Label>
      <Textarea
        id={`${d.id}-verification`}
        className="mt-2"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Record corrections and any limitations."
      />
      <Button
        className="mt-5"
        disabled={
          busy ||
          !identity ||
          note.trim().length < 3 ||
          !!missingSource.length ||
          !!c.reports.length
        }
        onClick={() =>
          perform(
            `/labs/${d.id}/verify`,
            {
              revision: c.revision,
              extraction,
              identityConfirmed: identity,
              verificationNote: note,
            },
            "PUT",
          )
        }
      >
        Save verified lab facts
      </Button>
      {d.verifiedAt && d.extraction?.results.some(r=>r.flag==="critical") && <section className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5"><h4 className="text-lg">Critical laboratory flag: practitioner follow-up</h4><p className="my-3 text-xs leading-6">Record the clinical review, contact or escalation taken. Saving this note does not notify the client or emergency services.</p><Label htmlFor={`${d.id}-critical`}>Review and follow-up action</Label><Textarea id={`${d.id}-critical`} value={criticalAction} onChange={e=>setCriticalAction(e.target.value)} className="mt-2" /><label className="my-4 flex gap-3 text-sm"><input type="checkbox" checked={criticalConfirmed} onChange={e=>setCriticalConfirmed(e.target.checked)} className="h-5 w-5" />I have reviewed this flag and recorded the appropriate action.</label><Button disabled={busy || !criticalConfirmed || criticalAction.trim().length<10 || !!c.reports.length} onClick={()=>perform(`/labs/${d.id}/critical-review`,{revision:c.revision,confirmed:true,action:criticalAction},"PUT")}>Record critical-result review</Button>{d.criticalReview && <p className="mt-3 text-xs">Review recorded. Re-verifying or re-extracting the source requires a new critical-result review.</p>}</section>}
    </details>
  );
}
function ReviewNotes({ c, busy, perform }: PanelProps) {
  const [notes, setNotes] = useState(c.practitionerNotes);
  const [followup, setFollowup] = useState(c.followupRequest);
  useEffect(() => {
    setNotes(c.practitionerNotes);
    setFollowup(c.followupRequest);
  }, [c.practitionerNotes, c.followupRequest]);
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-5 text-xl">Practitioner review</h3>
      <Label htmlFor="practitioner-notes">Private clinical notes</Label>
      <Textarea
        id="practitioner-notes"
        className="my-2 min-h-28"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <p className="mb-5 text-xs leading-6 text-muted-foreground">
        These notes are kept out of the customer dashboard. They may be used for
        report drafting if the customer allows AI processing.
      </p>
      <Label htmlFor="followup-request">
        Information requested from the customer
      </Label>
      <Textarea
        id="followup-request"
        className="my-2"
        value={followup}
        onChange={(e) => setFollowup(e.target.value)}
      />
      <p className="mb-4 text-xs text-muted-foreground">
        This message appears in the customer dashboard. Clear it once the
        question is resolved.
      </p>
      <Button
        disabled={busy}
        onClick={() =>
          perform(
            "/review",
            {
              revision: c.revision,
              practitionerNotes: notes,
              followupRequest: followup,
            },
            "PUT",
          )
        }
      >
        Save review notes
      </Button>
    </section>
  );
}
const reportGuidance: Record<keyof Report,string> = {
  overview: "Connect the client's goals and intake with the reviewed evidence.",
  labs: "Separate original measurements and laboratory flags from your interpretation. Keep source references visible.",
  tcm: "Practitioner assessment only. Record supporting observations and limitations; automated diagnostic criteria are pending.",
  priorities: "List the most useful next steps in order, including who will follow up and when.",
  nutrition: "Explain practical food guidance and any relevant restrictions or uncertainties.",
  lifestyle: "Offer clear, achievable guidance on movement, rest and daily routines.",
  recommendations: "Record the reviewed care recommendations and relevant medication, allergy or supplement checks.",
  safety: "Document precautions, escalation advice and the follow-up plan."
};
export function ReportEditor({
  c,
  busy,
  aiAvailable,
  perform,
  demo = false,
}: PanelProps & { aiAvailable: boolean; demo?: boolean }) {
  const [content, setContent] = useState<Report>(
    c.draft?.content || blankReport,
  );
  const [preview, setPreview] = useState(false);
  const [summaryError, setSummaryError] = useState<unknown>();
  const [approve, setApprove] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setContent(c.draft?.content || blankReport);
    setDirty(false);
    setApprove(false);
  }, [c.draft]);
  const blockers=reviewBlockers(c);
  const ready = blockers.length===0;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-3 text-xs uppercase tracking-[.15em] text-muted-foreground">
        Practitioner-only draft
      </p>
      <h3 className="text-2xl">The combined care report</h3>
      <p className="my-4 text-sm leading-7 text-muted-foreground">
        Write in everyday language. Keep lab evidence and TCM hypotheses
        distinct. Review proposed supplements, vitamins and TCM services against
        medications, allergies and other contraindications before release.
      </p>
      {!ready && (
        <p className="mb-5 rounded-lg bg-secondary/50 p-4 text-xs leading-6">
          {blockers.join(" ")}
        </p>
      )}
      <LabEducationPanel c={c}/>
      <ErrorMessage error={summaryError}/>
      <Button variant="outline" className="mb-3 min-h-12 max-w-full whitespace-normal" disabled={busy || !ready || !!content.labs.trim()} onClick={()=>{
        setSummaryError(undefined);
        try{setContent({...content,labs:prepareReferenceLabSection(c)});setDirty(true);setApprove(false);}catch(error){setSummaryError(error);}
      }}>Prepare source-linked lab section</Button>
      <p className="mb-6 text-xs leading-6 text-muted-foreground">No AI service is used. Preparation fills an empty lab section only; your other edits are preserved. Review the text and save the draft. The remaining sections must be completed before release.</p>
      <Button
        variant="outline"
        className="mb-6"
        disabled={busy || !ready || !aiAvailable}
        onClick={() => perform("/draft", { revision: c.revision, ai: true })}
      >
        {busy ? "Working…" : "Create AI-assisted draft"}
      </Button>
      {!aiAvailable && (
        <p className="mb-5 text-xs text-muted-foreground">
          Manual report editing is available. AI drafting requires customer
          permission and a configured server key.
        </p>
      )}
      <div className="mb-6 rounded-xl bg-secondary/30 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm">{Object.values(content).filter(v=>v.trim()).length} of {Object.keys(reportFields).length} sections filled · {dirty ? "Unsaved changes" : c.draft ? "Saved draft" : "Not saved"}</p><Button variant="outline" className="min-h-11" aria-pressed={preview} onClick={()=>setPreview(!preview)}>{preview ? "Continue editing" : "Preview client layout"}</Button></div><p className="mt-3 text-xs leading-6 text-muted-foreground">Filled sections still need clinical review. Previewing does not save, approve or share the report.</p></div>
      {preview && <section aria-label="Unreleased report preview" className="mb-6 rounded-xl border border-border p-5 sm:p-8"><p className="mb-5 text-xs font-semibold uppercase tracking-widest">Draft preview · Not released</p><h4 className="mb-6 text-2xl">{c.customerName}</h4><ReportContent content={content} showEmpty/></section>}
      <div hidden={preview} className="space-y-6">
        {Object.entries(reportFields).map(([key, label]) => (
          <div key={key} className="rounded-xl border border-border p-4 sm:p-5">
            <Label className="text-base" htmlFor={`report-${key}`}>{label}</Label>
            <p id={`report-${key}-hint`} className="mt-2 text-xs leading-6 text-muted-foreground">{reportGuidance[key as keyof Report]}</p>
            <Textarea
              aria-describedby={`report-${key}-hint`}
              className="mt-3 min-h-36 text-base"
              id={`report-${key}`}
              value={content[key as keyof Report]}
              onChange={(e) => {
                setContent({ ...content, [key]: e.target.value });
                setDirty(true);
                setApprove(false);
              }}
            />
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-6"
        disabled={busy || !ready}
        onClick={() =>
          perform("/draft", { revision: c.revision, content, ai: false })
        }
      >
        Save report draft
      </Button>
      <label className="my-6 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          checked={approve}
          onChange={(e) => setApprove(e.target.checked)}
        />
        I reviewed the verified lab source and intake, checked the
        recommendations and safety considerations, and approve this report for
        the customer.
      </label>
      <Button
        disabled={
          busy ||
          !ready ||
          !approve ||
          !c.draft ||
          dirty ||
          Object.values(content).some((v) => !v.trim())
        }
        onClick={() =>
          perform("/approve", { revision: c.revision, confirmation: true })
        }
      >
        {demo ? "Simulate approval and release" : "Approve and release report"}
      </Button>
      {dirty && (
        <p className="mt-3 text-xs text-muted-foreground">
          Save your edits before releasing the report.
        </p>
      )}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        {demo ? "Simulation only: creates an in-memory fictional report. Nothing is saved to a server or emailed." : "Release creates a saved report version in the customer’s dashboard. Email delivery is not configured."}
      </p>
    </section>
  );
}
