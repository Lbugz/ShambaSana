import test from "node:test";
import assert from "node:assert/strict";
import { blankIntake, type CareCase } from "../shared/care";
import { educationForMarker, labEvidenceForCase, prepareReferenceLabSection } from "../shared/lab-education";

function fixture():CareCase {
  return {id:"fictional",revision:1,customerId:"example",customerName:"Example",customerEmail:"example@example.invalid",createdAt:"2026-01-01",updatedAt:"2026-01-01",consent:{version:"pilot-v1",acceptedAt:"2026-01-01"},payment:{status:"unpaid-pilot",amount:0,currency:"usd"},intake:{...blankIntake,name:"Example",age:"40",concern:"Fictional test",history:"none",medications:"none",allergies:"none",pregnancy:"not-applicable",pain:"0",energy:"5",sleep:"5",stress:"0"},intakeSubmittedAt:"2026-01-01",practitionerNotes:"PRIVATE NOTE MUST NOT COPY",followupRequest:"",reports:[],events:[],documents:[{id:"lab",name:"fictional-lab.txt",purpose:"lab",kind:"laboratory-results",mime:"text/plain",size:1,uploadedAt:"2026-01-01",verifiedAt:"2026-01-01",verifiedBy:"fictional-reviewer",extraction:{patientName:"Example",laboratory:"Example laboratory",collectionDate:"2026-01-01",uncertainty:"",results:[{name:"Glucose",value:"88",unit:"mg/dL",referenceRange:"70-99",flag:"unknown",sourcePage:"1"},{name:"ApoB",value:"96",unit:"mg/dL",referenceRange:"<90",flag:"high",sourcePage:"2"}]}}]};
}
test("exact education aliases avoid confusing distinct tests",()=>{
  assert.equal(educationForMarker("LDL-CHOLESTEROL (calc)")?.id,"lipids");
  assert.equal(educationForMarker("Testosterone, total, MS")?.id,"testosterone");
  assert.equal(educationForMarker("BUN/Creatinine ratio"),undefined);
  assert.equal(educationForMarker("Free T4"),undefined);
  assert.equal(educationForMarker("ApoB")?.use,"link-only");
});
test("only verified original measurements enter education coverage",()=>{
  const c=fixture();
  c.documents.push({...structuredClone(c.documents[0]),id:"order",kind:"requisition"});
  c.documents.push({...structuredClone(c.documents[0]),id:"interpretation",kind:"practitioner-report"});
  c.documents.push({...structuredClone(c.documents[0]),id:"unverified",verifiedAt:undefined});
  assert.equal(labEvidenceForCase(c).rows.length,2);
});
test("summary preserves source facts, unknown flags and references without importing private context",()=>{
  const summary=prepareReferenceLabSection(fixture());
  assert.match(summary,/ApoB: 96 mg\/dL; source reference: <90; source flag: high; \[D1, page 2\]/);
  assert.match(summary,/1 entry has no confirmed laboratory flag/);
  assert.match(summary,/https:\/\/medlineplus.gov\/lab-tests\/blood-glucose-test\//);
  assert.match(summary,/External reading link only/);
  assert.match(summary,/TCM formulation is pending/);
  assert.ok(!summary.includes("PRIVATE NOTE"));
});
test("incomplete verification and unresolved critical follow-up block preparation",()=>{
  const c=fixture();c.documents[0].verifiedAt=undefined;
  assert.throws(()=>prepareReferenceLabSection(c),/Verify/);
  c.documents[0].verifiedAt="2026-01-01";c.documents[0].extraction!.results[0].flag="critical";
  assert.throws(()=>prepareReferenceLabSection(c),/critical/);
});
test("unknown markers remain explicit and excessive source content is never silently truncated",()=>{
  const c=fixture();c.documents[0].extraction!.results[0].name="Unmapped fictional test";
  assert.deepEqual(labEvidenceForCase(c).unmatched,["Unmapped fictional test"]);
  assert.match(prepareReferenceLabSection(c),/No explanation was guessed/);
  c.documents[0].extraction!.results=Array.from({length:100},(_,i)=>({...c.documents[0].extraction!.results[1],name:`Fictional flag ${i}`}));
  assert.throws(()=>prepareReferenceLabSection(c),/no text was truncated/);
});
