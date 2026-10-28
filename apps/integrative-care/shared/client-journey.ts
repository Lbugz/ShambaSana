import { intakeErrors, type CareCase } from "./care";
import { verificationProblems } from "./care-review";

export function clientJourney(c: CareCase) {
  const labs = c.documents.filter(d => d.purpose === "lab");
  const originals = labs.filter(d => d.kind === "laboratory-results");
  const intakeDone = !!c.intakeSubmittedAt && !intakeErrors(c.intake).length;
  const labsDone = !!originals.length && originals.every(d => d.verifiedAt && !verificationProblems(d).length) && labs.every(d => !!d.kind);
  const enrolled = c.payment.status === "paid" || c.payment.status === "unpaid-pilot";
  const milestones = [
    { label: "Enrollment", done: enrolled },
    { label: "Intake submitted", done: intakeDone },
    { label: "Results verified", done: labsDone },
    { label: "Report ready", done: !!c.reports.length },
  ];
  const common = { milestones, intakeDone, labsDone, enrolled };
  if (c.payment.status === "refunded") return { ...common, stage: "paused", title: "Care episode paused", detail: "Payment was refunded. Contact your care team before continuing.", action: "View episode details", tab: "overview" };
  if (!enrolled) return { ...common, stage: "enrollment", title: "Complete enrollment", detail: "Your intake opens once enrollment is confirmed. Returning from checkout alone does not confirm payment.", action: "View enrollment", tab: "overview" };
  if (c.followupRequest.trim()) return { ...common, stage: "followup", title: c.followupResponse ? "Your reply is awaiting review" : "More information needed", detail: c.followupResponse ? "Your reply is saved. Your practitioner will review it before closing the request." : "Your practitioner has a question. Read it and reply in your overview.", action: "View practitioner question", tab: "overview" };
  if (c.reports.length) return { ...common, stage: "released", title: "Your report is ready", detail: "Read the findings, next steps and safety guidance reviewed by your practitioner.", action: "Read your report", tab: "report" };
  if (!intakeDone) return { ...common, stage: "intake", title: "Tell us about your health", detail: "Complete your intake and submit it for practitioner review. Saved progress stays private to your care record.", action: "Continue intake", tab: "intake" };
  if (!labs.length) return { ...common, stage: "documents", title: "Your intake is submitted", detail: c.labRequest ? "Your testing request is recorded. View its status or add existing original results." : "Add your original laboratory results, or request help arranging new tests.", action: "Add lab documents", tab: "documents" };
  return { ...common, stage: "review", title: "Practitioner review in progress", detail: labsDone ? "Your intake and verified results are ready for the practitioner's assessment. The report appears after approval." : "Your intake is submitted and your documents are received. Your practitioner is checking document types and original results.", action: "View documents", tab: "documents" };
}

export function uploadIssue(file: {name: string; size: number; type: string}, purpose: "lab" | "tongue" = "lab") {
  const extension = file.name.toLowerCase().split(".").pop() || "";
  const types: Record<string,string> = {pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",txt:"text/plain",csv:"text/csv"};
  const mime = types[extension];
  if (!mime || (purpose === "tongue" && !mime.startsWith("image/"))) return "Choose a supported file: " + (purpose === "tongue" ? "JPG, PNG or WebP." : "PDF, JPG, PNG, WebP, TXT or CSV.");
  if (file.type && file.type !== mime && !(extension === "csv" && file.type === "application/vnd.ms-excel")) return "The file type does not match its extension. Export the original report again.";
  if (!file.size) return "This file is empty. Choose the complete original report.";
  const limit = extension === "txt" || extension === "csv" ? 512 * 1024 : 5 * 1024 * 1024;
  if (file.size > limit) return limit === 512 * 1024 ? "Text and CSV files must be 512 KB or smaller." : "Choose a file of 5 MB or smaller.";
  if (file.name.length > 160) return "Shorten the file name to 160 characters or fewer.";
  return "";
}

export function uploadMime(file: {name:string;type:string}) {
  const extension=file.name.toLowerCase().split(".").pop() || "";
  const types:Record<string,string>={pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",txt:"text/plain",csv:"text/csv"};
  return extension==="csv" ? "text/csv" : file.type || types[extension] || "";
}
