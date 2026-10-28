import { z } from "zod";

export const previewVersion="structured-lab-preview-v1";
export const tcmPendingText="Pending Dumisani’s diagnostic references, criteria and responsible practitioner assessment. No TCM diagnosis or treatment is generated.";
export const fictionalLabFixture={
  id:"fictional-panel-2026-04-v1",
  fictional:true as const,
  source:{id:"D1",name:"Fictional laboratory panel",laboratory:"Fictional Laboratory",collectionDate:"2026-04-13",sourcePage:"1"},
  intake:{age:"44",goals:"Understand the example lipid and glucose findings and prepare a practical review plan.",concern:"Fictional report review; occasional low energy is self-reported, with no established cause.",history:"No known conditions reported in this fictional intake; family history not recorded.",medications:"None reported in the fictional intake; clinician reconciliation still required.",allergies:"None reported in the fictional intake.",pregnancy:"Not applicable in the fictional intake.",routines:"Fictional client reports desk-based work, two short walks per week, five to six hours of sleep and frequent takeaway meals.",collectionConditions:"Fasting status not documented; recent illness and exercise timing not recorded.",historyLimits:"One collection only. No verified earlier results, blood pressure or cardiovascular risk assessment."},
  observations:[
    {id:"apob",name:"Apolipoprotein B",value:"96",unit:"mg/dL",referenceRange:"0–90",flag:"high"},
    {id:"ldl",name:"LDL cholesterol",value:"138",unit:"mg/dL",referenceRange:"<100",flag:"high"},
    {id:"hdl",name:"HDL cholesterol",value:"39",unit:"mg/dL",referenceRange:">40",flag:"low"},
    {id:"tg",name:"Triglycerides",value:"170",unit:"mg/dL",referenceRange:"<150",flag:"high"},
    {id:"glucose",name:"Blood glucose",value:"88",unit:"mg/dL",referenceRange:"70–99",flag:"normal"},
    {id:"a1c",name:"Hemoglobin A1c",value:"5.4",unit:"%",referenceRange:"<5.7",flag:"normal"},
    {id:"tsh",name:"TSH",value:"2.1",unit:"mIU/L",referenceRange:"0.4–4.5",flag:"normal"},
    {id:"creatinine",name:"Creatinine",value:"1.0",unit:"mg/dL",referenceRange:"0.6–1.3",flag:"normal"},
    {id:"alt",name:"ALT",value:"48",unit:"U/L",referenceRange:"9–46",flag:"high"},
    {id:"ast",name:"AST",value:"30",unit:"U/L",referenceRange:"10–40",flag:"normal"},
  ].map(row=>({...row,sourceId:"D1",sourcePage:"1"})),
};
const paragraph=z.string().trim().min(1).max(1800);
const ids=z.array(z.string().min(1).max(60)).max(15);
export const structuredLabDraftSchema=z.object({
  title:paragraph,
  summary:paragraph,
  takeaways:z.array(paragraph).min(1).max(4),
  findings:z.array(z.object({observationId:z.string(),meaning:paragraph,context:paragraph,followUp:paragraph,relatedObservationIds:ids,uncertainties:z.array(paragraph).max(5),clinicianQuestions:z.array(paragraph).min(1).max(4),evidenceIds:ids}).strict()).min(1).max(20),
  patterns:z.array(z.object({title:paragraph,observationIds:ids,reasoning:paragraph,limits:paragraph,clinicianQuestions:z.array(paragraph).min(1).max(4),evidenceIds:ids}).strict()).max(4),
  actions:z.array(z.object({title:paragraph,rationale:paragraph,observationIds:ids,owner:z.enum(["client","practitioner","shared"]),category:z.enum(["review","lifestyle-topic","follow-up"]),timing:paragraph}).strict()).min(1).max(6),
  missingInformation:z.array(paragraph).min(1).max(10),
  safetyReview:paragraph,
}).strict();
export type StructuredLabDraft=z.infer<typeof structuredLabDraftSchema>;
export type FictionalPreviewEnvelope={version:typeof previewVersion;fixture:typeof fictionalLabFixture;draft:StructuredLabDraft;evidence:{id:string;title:string;url:string;explanation:string;use:"education"|"link-only"}[];generatedAt:string;model:string;evidenceVersion:string;reviewStatus:"unapproved-ai-draft";tcm:{status:"pending-practitioner-criteria";text:string}};

// Format is constrained; factual/clinical correctness still needs a practitioner.
const str={type:"string",minLength:1,maxLength:1800};
const id={type:"string",minLength:1,maxLength:60};
const list=(items:object,minItems:number,maxItems:number)=>({type:"array",items,minItems,maxItems});
const references=list(id,0,15);
const object=(properties:Record<string,unknown>)=>({type:"object",properties,required:Object.keys(properties),additionalProperties:false});
export const structuredLabDraftFormat=object({
  title:str,summary:str,takeaways:list(str,1,4),
  findings:list(object({observationId:id,meaning:str,context:str,followUp:str,relatedObservationIds:references,uncertainties:list(str,0,5),clinicianQuestions:list(str,1,4),evidenceIds:references}),fictionalLabFixture.observations.length,fictionalLabFixture.observations.length),
  patterns:list(object({title:str,observationIds:references,reasoning:str,limits:str,clinicianQuestions:list(str,1,4),evidenceIds:references}),0,4),
  actions:list(object({title:str,rationale:str,observationIds:references,owner:{type:"string",enum:["client","practitioner","shared"]},category:{type:"string",enum:["review","lifestyle-topic","follow-up"]},timing:str}),1,6),
  missingInformation:list(str,1,10),safetyReview:str,
});
export function validatePreviewDraft(value:unknown,evidenceIds:string[]) {
  const draft=structuredLabDraftSchema.parse(value);
  const known=new Set(fictionalLabFixture.observations.map(row=>row.id));
  const returned=draft.findings.map(row=>row.observationId);
  if(new Set(returned).size!==known.size || returned.length!==known.size || returned.some(id=>!known.has(id)))throw new Error("The AI draft did not cover each original observation exactly once.");
  const sourceIds=new Set(evidenceIds);
  for(const item of [...draft.findings,...draft.patterns,...draft.actions]){
    const references="relatedObservationIds" in item?item.relatedObservationIds:item.observationIds;
    if(references.some(id=>!known.has(id)))throw new Error("The AI draft referenced an unknown observation.");
    if("evidenceIds" in item && item.evidenceIds.some(id=>!sourceIds.has(id)))throw new Error("The AI draft referenced an unapproved education source.");
  }
  return draft;
}
