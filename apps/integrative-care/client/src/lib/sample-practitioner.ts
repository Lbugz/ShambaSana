import { blankIntake, type CareCase, type Report } from "@shared/care";
import { latestSamples, sampleMarkers } from "./sample-results";

export const fictionalDraft: Report = {
  overview: "FICTIONAL WORKFLOW EXAMPLE. This text demonstrates an editable practitioner report; it is not a clinical assessment.",
  labs: "The sample laboratory report has been checked against its fictional source. Original values, units, reference intervals and source pages are retained. Laboratory flags require clinical context.",
  tcm: "No TCM diagnosis is generated in this rehearsal. A practitioner would assess the submitted intake and document the basis, limitations and uncertainties of any TCM interpretation separately from laboratory findings.",
  priorities: "Example next step: discuss the reviewed findings and outstanding questions with the practitioner.",
  nutrition: "No personalized food, supplement or dosing advice is provided by this example.",
  lifestyle: "A real report would record agreed priorities around movement, rest and routines, based on the client's circumstances.",
  recommendations: "This rehearsal does not recommend or prescribe treatments. The responsible practitioner must write and approve real recommendations.",
  safety: "Confirm the appropriate follow-up owner and timing. The care workspace is not monitored for emergencies. No real notification is sent by this rehearsal.",
};
export function createSamplePractitionerCase(): CareCase {
  const at="2026-04-20T10:00:00Z";
  return {
    id:"fictional-practitioner-rehearsal",revision:0,customerId:"fictional-example",customerName:"Example client",customerEmail:"client@example.invalid",createdAt:at,updatedAt:at,
    consent:{version:"pilot-v1",acceptedAt:at}, payment:{status:"unpaid-pilot",amount:0,currency:"usd"},
    intake:{...blankIntake,name:"Example client",age:"44",concern:"Fictional intake for a workflow rehearsal",history:"No personal history supplied in this example",medications:"No personal medication list supplied",allergies:"No personal allergy list supplied",pregnancy:"not-applicable",pain:"0",energy:"6",sleep:"6",stress:"4",goals:"Understand the review and release process",tongueNotes:"No examination or tongue image in this fictional case"},
    intakeSubmittedAt:at,practitionerNotes:"",followupRequest:"",reports:[],events:[],
    documents:[
      {id:"example-order",name:"Sample test order",mime:"text/plain",size:0,purpose:"lab",uploadedAt:at},
      {id:"example-results",name:"Sample original laboratory results",mime:"text/plain",size:0,purpose:"lab",kind:"laboratory-results",uploadedAt:at,extraction:{patientName:"Example client",collectionDate:"2026-04-13",laboratory:"Fictional reference laboratory",uncertainty:"Invented data for interface testing. No real source file is attached.",results:latestSamples.slice(0,3).map(row=>({name:sampleMarkers.find(m=>m.id===row.markerId)!.name,value:row.originalValue,unit:row.unit,referenceRange:row.reference.text,flag:row.labFlag,sourcePage:String(row.sourcePage)}))}},
      {id:"example-interpretation",name:"Sample prior interpretation",mime:"text/plain",size:0,purpose:"lab",kind:"practitioner-report",uploadedAt:at},
    ],
  };
}
