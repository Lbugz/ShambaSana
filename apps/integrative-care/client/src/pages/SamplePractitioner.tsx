import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, RotateCcw, ClipboardCheck } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/CareLayout";
import { ReportView } from "@/components/ReportView";
import { LabEditor, ReportEditor } from "./AdminDashboard";
import { createSamplePractitionerCase, fictionalDraft } from "@/lib/sample-practitioner";
import { documentKinds, reviewBlockers, verificationProblems } from "@shared/care-review";
import { extractionSchema, reportSchema, type CareCase } from "@shared/care";

export default function SamplePractitioner(){
  const [c,setCase]=useState(createSamplePractitionerCase);
  const [tab,setTab]=useState("Source review");
  const [error,setError]=useState<unknown>();
  const [notice,setNotice]=useState("");
  const blockers=reviewBlockers(c);
  const perform=async(path:string,body:unknown):Promise<CareCase|undefined>=>{
    setError(undefined);setNotice("");
    try{
      const b=body as Record<string,any>;
      if(b.revision!==c.revision) throw new Error("The sample case changed. Review the latest version.");
      const next=structuredClone(c);
      const document=next.documents.find(d=>path.includes(`/${d.id}/`));
      if(path.endsWith("/kind") && document){
        if(next.reports.length) throw new Error("This sample report is already released. Reset the rehearsal to change its sources.");
        if(!documentKinds.includes(b.kind)) throw new Error("Choose a document type.");
        if(document.kind!==b.kind){document.kind=b.kind;document.extraction=undefined;document.verifiedAt=undefined;document.verifiedBy=undefined;document.criticalReview=undefined;next.draft=undefined;}
      }else if(path.endsWith("/verify") && document){
        const extraction=extractionSchema.parse(b.extraction);
        const problems=verificationProblems({...document,extraction});
        if(problems.length || b.identityConfirmed!==true || !b.verificationNote?.trim()) throw new Error(problems.join(" ") || "Confirm the source identity and add your verification note.");
        document.extraction=extraction;document.verifiedAt=new Date().toISOString();document.verifiedBy="simulation";document.verificationNote=b.verificationNote;document.criticalReview=undefined;next.draft=undefined;
      }else if(path.endsWith("/critical-review") && document){
        if(!document.verifiedAt || b.confirmed!==true || b.action?.trim().length<10) throw new Error("Verify the source and record the follow-up action.");
        document.criticalReview={reviewedAt:new Date().toISOString(),reviewedBy:"simulation",action:b.action};next.draft=undefined;
      }else if(path==="/draft"){
        if(reviewBlockers(next).length) throw new Error(reviewBlockers(next).join(" "));
        if(b.ai) throw new Error("External AI is disabled in this rehearsal.");
        next.draft={content:reportSchema.parse(b.content),author:"simulation",createdAt:new Date().toISOString(),source:"manual",basedOnRevision:next.revision+1};
      }else if(path==="/approve"){
        if(reviewBlockers(next).length || !next.draft || next.draft.basedOnRevision!==next.revision || b.confirmation!==true || Object.values(next.draft.content).some(v=>!v.trim())) throw new Error("Complete source checks, save a current draft and confirm the simulated approval.");
        next.reports.push({id:`sample-version-${next.reports.length+1}`,createdAt:next.draft.createdAt,author:"Fictional reviewer — simulation",content:next.draft.content,approvedAt:new Date().toISOString(),sourceRevision:next.revision});next.draft=undefined;
      }else throw new Error("That action is not part of this local rehearsal.");
      next.revision++;next.updatedAt=new Date().toISOString();next.events.push({at:next.updatedAt,actor:"simulation",action:path.endsWith("/approve")?"simulated-release":path});setCase(next);setNotice(path==="/approve"?"Simulated release complete. Open Client view to inspect it.":"Sample case updated in memory. No server record or email was created.");return next;
    }catch(e){setError(e);return undefined;}
  };
  return <div className="min-h-screen bg-background"><header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4"><Brand subtitle="PRACTITIONER WORKSPACE"/><Link href="/sample-results" className="inline-flex min-h-11 items-center gap-2 text-sm"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>Client workspace preview</Link></div></header><div className="bg-secondary px-5 py-3 text-center text-xs leading-6"><strong>Fictional practitioner rehearsal.</strong> In-memory simulation. No patient data, AI requests, clinical approvals or emails.</div><main className="mx-auto max-w-6xl px-5 py-9"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">Verify. Understand. Review. Release.</p><h1 className="text-3xl sm:text-4xl">One case. A complete review.</h1><p className="mt-3 text-sm text-muted-foreground">Example client · Unpaid rehearsal · Revision {c.revision}</p></div><Button variant="outline" className="min-h-11" onClick={()=>{setCase(createSamplePractitionerCase());setError(undefined);setNotice("");setTab("Source review");}}><RotateCcw aria-hidden="true" className="mr-2 h-4 w-4"/>Reset rehearsal</Button></div><nav aria-label="Practitioner review stages" className="mb-7 flex flex-wrap gap-2">{["Source review","Assessment draft","Client view","Activity"].map(t=><button key={t} aria-current={tab===t?"page":undefined} onClick={()=>setTab(t)} className={`min-h-12 rounded-full border px-5 text-sm ${tab===t?"border-primary bg-primary text-white":"border-border bg-card"}`}>{t}</button>)}</nav><ErrorMessage error={error}/>{notice && <p role="status" className="my-5 rounded-xl bg-secondary p-4 text-sm">{notice}</p>}
    {tab==="Source review" && <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]"><div className="min-w-0 space-y-5"><section className="rounded-2xl border border-border bg-card p-6"><h2 className="text-2xl">Intake and clinical context</h2><p className="my-4 text-sm leading-7 text-muted-foreground">This rehearsal uses a submitted fictional intake. Your real pilot case still needs your own intake and the reviewing practitioner's observations; a lab PDF cannot supply those answers.</p><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Main concern</dt><dd className="mt-2">{c.intake.concern}</dd></div><div><dt className="text-xs text-muted-foreground">TCM observations</dt><dd className="mt-2">{c.intake.tongueNotes}</dd></div></dl></section>{c.documents.map(d=><LabEditor key={d.id} c={c} document={d} busy={false} aiAvailable={false} perform={perform} demo/>)}</div><aside className="rounded-2xl border border-primary/10 bg-card p-6 lg:sticky lg:top-6"><ClipboardCheck aria-hidden="true" className="mb-4 h-6 w-6"/><h2 className="text-xl">Review readiness</h2>{blockers.length?<ul className="mt-5 list-disc space-y-3 pl-4 text-sm leading-6 text-muted-foreground">{blockers.map(b=><li key={b}>{b}</li>)}</ul>:<p className="mt-4 text-sm leading-7">Source checks are complete. Create and edit the fictional draft, then explicitly simulate approval.</p>}<Button className="mt-5 min-h-12 w-full" disabled={!!blockers.length} onClick={()=>setTab("Assessment draft")}>Continue to assessment</Button></aside></div>}
    {tab==="Assessment draft" && <div className="space-y-5"><section className="rounded-2xl border border-border bg-secondary/30 p-6"><h2 className="text-xl">Drafting with a human reviewer</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">The template below demonstrates report sections. It does not interpret your reports or create a TCM diagnosis. External AI is off. All real recommendations require the responsible practitioner's review.</p><Button variant="outline" disabled={!!blockers.length} className="mt-4 min-h-12" onClick={()=>perform("/draft",{revision:c.revision,content:fictionalDraft,ai:false})}>Load fictional draft template</Button></section><ReportEditor c={c} busy={false} aiAvailable={false} perform={perform} demo/></div>}
    {tab==="Client view" && <section className="space-y-5"><h2 className="text-2xl">What the client receives</h2>{c.reports.length?<><p className="flex items-center gap-2 text-sm"><CheckCircle2 aria-hidden="true" className="h-5 w-5"/>Simulated release only. No clinical report was approved for a real person.</p>{c.reports.map(r=><ReportView key={r.id} report={r} customerName="Fictional example client" printable={false}/>)}</>:<div className="rounded-2xl border border-dashed border-border p-8"><h3 className="text-xl">The report is not released.</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">An unapproved draft stays in the practitioner workspace. Complete the source review, save the draft and simulate approval to see this step.</p></div>}</section>}
    {tab==="Activity" && <section className="rounded-2xl border border-border bg-card p-6"><h2 className="text-2xl">Rehearsal activity</h2>{!c.events.length?<p className="mt-4 text-sm text-muted-foreground">No actions yet. Start with Source review.</p>:<ol className="mt-5 space-y-4 text-sm">{c.events.map((e,i)=><li key={i} className="border-b border-border pb-4"><span className="text-xs text-muted-foreground">Step {i+1} · Simulation</span><p className="mt-2 break-words">{e.action}</p></li>)}</ol>}</section>}
    </main></div>;
}
