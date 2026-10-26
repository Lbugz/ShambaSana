/** Local-only connected rehearsal. Never imported by the deployed server. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import express from "express";
import { registerRoutes } from "../server/routes";
import { FileStore } from "../server/care-store";
import { blankIntake, type CareCase, type Extraction, type Report } from "../shared/care";

if (process.env.NODE_ENV === "production") throw new Error("The fictional rehearsal cannot run in production.");
process.env.NODE_ENV="test";
process.env.PILOT_MODE="true";
process.env.BILLING_ENABLED="false";
process.env.INSTITUTE_AUTOMATION_MODE="sandbox";
process.env.INSTITUTE_LIVE_ONBOARDING_ENABLED="false";
process.env.INSTITUTE_LIVE_PAYMENTS_ENABLED="false";
for(const key of Object.keys(process.env))if(/OPENAI|STRIPE|GOOGLE|DATABASE_URL|SMTP/.test(key))delete process.env[key];
const password=randomBytes(32).toString("hex");
process.env.PRACTITIONER_EMAIL="fictional-practitioner@example.invalid";
process.env.PRACTITIONER_PASSWORD=password;
process.env.PRACTITIONER_NAME="Fictional reviewer — rehearsal only";
const port=4180;
const origin=`http://127.0.0.1:${port}`;
process.env.APP_BASE_URL=origin;
const directory=path.resolve(".data",`connected-rehearsal-${Date.now()}`);
await mkdir(directory,{recursive:true});
const filename=path.join(directory,"fictional-care.json");
const store=new FileStore(filename);
const app=express();
const server=createServer(app);
app.use(express.json({limit:"8mb"}));
let clientCookie="", practitionerCookie="", caseId="";
const originalFetch=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
  const url=typeof input==="string" || input instanceof URL ? String(input) : input.url;
  if(new URL(url).origin!==origin)throw new Error("External requests are disabled in the connected rehearsal.");
  return originalFetch(input,init);
};
// Only this standalone loopback fixture server can issue these synthetic sessions.
app.get("/rehearsal/:role",(req,res)=>{
  const cookie=req.params.role==="client"?clientCookie:req.params.role==="practitioner"?practitionerCookie:"";
  if(!cookie || !caseId)return res.status(404).send("Rehearsal role unavailable.");
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Set-Cookie",`${cookie}; HttpOnly; SameSite=Strict; Path=/`);
  res.redirect(req.params.role==="client"?"/#/dashboard":"/#/admin/dashboard");
});
app.get("/rehearsal",(_req,res)=>{
  res.setHeader("Cache-Control","no-store");
  res.type("html").send(`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connected fictional Care rehearsal</title><body style="font-family:system-ui;max-width:720px;margin:50px auto;padding:24px;background:#f6f2e9;color:#124330"><h1>One fictional case. Two real workspaces.</h1><p>This local rehearsal uses the actual Care API, persistent local storage and signed-in client/practitioner screens. All identity, intake, lab values and report content are invented.</p><p>No payment, email, external AI or production database is used. The approval is a test fixture, not a clinical assessment.</p><p><a href="/rehearsal/client">Open client workspace</a></p><p><a href="/rehearsal/practitioner">Open practitioner workspace</a></p><p>Switching roles replaces the session for this local browser host. Reload the workspace after switching.</p></body></html>`);
});
await registerRoutes(server,app,store);
const dist=path.resolve("dist/public");
app.use(express.static(dist));
app.get("*",(_req,res)=>res.sendFile(path.join(dist,"index.html")));
await new Promise<void>(resolve=>server.listen(port,"127.0.0.1",resolve));
const checkpoints:string[]=[];
async function request(url:string,method="GET",body?:unknown,cookie=clientCookie,status=200){
  const response=await fetch(origin+url,{method,headers:{Origin:origin,"Content-Type":"application/json",...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();
  assert.equal(response.status,status,`${method} ${url}`);
  return {data,response};
}
let c:CareCase;
async function change(suffix:string,body:object,method="POST",cookie=clientCookie){
  c=(await request(`/api/cases/${caseId}${suffix}`,method,{revision:c.revision,...body},cookie,suffix==="/documents"?201:200)).data;
}
try {
  const registered=await request("/api/auth/register","POST",{name:"Fictional Connected Client",email:"fictional-client@example.invalid",password},"",201);
  clientCookie=registered.response.headers.get("set-cookie")!.split(";")[0];
  practitionerCookie=(await request("/api/auth/login","POST",{email:process.env.PRACTITIONER_EMAIL,password},"")).response.headers.get("set-cookie")!.split(";")[0];
  const other=(await request("/api/auth/register","POST",{name:"Other fictional client",email:"other-fictional@example.invalid",password},"",201)).response.headers.get("set-cookie")!.split(";")[0];
  c=(await request("/api/cases","POST",{consent:true,pilot:true},clientCookie,201)).data;
  caseId=c.id;
  assert.equal(c.payment.status,"unpaid-pilot");
  await request(`/api/cases/${caseId}`,"GET",undefined,other,404);
  checkpoints.push("Signed-in identities, case ownership and unpaid enrollment");
  const intake={...blankIntake,name:"Fictional Connected Client",age:"44",gender:"Man",concern:"Fictional workflow demonstration",goals:"Review one connected case",history:"None in this fictional example",medications:"None in this fictional example",allergies:"None in this fictional example",pregnancy:"not-applicable" as const,pain:"0",energy:"6",sleep:"6",stress:"4",weight:"150",weightUnit:"lb" as const};
  await change("/intake",{intake,submit:false},"PUT");
  assert.deepEqual((await new FileStore(filename).get<CareCase>("case",caseId))?.intake,intake);
  assert.ok(!c.intakeSubmittedAt);
  await change("/intake",{intake,submit:true},"PUT");
  assert.ok(c.intakeSubmittedAt);
  checkpoints.push("Intake draft saved, reloaded from storage and submitted with units intact");
  const sources=[
    {name:"fictional-order.txt",kind:"requisition",text:"FICTIONAL ORDER ONLY. Requested: Apolipoprotein B and glucose. No measurements."},
    {name:"fictional-original-results.txt",kind:"laboratory-results",text:"FICTIONAL LAB RESULTS. Fictional Connected Client. Fictional laboratory. Collection 2026-04-13. Page 1. Apolipoprotein B 96 mg/dL; laboratory range 0–90; flag high. Glucose 88 mg/dL; laboratory range 70–99; flag normal. Invented values, not medical advice."},
    {name:"fictional-prior-interpretation.txt",kind:"practitioner-report",text:"FICTIONAL PRIOR INTERPRETATION. Context only; no new laboratory collection."},
  ];
  for(const source of sources){
    await change("/documents",{name:source.name,mime:"text/plain",purpose:"lab",data:Buffer.from(source.text).toString("base64")});
    const d=c.documents.find(d=>d.name===source.name)!;
    await change(`/documents/${d.id}/kind`,{kind:source.kind},"PUT",practitionerCookie);
  }
  const results=c.documents.find(d=>d.kind==="laboratory-results")!;
  const extraction:Extraction={patientName:intake.name,collectionDate:"2026-04-13",laboratory:"Fictional laboratory",uncertainty:"All source values are invented for this connected test.",results:[{name:"Apolipoprotein B",value:"96",unit:"mg/dL",referenceRange:"0–90",flag:"high",sourcePage:"1"},{name:"Glucose",value:"88",unit:"mg/dL",referenceRange:"70–99",flag:"normal",sourcePage:"1"}]};
  const privateReport:Report={overview:"FICTIONAL CONNECTED TEST. This report demonstrates the release process, not clinical care.",labs:"Fictional source: Apolipoprotein B 96 mg/dL (range 0–90; high), glucose 88 mg/dL (range 70–99; normal). Values match the invented source report.",tcm:"No TCM diagnosis is generated. A real assessment requires practitioner review of the intake and appropriate observations, separate from lab evidence.",priorities:"Example: discuss reviewed findings and outstanding questions with the responsible practitioner.",nutrition:"No personalized nutrition, supplement or dosing advice is provided by this rehearsal.",lifestyle:"No personalized lifestyle prescription is provided by this rehearsal.",recommendations:"This is a manually written fictional report. No external AI or treatment recommendation was used.",safety:"For workflow testing only. Real follow-up and safety advice must be written and approved by the responsible practitioner."};
  await request(`/api/cases/${caseId}/draft`,"POST",{revision:c.revision,content:privateReport},practitionerCookie,409);
  assert.ok(!(await request(`/api/cases/${caseId}`)).data.documents.find((d:any)=>d.id===results.id).extraction);
  await change(`/labs/${results.id}/verify`,{extraction,identityConfirmed:true,verificationNote:"Checked the fictional identity, date, laboratory, units, ranges and both values against the invented source."},"PUT",practitionerCookie);
  assert.equal((await request(`/api/cases/${caseId}`)).data.documents.filter((d:any)=>d.extraction).length,1);
  checkpoints.push("Three document roles preserved; only verified original results become client-visible measurements");
  const original=await fetch(`${origin}/api/cases/${caseId}/documents/${results.id}`,{headers:{Cookie:clientCookie}});
  assert.match(await original.text(),/Apolipoprotein B 96/);
  await change("/review",{practitionerNotes:"Private fictional review note",followupRequest:""},"PUT",practitionerCookie);
  await change("/draft",{content:privateReport,ai:false},"POST",practitionerCookie);
  const before=(await request(`/api/cases/${caseId}`)).data;
  assert.ok(!("draft" in before) && !("practitionerNotes" in before) && before.reports.length===0);
  await request(`/api/cases/${caseId}/approve`,"POST",{revision:c.revision,confirmation:true},clientCookie,403);
  await request(`/api/cases/${caseId}/approve`,"POST",{revision:c.revision,confirmation:false},practitionerCookie,400);
  checkpoints.push("Client cannot see drafts/private notes or approve; explicit practitioner confirmation is required");
  await change("/approve",{confirmation:true},"POST",practitionerCookie);
  const released=(await request(`/api/cases/${caseId}`)).data;
  assert.equal(released.reports.length,1);
  assert.deepEqual(released.reports[0].content,privateReport);
  assert.equal(released.reports[0].author,process.env.PRACTITIONER_NAME);
  assert.deepEqual((await new FileStore(filename).get<CareCase>("case",caseId))?.reports,released.reports);
  checkpoints.push("Approved report version persists and appears in the same client's case");
  const config=(await request("/api/config")).data;
  assert.equal(config.checkout,false);assert.equal(config.ai,false);assert.equal(config.billingMode,"sandbox");
  const evidence={status:"passed",fictional:true,storage:"isolated local FileStore; not Railway PostgreSQL",caseId,checkpoints,externalRequests:"blocked",payments:"disabled",ai:"disabled",emails:"not sent",portal:`${origin}/rehearsal`};
  await writeFile(path.join(directory,"checks.json"),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence,null,2));
  console.log("Local rehearsal remains open. Press Ctrl+C to stop.");
} catch(e){server.close();await store.close();throw e;}
process.once("SIGINT",()=>{server.close(()=>{void store.close().then(()=>process.exit(0));});});
