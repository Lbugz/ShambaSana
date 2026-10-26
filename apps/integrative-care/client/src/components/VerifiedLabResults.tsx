import { FileCheck2 } from "lucide-react";
import type { Document } from "@shared/care";

const flags = { normal: "Within laboratory range", high: "High — laboratory flag", low: "Low — laboratory flag", critical: "Critical — laboratory flag", unknown: "No confirmed laboratory flag" };

export function VerifiedLabResults({ documents }: { documents: Document[] }) {
  const verified = documents.filter(d=>d.purpose==="lab" && d.kind==="laboratory-results" && d.verifiedAt && d.extraction?.results.length);
  if (!verified.length) return null;
  return <section className="space-y-5" aria-labelledby="verified-results-heading">
    <div><h2 id="verified-results-heading" className="text-2xl">Your verified lab results</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Your practitioner checked these values against the original laboratory report. Reference ranges and flags come from that report; they are not a diagnosis. Your care report explains the findings in context.</p></div>
    {verified.map(d=><article key={d.id} className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3"><FileCheck2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary"/><div className="min-w-0"><h3 className="break-words text-lg">{d.extraction!.laboratory}</h3><p className="mt-2 break-words text-xs leading-6 text-muted-foreground">Collection date: {d.extraction!.collectionDate} · {d.name}</p></div></div>
      <div className="grid gap-3 sm:grid-cols-2">{d.extraction!.results.map((r,i)=><div key={i} className="min-w-0 rounded-xl border border-border p-4"><h4 className="break-words text-sm font-semibold">{r.name}</h4><p className="mt-3 break-words text-2xl">{r.value}<span className="ml-2 text-sm text-muted-foreground">{r.unit}</span></p><p className="mt-3 break-words text-xs leading-6 text-muted-foreground">Laboratory range: {r.referenceRange || "Not stated"}</p><p className={`mt-2 text-xs leading-6 ${r.flag==="normal" || r.flag==="unknown" ? "text-muted-foreground" : "font-semibold text-amber-900"}`}>{flags[r.flag]}</p><p className="mt-2 text-xs text-muted-foreground">Source page: {r.sourcePage}</p></div>)}</div>
      {d.extraction!.uncertainty && <p className="mt-5 whitespace-pre-wrap break-words text-xs leading-6 text-muted-foreground">Source limitations: {d.extraction!.uncertainty}</p>}
    </article>)}
  </section>;
}
