import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FileCheck2 } from "lucide-react";
import type { Document } from "@shared/care";

const flags = { normal: "Within laboratory range", high: "High — laboratory flag", low: "Low — laboratory flag", critical: "Critical — laboratory flag", unknown: "No confirmed laboratory flag" };

export function VerifiedLabResults({ documents, documentUrl }: { documents: Document[]; documentUrl?: (id:string)=>string }) {
  const [search,setSearch]=useState("");
  const [flagged,setFlagged]=useState(false);
  const verified = documents.filter(d=>d.purpose==="lab" && d.kind==="laboratory-results" && d.verifiedAt && d.extraction?.results.length);
  if (!verified.length) return null;
  return <section className="space-y-5" aria-labelledby="verified-results-heading">
    <div><h2 id="verified-results-heading" className="text-2xl">Your verified lab results</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Your practitioner checked these values against the original laboratory report. Reference ranges and flags come from that report; they are not a diagnosis. Your care report explains the findings in context.</p></div>
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-secondary/30 p-4"><label className="min-w-0 flex-1 text-xs font-medium" htmlFor="verified-result-search">Find a marker<Input id="verified-result-search" className="mt-2 min-h-12 text-base" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by marker or laboratory"/></label><Button variant={flagged?"default":"outline"} className="min-h-12" aria-pressed={flagged} onClick={()=>setFlagged(!flagged)}>Laboratory flags only</Button>{(search || flagged) && <Button variant="ghost" className="min-h-12" onClick={()=>{setSearch("");setFlagged(false);}}>Clear filters</Button>}</div>
    <p role="status" className="text-xs text-muted-foreground">{verified.reduce((n,d)=>n+d.extraction!.results.filter(r=>(!flagged || ["high","low","critical"].includes(r.flag)) && `${r.name} ${d.extraction!.laboratory}`.toLowerCase().includes(search.trim().toLowerCase())).length,0)} matching results · Original laboratory ranges retained</p>
    {verified.map(d=>{const rows=d.extraction!.results.filter(r=>(!flagged || ["high","low","critical"].includes(r.flag)) && `${r.name} ${d.extraction!.laboratory}`.toLowerCase().includes(search.trim().toLowerCase()));if(!rows.length)return null;return <article key={d.id} className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3"><FileCheck2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary"/><div className="min-w-0"><h3 className="break-words text-lg">{d.extraction!.laboratory}</h3><p className="mt-2 break-words text-xs leading-6 text-muted-foreground">Collection date: {d.extraction!.collectionDate} · {d.name}</p>{documentUrl && <a className="mt-2 inline-flex min-h-11 items-center text-xs underline underline-offset-4" href={documentUrl(d.id)}>Download original report</a>}</div></div>
      <div className="grid gap-3 sm:grid-cols-2">{rows.map((r,i)=><div key={i} className="min-w-0 rounded-xl border border-border p-4"><h4 className="break-words text-sm font-semibold">{r.name}</h4><p className="mt-3 break-words text-2xl">{r.value}<span className="ml-2 text-sm text-muted-foreground">{r.unit}</span></p><p className="mt-3 break-words text-xs leading-6 text-muted-foreground">Laboratory range: {r.referenceRange || "Not stated"}</p><p className={`mt-2 text-xs leading-6 ${r.flag==="normal" || r.flag==="unknown" ? "text-muted-foreground" : "font-semibold text-amber-900"}`}>{flags[r.flag]}</p><p className="mt-2 text-xs text-muted-foreground">Source page: {r.sourcePage}</p></div>)}</div>
      {d.extraction!.uncertainty && <p className="mt-5 whitespace-pre-wrap break-words text-xs leading-6 text-muted-foreground">Source limitations: {d.extraction!.uncertainty}</p>}
    </article>;})}
    {!verified.some(d=>d.extraction!.results.some(r=>(!flagged || ["high","low","critical"].includes(r.flag)) && `${r.name} ${d.extraction!.laboratory}`.toLowerCase().includes(search.trim().toLowerCase()))) && <p className="rounded-xl border border-dashed border-border p-5 text-sm">No results match these filters. Clear them to see all verified measurements.</p>}
  </section>;
}
