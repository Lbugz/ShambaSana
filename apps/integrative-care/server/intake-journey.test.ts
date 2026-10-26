import test from "node:test";
import assert from "node:assert/strict";
import { blankIntake, intakeErrors, intakeSchema } from "../shared/care";
import { intakeAnswer, intakeSections, intakeStepErrors } from "../shared/intake-journey";

test("step checks reject missing answers without requiring future steps",()=>{
  const i={...blankIntake,name:"Example",age:"32",concern:"Example concern"};
  assert.deepEqual(intakeStepErrors(i,0),[]);
  assert.ok(intakeStepErrors({...i,age:"17"},0).length);
  assert.ok(intakeStepErrors({...i,name:"   "},0).length);
  assert.ok(intakeStepErrors(i,1).length);
  assert.ok(intakeStepErrors(i,2).length);
  assert.deepEqual(intakeStepErrors(i,3),[]);
  assert.equal(i.medications,"");
});
test("explicit none and zero remain valid answers; optional observations stay optional",()=>{
  const i={...blankIntake,name:"Example",age:"32",concern:"Example",history:"none",medications:"none",allergies:"none",pregnancy:"not-applicable" as const,pain:"0",energy:"10",sleep:"0",stress:"0"};
  for(let s=0;s<5;s++)assert.deepEqual(intakeStepErrors(i,s),[]);
  assert.deepEqual(intakeErrors(intakeSchema.parse(i)),[]);
  assert.ok(intakeStepErrors({...i,stress:"11"},2).length);
  assert.equal(intakeAnswer(i,"pain"),"0");
  assert.equal(intakeAnswer(i,"pregnancy"),"Not applicable");
});
test("review preserves measurement units and includes every answer field",()=>{
  const i={...blankIntake,weight:"150",weightUnit:"lb" as const,height:"68",heightUnit:"in" as const};
  assert.equal(intakeAnswer(i,"weight"),"150 lb");
  assert.equal(intakeAnswer(i,"height"),"68 in");
  const shown=new Set<string>(intakeSections.flatMap(s=>[...s.keys]));
  for(const key of Object.keys(blankIntake))if(!["schemaVersion","weightUnit","heightUnit"].includes(key))assert.ok(shown.has(key),key);
});
