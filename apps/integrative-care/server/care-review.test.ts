import test from "node:test";
import assert from "node:assert/strict";
import { blankIntake, type CareCase, type Document } from "../shared/care";
import { reviewBlockers, verificationProblems } from "../shared/care-review";
const at="2026-04-20T10:00:00Z";
const document:Document={id:"lab",name:"Synthetic result",mime:"text/plain",size:0,purpose:"lab",kind:"laboratory-results",uploadedAt:at,verifiedAt:at,verifiedBy:"test",extraction:{patientName:"Example client",collectionDate:"2026-04-13",laboratory:"Synthetic laboratory",uncertainty:"",results:[{name:"Example marker",value:"42",unit:"units",referenceRange:"Source interval",flag:"normal",sourcePage:"1"}]}};
const readyCase:CareCase={id:"example",revision:0,customerId:"synthetic",customerName:"Example client",customerEmail:"example@example.invalid",createdAt:at,updatedAt:at,consent:{version:"pilot-v1",acceptedAt:at},payment:{status:"unpaid-pilot",amount:0,currency:"usd"},intake:{...blankIntake,name:"Example client",age:"44",concern:"Synthetic case",history:"None in fixture",medications:"None in fixture",allergies:"None in fixture",pregnancy:"not-applicable",pain:"0",energy:"5",sleep:"5",stress:"5"},intakeSubmittedAt:at,documents:[document],practitionerNotes:"",followupRequest:"",reports:[],events:[]};
test("a verified laboratory source and completed intake enable review",()=>assert.deepEqual(reviewBlockers(readyCase),[]));
test("orders and practitioner interpretations are supporting records, not extra lab requirements",()=>{
  assert.deepEqual(reviewBlockers({...readyCase,documents:[document,{...document,id:"order",kind:"requisition",verifiedAt:undefined,extraction:undefined},{...document,id:"interpretation",kind:"practitioner-report",verifiedAt:undefined,extraction:undefined}]}),[]);
  assert.ok(reviewBlockers({...readyCase,documents:[{...document,kind:"requisition"}]}).length);
});
test("unclassified legacy sources and missing source metadata fail closed",()=>{
  assert.ok(reviewBlockers({...readyCase,documents:[{...document,kind:undefined}]}).length);
  assert.ok(verificationProblems({...document,extraction:{...document.extraction!,collectionDate:""}}).length);
  assert.ok(verificationProblems({...document,extraction:{...document.extraction!,results:[{...document.extraction!.results[0],sourcePage:""}]}}).length);
});
test("critical flags need a practitioner action before drafting",()=>{
  const critical={...document,extraction:{...document.extraction!,results:[{...document.extraction!.results[0],flag:"critical" as const}]}};
  assert.ok(reviewBlockers({...readyCase,documents:[critical]}).some(r=>r.includes("critical")));
  assert.deepEqual(reviewBlockers({...readyCase,documents:[{...critical,criticalReview:{reviewedAt:at,reviewedBy:"test",action:"Synthetic follow-up recorded"}}]}),[]);
});
test("missing intake, enrollment and outstanding questions block review",()=>{
  assert.ok(reviewBlockers({...readyCase,intakeSubmittedAt:undefined}).length);
  assert.ok(reviewBlockers({...readyCase,payment:{...readyCase.payment,status:"pending"}}).length);
  assert.ok(reviewBlockers({...readyCase,followupRequest:"Clarify history"}).length);
});
