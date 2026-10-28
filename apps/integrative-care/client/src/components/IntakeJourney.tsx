import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IntakeChoices } from "@/components/IntakeChoices";
import { ErrorMessage } from "@/components/CareLayout";
import { intakeErrors, intakeSchema, type Intake, type Document } from "@shared/care";
import { intakeSections, intakeLabels, requiredIntakeKeys, intakeStepErrors, intakeAnswer } from "@shared/intake-journey";
const genderOptions = ["Woman", "Man", "Non-binary", "Prefer not to say"];
const steps = [...intakeSections.map(s=>s.title), "Review and submit"];
const symptoms = [
  "Bloating or abdominal fullness",
  "Constipation",
  "Loose stools",
  "Headaches or muscle tension",
  "Difficulty sleeping",
  "Restlessness or anxiety",
  "Fatigue or energy crashes",
  "Dry skin or throat",
  "Low back discomfort",
  "Frequent urination",
];
const constitution = [
  "Stress often shows up as tension",
  "I feel restless or overstimulated",
  "I worry or overthink frequently",
  "I often feel dry or sensitive",
  "I feel depleted and need recovery",
];

export function IntakeJourney({ initial, documents = [], onSave, onUpload, onExit, documentUrl, preview = false }: {
  initial: Intake; documents?: Document[]; onSave: (intake: Intake, submit: boolean) => Promise<void>;
  onUpload?: (file: File) => Promise<void>; onExit: () => void; documentUrl?: (id: string) => string; preview?: boolean;
}) {
  const [intake,setIntake] = useState<Intake>(()=>structuredClone(initial));
  const [selfDescribeGender,setSelfDescribeGender] = useState(!!initial.gender && !genderOptions.includes(initial.gender));
  const [step,setStep] = useState(()=>{const first=[0,1,2].find(index=>intakeStepErrors(initial,index).length);return first ?? 5;});
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState<unknown>();
  const [notice,setNotice] = useState("");
  const [submitted,setSubmitted] = useState(false);
  const [dirty,setDirty] = useState(false);
  const [confirmed,setConfirmed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(step>0) headingRef.current?.focus();},[step]);
  useEffect(()=>{if(error) messageRef.current?.focus();},[error]);
  useEffect(()=>{
    const warn = (e: BeforeUnloadEvent)=>{if(dirty && !preview){e.preventDefault();e.returnValue="";}};
    window.addEventListener("beforeunload",warn);return ()=>window.removeEventListener("beforeunload",warn);
  },[dirty,preview]);
  const go = (target: number)=>{setError(undefined);setStep(target);window.scrollTo({top:0,behavior:"instant"});};
  const change = (key: keyof Intake,value: unknown)=>{setIntake({...intake,[key]:value});setDirty(true);setConfirmed(false);setNotice("");};
  const next = ()=>{
    const errors=intakeStepErrors(intake,step);
    if(errors.length){setError(new Error(errors.join(" ")));return;}
    go(step+1);
  };
  const save = async(submit=false,exit=false)=>{
    setError(undefined);setNotice("");
    try {
      const normalized=intakeSchema.parse(intake);
      if(submit){const errors=intakeErrors(normalized);if(errors.length)throw new Error(errors.join(" "));if(!confirmed)throw new Error("Review and confirm your answers before submitting.");}
      setBusy(true);await onSave(normalized,submit);setDirty(false);
      setNotice(preview?"Fictional answers kept in memory only. Closing or refreshing resets this preview.":submit?"Your intake was submitted for practitioner review.":"Your progress is saved to your care record.");
      if(submit){setSubmitted(true);window.scrollTo({top:0,behavior:"instant"});}if(exit)onExit();
    }catch(e){setError(e);}finally{setBusy(false);}
  };
  const upload=async(e: React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file||preview||!onUpload)return;
    setBusy(true);setError(undefined);
    try{await onUpload(file);setNotice("Your photo is saved. Save your answers separately before leaving.");}catch(e){setError(e);}finally{setBusy(false);e.target.value="";}
  };
  const field = (
    key: keyof Intake,
    label: string,
    multiline = false,
    hint = "",
  ) => (
    <div key={key}>
      <Label htmlFor={key}>{label}{" "}{requiredIntakeKeys.includes(key) && <span className="ml-1 text-muted-foreground">(required)</span>}</Label>
      {multiline ? (
        <Textarea
          className="mt-2 min-h-28 text-base"
          id={key}
          aria-required={requiredIntakeKeys.includes(key)}
          aria-describedby={hint ? `${key}-hint` : undefined}
          value={String(intake[key])}
          onChange={(e) => change(key, e.target.value)}
          maxLength={5000}
        />
      ) : (
        <Input
          className="mt-2 min-h-12 text-base"
          inputMode={key === "age" || key === "heartRate" ? "numeric" : key === "weight" || key === "height" ? "decimal" : key === "phone" ? "tel" : "text"}
          autoComplete={key === "name" ? "name" : key === "phone" ? "tel" : "off"}
          id={key}
          aria-required={requiredIntakeKeys.includes(key)}
          aria-describedby={hint ? `${key}-hint` : undefined}
          value={String(intake[key])}
          onChange={(e) => change(key, e.target.value)}
          maxLength={key === "age" ? 3 : 200}
        />
      )}{" "}
      {hint && (
        <p id={`${key}-hint`} className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
      )}
    </div>
  );
  const select = (key: keyof Intake, label: string, options: string[]) => (
    <IntakeChoices key={key} name={key} label={label} value={String(intake[key])} options={options} onChange={value=>change(key,value)} required={requiredIntakeKeys.includes(key)} numeric={["pain","energy","sleep","stress"].includes(key)} clearable={!requiredIntakeKeys.includes(key) && !["weightUnit","heightUnit"].includes(key)}/>
  );
  const checks = (key: "symptoms" | "constitution", options: string[]) => (
    <div className="grid gap-3">
      {options.map((o) => (
        <label
          key={o}
          className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm leading-6"
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            checked={intake[key].includes(o)}
            onChange={(e) =>
              change(
                key,
                e.target.checked
                  ? [...intake[key], o]
                  : intake[key].filter((x) => x !== o),
              )
            }
          />
          {o}
        </label>
      ))}
    </div>
  );
  return (
    <div>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
              Your health intake
            </p>
            <h1 className="text-3xl sm:text-4xl">Your story comes first.</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Share what matters to you. Save your progress and return when you are ready. Required sections must be submitted before practitioner review.</p>
          </div>
          <Button
            variant="outline"
            className="min-h-12"
            disabled={busy || submitted}
            onClick={() => save(false, true)}
          >
            Save and exit
          </Button>
        </div>
        {submitted ? (
          <section className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl">{preview ? "Preview complete" : "Your intake is submitted"}</h2>
            <p className="my-5 text-sm leading-7">
              {preview ? "You completed the fictional intake rehearsal. Nothing was saved to a server or sent to a practitioner." : "Your answers are saved for practitioner review. Next, return to your care workspace to add your original laboratory results. Your practitioner may ask follow-up questions before preparing a report."}
            </p>
            <Button onClick={() => onExit()}>
              {preview ? "Return to sample workspace" : "Return to my care"}
            </Button>
          </section>
        ) : (
          <>
            <ol aria-label="Intake steps" className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">{steps.map((title,i)=><li key={title}><button disabled={busy} onClick={()=>go(i)} aria-current={step===i?"step":undefined} className={`min-h-12 w-full rounded-xl p-3 text-left text-xs ${step===i?"bg-primary text-white":"bg-secondary/50 text-primary"}`}>{i+1}. {title}</button></li>)}</ol>
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Intake progress" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step + 1}><div className="h-full bg-primary transition-all" style={{width: `${(step + 1) / 6 * 100}%`}} /></div>
            <div ref={messageRef} tabIndex={-1}><ErrorMessage error={error} /></div>
            {(notice || dirty) && (
              <p role="status" className="my-4 text-sm">
                {dirty ? (preview ? "Preview changes stay in this tab only." : "Unsaved changes. Use Save progress before leaving.") : notice}
              </p>
            )}
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="mb-2 text-xs text-muted-foreground">
                Step {step + 1} of {steps.length}
              </p>
              <h2 ref={headingRef} tabIndex={-1} className="mb-3 text-2xl outline-none">{steps[step]}</h2><p className="mb-7 text-sm leading-7 text-muted-foreground">{intakeSections[step]?.description || "Check your answers, make any changes, then confirm you are ready to share them."} {step < 3 && "Required answers are marked."}</p>
              <fieldset disabled={busy} className="min-w-0 space-y-6">
                {step === 0 && (
                  <>
                    {field("name", "Full name")}
                    {field("age", "Age (18 or older)")}
                    <div><IntakeChoices name="gender-choice" label="Gender (optional)" value={selfDescribeGender ? "Self-describe" : intake.gender} options={[...genderOptions,"Self-describe"]} onChange={value=>{setSelfDescribeGender(value==="Self-describe");change("gender",value==="Self-describe"?"":value);}}/>{selfDescribeGender && <div className="mt-3">{field("gender","How do you describe your gender? (optional)")}</div>}</div>
                    {field("phone", "Phone (optional)")}
                    {field(
                      "concern",
                      "What is your main health concern?",
                      true,
                    )}
                    {field("goals", "What would you like to improve?", true)}
                  </>
                )}
                {step === 1 && (
                  <>
                    {field(
                      "history",
                      "Medical history and current conditions",
                      true,
                      "Write 'none' if you have no relevant history.",
                    )}
                    {field(
                      "medications",
                      "Current medications, vitamins, supplements and herbs",
                      true,
                      "Include names and doses if known. Write 'none' when appropriate.",
                    )}
                    {field(
                      "allergies",
                      "Allergies and reactions",
                      true,
                      "Include medication, food and supplement allergies. Write 'none' if you have none.",
                    )}
                    <IntakeChoices name="pregnancy" label="Are you pregnant, breastfeeding or trying to conceive?" value={intake.pregnancy} options={[{value:"yes",label:"Yes"},{value:"no",label:"No"},{value:"unsure",label:"Unsure"},{value:"not-applicable",label:"Not applicable"}]} onChange={value=>change("pregnancy",value)} required/>

                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Choose each rating yourself. No answer is preselected. All four ratings are required.
                    </p>
                    {select(
                      "pain",
                      "Pain: 0 = none, 10 = worst imaginable",
                      Array.from({ length: 11 }, (_, i) => String(i)),
                    )}
                    {select(
                      "energy",
                      "Energy: 0 = depleted, 10 = very energetic",
                      Array.from({ length: 11 }, (_, i) => String(i)),
                    )}
                    {select(
                      "sleep",
                      "Sleep quality: 0 = very poor, 10 = excellent",
                      Array.from({ length: 11 }, (_, i) => String(i)),
                    )}
                    {select(
                      "stress",
                      "Stress: 0 = none, 10 = very high",
                      Array.from({ length: 11 }, (_, i) => String(i)),
                    )}
                    <h3 className="text-lg">
                      Which symptoms have you noticed?
                    </h3>
                    {checks("symptoms", symptoms)}
                  </>
                )}
                {step === 3 && (
                  <>
                    <p className="text-sm leading-7 text-muted-foreground">
                      These are your observations for practitioner review. You
                      can leave optional observations unanswered if you are
                      unsure. They do not produce an automatic diagnosis.
                    </p>
                    {select(
                      "temperature",
                      "Do you usually feel warm or cold?",
                      [
                        "Often cold",
                        "Often warm",
                        "Alternates between warm and cold",
                        "Comfortable",
                        "Unsure",
                      ],
                    )}
                    {select("thirst", "Thirst", [
                      "Rarely thirsty",
                      "Often thirsty",
                      "Dry mouth",
                      "Comfortable",
                      "Unsure",
                    ])}
                    {field("digestion", "Digestion and bowel habits", true)}
                    <h3 className="text-lg">
                      Patterns you recognize in yourself
                    </h3>
                    {checks("constitution", constitution)}
                    {select("tongueColor", "Tongue color (self-reported)", [
                      "Pale",
                      "Pink",
                      "Red",
                      "Purple",
                      "Unsure",
                    ])}
                    {select("tongueCoating", "Tongue coating (self-reported)", [
                      "Thin white",
                      "Thick white",
                      "Yellow",
                      "Little or no coating",
                      "Unsure",
                    ])}
                    {select("tongueShape", "Tongue shape (self-reported)", [
                      "Swollen",
                      "Teeth marks",
                      "Thin",
                      "Cracked",
                      "Unsure",
                    ])}
                    {select(
                      "tongueMoisture",
                      "Tongue moisture (self-reported)",
                      ["Dry", "Moist", "Very wet", "Unsure"],
                    )}
                    {field(
                      "tongueNotes",
                      "Other tongue observations (optional)",
                      true,
                    )}
                    <div>
                      <Label htmlFor="tongue-upload">
                        Tongue photo (optional)
                      </Label>
                      {preview && <p className="mt-2 text-xs text-muted-foreground">Uploads are disabled in this fictional preview.</p>}
                      <p className="my-2 text-xs text-muted-foreground">
                        Use natural light. JPG, PNG or WebP under 5 MB. Your
                        practitioner can review the original photo; it is not
                        sent to AI for tongue diagnosis.
                      </p>
                      <input
                        id="tongue-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={upload}
                        disabled={busy || preview}
                        className="max-w-full text-sm"
                      />
                      {documents
                        .filter((d) => d.purpose === "tongue")
                        .map((d) => (
                          <p key={d.id} className="mt-3 break-all text-sm">
                            <a
                              className="underline"
                              href={documentUrl?.(d.id)}
                            >
                              {d.name} · saved
                            </a>
                          </p>
                        ))}
                    </div>
                  </>
                )}
                {step === 4 && (
                  <>
                    {field("diet", "Food and eating habits", true)}
                    {field("movement", "Movement and exercise", true)}
                    {field("sleepHabits", "Sleep schedule and routines", true)}
                    {field(
                      "emotionalWellbeing",
                      "Stress, emotional wellbeing and support",
                      true,
                    )}
                    <h3 className="text-lg">Measurements (optional)</h3>
                    {field("bloodPressure", "Blood pressure, e.g. 120/80 mmHg")}
                    {field("heartRate", "Resting heart rate (beats/minute)")}
                    <div className="grid grid-cols-2 gap-4">
                      {field("weight", "Weight")}
                      {select("weightUnit", "Weight unit", ["kg", "lb"])}
                      {field("height", "Height")}
                      {select("heightUnit", "Height unit", ["cm", "in"])}
                    </div>
                  </>
                )}
                {step === 5 && (
                  <>
                    <div className="space-y-5">{intakeSections.map((section, index) => <section key={section.title} className="rounded-xl border border-border p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg">{section.title}</h3><Button type="button" variant="ghost" className="min-h-11" onClick={()=>go(index)} aria-label={`Edit ${section.title}`}>Edit<Pencil className="ml-2 h-3.5 w-3.5" aria-hidden="true"/></Button></div><dl className="space-y-4">{section.keys.filter(key=>requiredIntakeKeys.includes(key) || (Array.isArray(intake[key]) ? intake[key].length : String(intake[key]).trim())).map(key=><div key={key}><dt className="text-xs text-muted-foreground">{intakeLabels[key]}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{intakeAnswer(intake,key)}</dd></div>)}</dl>{index>2 && !section.keys.some(key=>Array.isArray(intake[key])?intake[key].length:String(intake[key]).trim()) && <p className="text-sm text-muted-foreground">Optional details not added. You can discuss these with your practitioner.</p>}</section>)}</div>
                    <div className="rounded-xl bg-secondary/50 p-4"><h3 className="text-lg">Before you submit</h3>{intakeErrors(intakeSchema.parse(intake)).length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{intakeErrors(intakeSchema.parse(intake)).map(e=><li key={e}>{e}</li>)}</ul> : <p className="mt-2 text-sm leading-6">Your required answers are complete. No diagnosis is generated by this questionnaire.</p>}</div>
                    <label className="flex min-h-12 items-start gap-3 text-sm leading-7"><input type="checkbox" className="mt-1.5 h-5 w-5 shrink-0 accent-primary" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I have reviewed my answers and want to submit them for practitioner review.</span></label>
                  </>
                )}
              </fieldset>
            </section>
            <div className="sticky bottom-0 z-10 mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/95 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-sm sm:flex sm:items-center sm:justify-between">
              <Button
                variant="outline"
                className="min-h-12"
                disabled={step === 0 || busy}
                onClick={() => go(step - 1)}
              >
                Back
              </Button>
              <div className="contents sm:flex sm:gap-3">
                <Button
                  variant="outline"
                  disabled={busy}
                  className="min-h-12"
                  onClick={() => save()}
                >
                  {preview ? "Save preview" : "Save progress"}
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    disabled={busy}
                    className="col-span-2 min-h-12"
                    onClick={() => next()}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    disabled={busy || !confirmed}
                    className="col-span-2 min-h-12 whitespace-normal"
                    onClick={() => save(true)}
                  >
                    {busy
                      ? "Submitting…"
                      : preview ? "Finish fictional preview" : "Submit for practitioner review"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
