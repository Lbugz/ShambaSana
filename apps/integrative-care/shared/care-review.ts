import { intakeErrors, type CareCase, type Document } from "./care";

export const documentKinds = ["requisition", "laboratory-results", "practitioner-report"] as const;
export const documentLabels = { requisition: "Test order / requisition", "laboratory-results": "Laboratory results", "practitioner-report": "Practitioner interpretation" };
export const laboratoryDocuments = (c: CareCase) => c.documents.filter(d => d.purpose === "lab" && d.kind === "laboratory-results");
export function verificationProblems(d: Document) {
  const e = d.extraction;
  const reasons: string[] = [];
  if (d.kind !== "laboratory-results") reasons.push("Only original laboratory results can be verified as measurements.");
  if (!e?.patientName.trim() || !e.collectionDate.trim() || !e.laboratory.trim()) reasons.push("Record the source patient name, collection date and laboratory.");
  if (!e?.results.length) reasons.push("Enter at least one result from the laboratory report.");
  if (e?.results.some(r => !r.name.trim() || !r.value.trim() || !r.sourcePage.trim())) reasons.push("Every result needs a marker, original value and source page.");
  return reasons;
}
export function reviewBlockers(c: CareCase) {
  const reasons: string[] = [];
  if (!["paid", "unpaid-pilot"].includes(c.payment.status)) reasons.push("Complete enrollment first.");
  if (!c.intakeSubmittedAt || intakeErrors(c.intake).length) reasons.push("Complete and submit the client intake.");
  if (c.documents.some(d => d.purpose === "lab" && !d.kind)) reasons.push("Classify each supporting document before review.");
  const labs = laboratoryDocuments(c);
  if (!labs.length) reasons.push("Add an original laboratory results report; orders and interpretations are not measurements.");
  if (labs.some(d => !d.verifiedAt || verificationProblems(d).length)) reasons.push("Verify the source identity, collection date and all laboratory values.");
  if (labs.some(d => d.extraction?.results.some(r => r.flag === "critical") && !d.criticalReview)) reasons.push("Record the practitioner's review and follow-up action for critical laboratory flags.");
  if (c.followupRequest.trim()) reasons.push("Resolve the outstanding client follow-up request.");
  return reasons;
}
