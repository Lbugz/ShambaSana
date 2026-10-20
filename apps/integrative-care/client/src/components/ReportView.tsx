import { reportFields, type ReportVersion } from "@shared/care";
import { Button } from "./ui/button";
import { Printer } from "lucide-react";
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
      <div className="mt-8 grid gap-8">
        {Object.entries(reportFields).map(([key, label]) => (
          <section key={key} className="break-inside-avoid">
            <h3 className="mb-3 text-xl">{label}</h3>
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
              {report.content[key as keyof typeof reportFields]}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
