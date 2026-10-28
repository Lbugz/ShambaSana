import { test } from "node:test";
import assert from "node:assert/strict";
import { clientJourney, uploadIssue, uploadMime } from "../shared/client-journey";
import { blankIntake, type CareCase } from "../shared/care";

function fixture():CareCase {
  return {id:"fictional",revision:0,customerId:"fictional",customerName:"Example",customerEmail:"client@example.invalid",createdAt:"2026-01-01",updatedAt:"2026-01-01",consent:{version:"pilot-v1",acceptedAt:"2026-01-01"},payment:{status:"unpaid-pilot",amount:0,currency:"usd"},intake:{...blankIntake,name:"Example",age:"40",concern:"Fictional concern",history:"None",medications:"None",allergies:"None",pregnancy:"not-applicable",pain:"0",energy:"5",sleep:"5",stress:"5"},documents:[],practitionerNotes:"",followupRequest:"",reports:[],events:[]};
}
test("enrollment and refunds take precedence over review and released records",()=>{
  const c=fixture();c.payment.status="pending";c.reports=[{} as any];
  assert.equal(clientJourney(c).stage,"enrollment");assert.equal(clientJourney(c).enrolled,false);
  c.payment.status="refunded";assert.equal(clientJourney(c).stage,"paused");
});
test("saved intake and supporting documents never imply submitted or verified results",()=>{
  const c=fixture();assert.equal(clientJourney(c).stage,"intake");
  c.intakeSubmittedAt="2026-01-01";assert.equal(clientJourney(c).stage,"documents");
  c.documents=[{id:"order",name:"Order",mime:"text/plain",size:10,purpose:"lab",kind:"requisition",uploadedAt:"2026-01-01"}];
  assert.equal(clientJourney(c).labsDone,false);
  c.documents.push({...c.documents[0],id:"original",kind:"laboratory-results",verifiedAt:"2026-01-01"});
  assert.equal(clientJourney(c).labsDone,false,"A verification timestamp without original facts is insufficient");
});
test("client redaction of drafts does not prevent an accurate reviewing status",()=>{
  const c=fixture();c.intakeSubmittedAt="2026-01-01";
  c.documents=[{id:"original",name:"Results",mime:"text/plain",size:10,purpose:"lab",kind:"laboratory-results",uploadedAt:"2026-01-01",verifiedAt:"2026-01-01",extraction:{patientName:"Example",laboratory:"Fictional",collectionDate:"2026-01-01",uncertainty:"",results:[{name:"Glucose",value:"88",unit:"mg/dL",referenceRange:"70–99",sourcePage:"1",flag:"normal"}]}}];
  assert.equal(clientJourney(c).stage,"review");assert.equal(clientJourney(c).labsDone,true);
  c.documents.push({...c.documents[0],id:"unclassified",kind:undefined});assert.equal(clientJourney(c).labsDone,false);
});
test("a client reply remains awaiting practitioner review; only an approved report is ready",()=>{
  const c=fixture();c.followupRequest="Clarify history";
  assert.equal(clientJourney(c).title,"More information needed");
  c.followupResponse={request:c.followupRequest,message:"Example reply",sentAt:"2026-01-01"};
  assert.equal(clientJourney(c).stage,"followup");assert.match(clientJourney(c).title,/awaiting review/);
  c.followupRequest="";c.reports=[{} as any];assert.equal(clientJourney(c).stage,"released");
});
test("upload preflight rejects empty, mismatched, oversized and unsupported files",()=>{
  assert.match(uploadIssue({name:"results.pdf",size:0,type:"application/pdf"}),/empty/);
  assert.match(uploadIssue({name:"results.pdf",size:5*1024*1024+1,type:"application/pdf"}),/5 MB/);
  assert.match(uploadIssue({name:"results.csv",size:512*1024+1,type:"text/csv"}),/512 KB/);
  assert.match(uploadIssue({name:"results.pdf",size:10,type:"text/plain"}),/does not match/);
  assert.match(uploadIssue({name:"results.exe",size:10,type:""}),/supported/);
  assert.match(uploadIssue({name:"results.pdf",size:10,type:"application/pdf"},"tongue"),/JPG/);
  assert.equal(uploadIssue({name:"results.pdf",size:5*1024*1024,type:"application/pdf"}),"");
  assert.equal(uploadIssue({name:"results.pdf",size:10,type:""}),"");
  assert.equal(uploadMime({name:"results.pdf",type:""}),"application/pdf");
  assert.equal(uploadMime({name:"results.csv",type:"application/vnd.ms-excel"}),"text/csv");
  assert.equal(uploadIssue({name:"results.csv",size:512*1024,type:"application/vnd.ms-excel"}),"");
});
