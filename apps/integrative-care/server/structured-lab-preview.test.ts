import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import express from "express";
import { fictionalLabFixture, tcmPendingText, validatePreviewDraft } from "../shared/structured-lab-preview";
import { fictionalEvidence, generateFictionalLabPreview } from "./structured-lab-preview";
import { registerRoutes } from "./routes";
import { FileStore } from "./care-store";

function example(){return {title:"Fictional panel review",summary:"A fictional review with source facts retained.",takeaways:["Review the supplied lipid flags."],findings:fictionalLabFixture.observations.map(row=>({observationId:row.id,meaning:"General explanation for clinician review.",context:"Only the supplied fictional history is available.",followUp:"Discuss at practitioner review.",relatedObservationIds:[],uncertainties:["No verified earlier collection."],clinicianQuestions:["What additional context is needed?"],evidenceIds:[]})),patterns:[{title:"Fictional lipid review",observationIds:["apob","ldl","hdl","tg"],reasoning:"Review the supplied lipid flags together.",limits:"No diagnosis or risk score is established.",clinicianQuestions:["Is more history needed?"],evidenceIds:["lipids"]}],actions:[{title:"Review the fictional lipid context",rationale:"The source flags need practitioner review.",observationIds:["apob"],owner:"practitioner" as const,category:"review" as const,timing:"To be agreed with the practitioner"}],missingInformation:["No earlier collection"],safetyReview:"Unapproved example for practitioner review."};}

test("structured preview rejects missing or duplicate measurements and unapproved references",()=>{
  assert.doesNotThrow(()=>validatePreviewDraft(example(),["lipids"]));
  const missing=example();missing.findings.pop();assert.throws(()=>validatePreviewDraft(missing,["lipids"]),/exactly once/);
  const duplicate=example();duplicate.findings[1].observationId="apob";assert.throws(()=>validatePreviewDraft(duplicate,["lipids"]),/exactly once/);
  const invented=example();invented.findings[0].relatedObservationIds=["invented"] as never;assert.throws(()=>validatePreviewDraft(invented,["lipids"]),/unknown observation/);
  const source=example();source.patterns[0].evidenceIds=["invented-study"];assert.throws(()=>validatePreviewDraft(source,["lipids"]),/unapproved education/);
  assert.throws(()=>validatePreviewDraft({...example(),tcm:"invented pattern"},["lipids"]));
});

test("fictional generation, privacy, staff access and request limits",async()=>{
  const env={...process.env},originalFetch=globalThis.fetch;
  const dir=await mkdtemp(path.join(tmpdir(),"shamba-fictional-ai-"));
  const store=new FileStore(path.join(dir,"fixture.json"));
  process.env.NODE_ENV="test";process.env.PRACTITIONER_EMAIL="fictional-staff@example.invalid";
  const password=randomBytes(24).toString("hex");process.env.PRACTITIONER_PASSWORD=password;
  process.env.LAB_REPORT_PREVIEW_ENABLED="true";delete process.env.OPENAI_API_KEY;delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;delete process.env.OPENAI_BASE_URL;delete process.env.OPENAI_MODEL;
  const app=express();app.use(express.json());const server=createServer(app);
  await registerRoutes(server,app,store);await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
  const origin=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
  let calls=0;
  async function request(suffix:string,method="GET",body?:unknown,cookie=""){
    const response=await originalFetch(origin+suffix,{method,headers:{Origin:origin,"Content-Type":"application/json",Cookie:cookie},body:body===undefined?undefined:JSON.stringify(body)});
    return {response,data:await response.json()};
  }
  try{
    const url="/api/admin/lab-report-preview",input={fixtureId:fictionalLabFixture.id,confirm:true};
    assert.equal((await request(url,"POST",input)).response.status,401);
    const login=await request("/api/auth/login","POST",{email:process.env.PRACTITIONER_EMAIL,password});
    const staff=login.response.headers.get("set-cookie")!.split(";")[0];
    const registered=await request("/api/auth/register","POST",{name:"Fictional client",email:"fictional-client@example.invalid",password});
    const customer=registered.response.headers.get("set-cookie")!.split(";")[0];
    assert.equal((await request(url,"POST",input,customer)).response.status,403);
    assert.equal((await request(url,"POST",{...input,patientFile:"not permitted"},staff)).response.status,400);
    assert.equal((await request(url,"POST",input,staff)).response.status,503);
    process.env.LAB_REPORT_PREVIEW_ENABLED="false";assert.equal((await request(url,"POST",input,staff)).response.status,403);process.env.LAB_REPORT_PREVIEW_ENABLED="true";
    process.env.OPENAI_API_KEY="synthetic-test-value-not-a-real-key";
    globalThis.fetch=async(input,init)=>{
      assert.equal(String(input),"https://api.openai.com/v1/responses");calls++;
      const body=JSON.parse(String(init?.body));assert.equal(body.store,false);assert.equal(body.text.format.name,"structured_lab_preview_v1");assert.equal(body.text.format.strict,true);
      const payload=JSON.parse(body.input[0].content[0].text);assert.deepEqual(payload.fixture,fictionalLabFixture);
      assert.equal(payload.fixture.fictional,true);assert.equal(payload.fixture.observations.length,10);
      assert.deepEqual(payload.educationSources,fictionalEvidence());assert.match(body.instructions,/Do not generate a TCM diagnosis/);
      return new Response(JSON.stringify({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify(example())}]}]}),{status:200});
    };
    const generated=await request(url,"POST",input,staff);assert.equal(generated.response.status,200);
    assert.deepEqual(generated.data.fixture,fictionalLabFixture);assert.equal(generated.data.reviewStatus,"unapproved-ai-draft");assert.equal(generated.data.tcm.text,tcmPendingText);
    assert.equal((await store.list("case")).length,0);assert.equal((await store.list("purchase")).length,0);
    const cached=await request(url+"/result","GET",undefined,staff);assert.equal(cached.response.status,200);assert.deepEqual(cached.data,generated.data);assert.equal(calls,1,"Reading the cached result must not call AI again");
    assert.equal((await request(url+"/result","GET",undefined,customer)).response.status,403);
    await request(url,"POST",input,staff);await request(url,"POST",input,staff);assert.equal((await request(url,"POST",input,staff)).response.status,429);assert.equal(calls,3);
    globalThis.fetch=async()=>new Response(JSON.stringify({status:"incomplete"}),{status:200});await assert.rejects(()=>generateFictionalLabPreview(),/did not finish/);
    globalThis.fetch=async()=>new Response(JSON.stringify({status:"completed",output:[{content:[{type:"output_text",text:"{bad-json"}]}]}),{status:200});await assert.rejects(()=>generateFictionalLabPreview(),/did not pass validation/);
  }finally{globalThis.fetch=originalFetch;for(const key of Object.keys(process.env))if(!(key in env))delete process.env[key];Object.assign(process.env,env);await new Promise<void>(resolve=>server.close(()=>resolve()));await store.close();await rm(dir,{recursive:true,force:true});}
});
