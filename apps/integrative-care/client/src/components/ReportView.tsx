import { labEducation } from "@shared/lab-education";
import { reportFields, type Report, type ReportVersion } from "@shared/care";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";
const educationUrls=new Set(labEducation.map(source=>source.url));
function sourceLinkedText(value:string){
  return value.split(/(https:\/\/medlineplus\.gov\/[^\s]+)/g).map((part,index)=>educationUrls.has(part)?<a key={index} href={part} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4">{part}</a>:part);
}
export function ReportView({
  report,
  customerName,
  printable = true,
}: {
  report: ReportVersion;
  customerName: string;
  printable?: boolean;
}) {
  return (
    <article className="report-view rounded-2xl border border-border bg-card p-6 md:p-10 print:border-0 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[.2em] text-muted-foreground">
            Shamba Sana · Personal care report
          </p>
          <h2 className="text-3xl">{customerName}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reviewed by {report.author} ·{" "}
            {new Date(report.approvedAt).toLocaleDateString()}
          </p>
        </div>
        {printable && (
          <Button
            variant="outline"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / save PDF
          </Button>
        )}
      </div>
      <ReportContent content={report.content}/>

    </article>
  );
}

export function ReportContent({content,showEmpty=false}:{content:Report;showEmpty?:boolean}) {
  return <div className="mt-8 grid gap-8">{Object.entries(reportFields).map(([key,label],index)=>{
    const value=content[key as keyof Report];
    if(!value.trim() && !showEmpty) return null;
    return <section key={key} className="min-w-0 break-inside-avoid border-t border-border pt-6 first:border-0 first:pt-0"><p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{String(index+1).padStart(2,"0")} / {key==="labs"?"Laboratory evidence":key==="tcm"?"Practitioner assessment":"Care guidance"}</p><h3 className="mb-3 text-xl">{label}</h3><p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/85">{value.trim()?sourceLinkedText(value):<span className="italic text-muted-foreground">Not yet written — practitioner input required.</span>}</p></section>;
  })}</div>;
}
