import type { CareCase } from "./care";
import { laboratoryDocuments, reviewBlockers, verificationProblems } from "./care-review";

export const labEducationVersion = "medline-education-2026-10-28-v1";
export const tcmReferenceStatus = "pending-practitioner-criteria";
type Education = { id: string; title: string; url: string; explanation: string; aliases: string[]; use: "education" | "link-only" };
const test = (id: string, title: string, slug: string, explanation: string, aliases: string[]): Education => ({id,title,url:`https://medlineplus.gov/lab-tests/${slug}/`,explanation,aliases,use:"education"});

// Independently written educational descriptions, checked against these NLM pages.
// No treatment thresholds, generic optimal ranges or TCM diagnostic mappings.
export const labEducation: Education[] = [
  test("lipids","Cholesterol levels","cholesterol-levels","A lipid panel measures cholesterol and related fats. A clinician considers these results alongside other cardiovascular risk factors.",["Total cholesterol","Cholesterol, total","HDL cholesterol","LDL cholesterol","LDL-C","HDL-C","Non-HDL cholesterol","Cholesterol/HDL ratio","CHOL/HDLC ratio"]),
  test("triglycerides","Triglycerides test","triglycerides-test","This test measures triglycerides, a type of fat carried in the blood.",["Triglycerides","TG"]),
  test("lpa","Lipoprotein(a) blood test","lipoprotein-a-blood-test","This test measures lipoprotein(a), which can contribute information to cardiovascular risk assessment.",["Lipoprotein(a)","Lipoprotein (a)","Lp(a)"]),
  test("a1c","Hemoglobin A1C test","hemoglobin-a1c-hba1c-test","A1C reflects average blood glucose over roughly two to three months.",["Hemoglobin A1c","HbA1c","A1c"]),
  test("glucose","Blood glucose test","blood-glucose-test","This test measures glucose in the blood. Testing conditions and clinical context affect interpretation.",["Glucose","Fasting glucose","Blood glucose"]),
  test("insulin","Insulin in blood test","insulin-in-blood-test","This test measures insulin. It is interpreted with other information and is not usually used by itself to diagnose diabetes.",["Insulin","Fasting insulin"]),
  test("tsh","TSH test","tsh-thyroid-stimulating-hormone-test","TSH is a hormone involved in regulating thyroid activity. A TSH result alone does not identify the cause of a thyroid problem.",["TSH","Thyroid stimulating hormone"]),
  test("testosterone","Testosterone levels test","testosterone-levels-test","These tests measure testosterone in blood. The type of measurement and clinical context matter when reviewing results.",["Total testosterone","Free testosterone","Testosterone total","Testosterone free","Testosterone, total, MS"]),
  test("cbc","Complete blood count","complete-blood-count-cbc","A CBC describes several blood-cell measurements. Individual counts and related results need clinical context.",["White blood cells","White blood cell count","WBC","Red blood cells","Red blood cell count","RBC","Hemoglobin","Hematocrit","MCV","MCH","MCHC","RDW","Platelets","Platelet count","MPV"]),
  test("liver","Liver function tests","liver-function-tests","Liver blood tests measure several substances. The panel alone does not establish a specific liver diagnosis.",["AST","ALT","Alkaline phosphatase","ALP","Total bilirubin","Bilirubin, total","Albumin","Total protein","Protein, total","Globulin"]),
  test("bun","BUN test","bun-blood-urea-nitrogen","BUN measures urea nitrogen, a waste product related to protein breakdown and kidney clearance.",["BUN","Urea nitrogen (BUN)","Blood urea nitrogen"]),
  test("creatinine","Creatinine test","creatinine-test","Creatinine is a waste product filtered by the kidneys. Interpretation can involve other measurements and personal context.",["Creatinine","Serum creatinine"]),
  test("psa","PSA test","prostate-specific-antigen-psa-test","PSA testing can inform prostate screening. A PSA result alone cannot diagnose cancer or identify the cause of a change.",["PSA total","PSA, total","Total PSA","PSA free","PSA, free","PSA percent free","PSA, % free"]),
  test("cmp","Comprehensive metabolic panel","comprehensive-metabolic-panel-cmp","A CMP includes measurements relevant to metabolism, proteins and fluid or electrolyte balance.",["Sodium","Potassium","Chloride","Carbon dioxide","Calcium","Albumin/globulin ratio","Albumin/Globulin ratio"]),
  // The encyclopedia has separate licensing. Offer a direct link, not copied text.
  {id:"apob",title:"Apolipoprotein B",url:"https://medlineplus.gov/ency/article/003502.htm",explanation:"",aliases:["Apolipoprotein B","ApoB","Apo B"],use:"link-only"},
];
const normalized = (s: string) => s.normalize("NFKC").replace(/\((?:calc|calculated)\)/gi,"").toLowerCase().replace(/[^a-z0-9]/g,"");
export const educationForMarker = (marker: string) => labEducation.find(s=>s.aliases.some(a=>normalized(a)===normalized(marker)));

export function labEvidenceForCase(c: CareCase) {
  const documents = laboratoryDocuments(c).filter(d=>d.verifiedAt && !verificationProblems(d).length);
  const rows = documents.flatMap((d,index)=>d.extraction!.results.map(row=>({document:d,sourceId:`D${index+1}`,row,education:educationForMarker(row.name)})));
  const sources = labEducation.filter(s=>rows.some(r=>r.education?.id===s.id));
  const unmatched = [...new Set(rows.filter(r=>!r.education).map(r=>r.row.name))];
  return {documents,rows,sources,unmatched};
}

/** Deterministic, partial report preparation. No external requests or AI provider. */
export function prepareReferenceLabSection(c: CareCase): string {
  const blockers=reviewBlockers(c);
  if(blockers.length) throw new Error(blockers.join(" "));
  const packet=labEvidenceForCase(c);
  const flagged=packet.rows.filter(r=>["high","low","critical"].includes(r.row.flag));
  const unknown=packet.rows.filter(r=>r.row.flag==="unknown").length;
  const sources=packet.sources.map((s,i)=>`[E${i+1}] ${s.title}: ${s.explanation || "External reading link only; no explanation has been imported."}\n${s.url}`);
  const lines=[
    "LAB FACTS AND EDUCATION — PRACTITIONER REVIEW REQUIRED",
    `Prepared from ${packet.documents.length} verified original laboratory report(s), containing ${packet.rows.length} recorded entries. This is a source-linked summary, not a diagnosis or treatment plan.`,
    "Original sources:",
    ...packet.documents.map((d,i)=>`[D${i+1}] ${d.name}; laboratory: ${d.extraction!.laboratory}; collection: ${d.extraction!.collectionDate}.`),
    "Reported flags for review:",
    ...(flagged.length?flagged.map(({row:r,sourceId})=>`- ${r.name}: ${r.value} ${r.unit}; source reference: ${r.referenceRange || "not stated"}; source flag: ${r.flag}; [${sourceId}, page ${r.sourcePage}].`):["No high, low or critical flags are recorded in the verified extraction. This does not establish absence of disease."]),
    ...(unknown?[`${unknown} ${unknown===1?"entry has":"entries have"} no confirmed laboratory flag in the extraction. Do not infer normality from an absent flag.`]:[]),
    "All recorded measurements remain available in the verified results and original source documents. Laboratory references are retained; provider-preferred targets have not been substituted.",
    "General education — MedlinePlus (not individualized advice):",
    ...sources,
    ...(packet.unmatched.length?[`Education mapping still needs review for ${packet.unmatched.length} marker name(s); see source coverage. No explanation was guessed.`]:[]),
    "Clinical significance, follow-up and safety planning require the responsible practitioner's assessment. TCM formulation is pending practitioner criteria and is not generated here.",
    `Reference version: ${labEducationVersion}.`,
  ];
  const summary=lines.join("\n\n");
  if(summary.length>5000)throw new Error("The source-linked summary exceeds the report field limit. Use the source coverage panel and prepare a shorter clinician-written summary; no text was truncated.");
  return summary;
}
