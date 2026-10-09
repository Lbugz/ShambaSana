import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import {
  useAuth,
  useCase,
  useCaseAction,
  hashParams,
  uploadDocument,
} from "@/lib/care";
import { intakeErrors, type Intake } from "@shared/care";

const steps = [
  "Your profile",
  "Health history",
  "Symptoms and energy",
  "TCM observations",
  "Lifestyle and rhythms",
  "Review and submit",
];
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
export default function TcmAssessment() {
  const auth = useAuth("customer");
  const [, navigate] = useLocation();
  const id = hashParams().get("case") || "";
  const query = useCase(id, auth.user?.role === "customer");
  const action = useCaseAction(id);
  const [intake, setIntake] = useState<Intake>();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setIntake(undefined);
    setStep(0);
    setSubmitted(false);
  }, [id]);
  useEffect(() => {
    if (query.data && !intake) setIntake(query.data.intake);
  }, [query.data, intake]);
  if (auth.isLoading) return <p className="p-10">Loading your intake…</p>;
  if (!id)
    return (
      <CareLayout>
        <h1 className="text-3xl">Choose a care episode first</h1>
        <p className="my-5 text-sm">
          Your questionnaire belongs to your private care record.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to my care</Button>
      </CareLayout>
    );
  const c = query.data;
  if (!c || !intake)
    return (
      <CareLayout>
        <ErrorMessage error={query.error} />
        <p>Loading your saved questionnaire…</p>
      </CareLayout>
    );
  if (c.payment.status === "pending" || c.reports.length)
    return (
      <CareLayout>
        <h1 className="text-3xl">
          {c.reports.length
            ? "Your case has an approved report"
            : "Complete enrollment first"}
        </h1>
        <Button className="mt-6" onClick={() => navigate("/dashboard")}>
          Return to my care
        </Button>
      </CareLayout>
    );
  const change = (key: keyof Intake, value: unknown) =>
    setIntake({ ...intake, [key]: value });
  const save = async (submit = false, exit = false) => {
    setError(undefined);
    setNotice("");
    try {
      if (submit) {
        const errors = intakeErrors(intake);
        if (errors.length) throw new Error(errors.join(" "));
      }
      await action.mutateAsync({
        path: "/intake",
        method: "PUT",
        body: { revision: c.revision, intake, submit },
      });
      setNotice(
        submit
          ? "Your intake was submitted for practitioner review."
          : "Your answers are saved.",
      );
      if (submit) setSubmitted(true);
      if (exit) navigate("/dashboard");
    } catch (e) {
      setError(e);
    }
  };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(undefined);
    try {
      await action.mutateAsync({
        path: "/documents",
        body: await uploadDocument(file, "tongue", c.revision),
      });
      setNotice("Your tongue photo was saved to your care record.");
    } catch (e) {
      setError(e);
    }
    e.target.value = "";
  };
  const field = (
    key: keyof Intake,
    label: string,
    multiline = false,
    hint = "",
  ) => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      {multiline ? (
        <Textarea
          className="mt-2 min-h-24"
          id={key}
          value={String(intake[key])}
          onChange={(e) => change(key, e.target.value)}
          maxLength={5000}
        />
      ) : (
        <Input
          className="mt-2"
          id={key}
          value={String(intake[key])}
          onChange={(e) => change(key, e.target.value)}
          maxLength={key === "age" ? 3 : 200}
        />
      )}{" "}
      {hint && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
      )}
    </div>
  );
  const select = (key: keyof Intake, label: string, options: string[]) => (
    <div key={key}>
      <Label htmlFor={key}>{label}</Label>
      <select
        id={key}
        value={String(intake[key])}
        onChange={(e) => change(key, e.target.value)}
        className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm"
      >
        <option value="">Choose an answer</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
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
    <CareLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
              Your health and TCM intake
            </p>
            <h1 className="text-3xl">Tell us your story.</h1>
          </div>
          <Button
            variant="outline"
            disabled={action.isPending}
            onClick={() => save(false, true)}
          >
            Save & exit
          </Button>
        </div>
        {submitted ? (
          <section className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl">Your intake is submitted</h2>
            <p className="my-5 text-sm leading-7">
              Your full answers are saved in your care record for your
              practitioner. Add your lab documents in the dashboard to continue.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to my care
            </Button>
          </section>
        ) : (
          <>
            <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s}>
                  <button
                    disabled={action.isPending}
                    onClick={() => setStep(i)}
                    aria-current={step === i ? "step" : undefined}
                    className={`w-full rounded-lg p-3 text-left text-xs ${step === i ? "bg-primary text-white" : "bg-secondary/50 text-primary"}`}
                  >
                    {i + 1}. {s}
                  </button>
                </li>
              ))}
            </ol>
            <ErrorMessage error={error || action.error} />
            {notice && (
              <p role="status" className="my-4 text-sm">
                {notice}
              </p>
            )}
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <p className="mb-2 text-xs text-muted-foreground">
                Step {step + 1} of {steps.length}
              </p>
              <h2 className="mb-7 text-2xl">{steps[step]}</h2>
              <div className="space-y-6">
                {step === 0 && (
                  <>
                    {field("name", "Full name")}
                    {field("age", "Age (18 or older)")}
                    {field("gender", "Gender (optional)")}
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
                    <div>
                      <Label htmlFor="pregnancy">
                        Are you pregnant, breastfeeding or trying to conceive?
                      </Label>
                      <select
                        id="pregnancy"
                        value={intake.pregnancy}
                        onChange={(e) => change("pregnancy", e.target.value)}
                        className="mt-2 w-full rounded-lg border bg-background p-3 text-sm"
                      >
                        <option value="">Choose an answer</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="unsure">Unsure</option>
                        <option value="not-applicable">Not applicable</option>
                      </select>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Choose each rating yourself. No answer is preselected.
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
                        disabled={action.isPending}
                        className="max-w-full text-sm"
                      />
                      {c.documents
                        .filter((d) => d.purpose === "tongue")
                        .map((d) => (
                          <p key={d.id} className="mt-3 break-all text-sm">
                            <a
                              className="underline"
                              href={`/api/cases/${id}/documents/${d.id}`}
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
                    <p className="text-sm leading-7 text-muted-foreground">
                      Review your answers below. Submit when your profile,
                      medical history and four symptom ratings are complete.
                    </p>
                    <dl className="space-y-4">
                      {Object.entries(intake)
                        .filter(([k]) => k !== "schemaVersion")
                        .map(([k, v]) => (
                          <div key={k} className="border-b border-border pb-3">
                            <dt className="text-xs capitalize text-muted-foreground">
                              {k.replace(/([A-Z])/g, " $1")}
                            </dt>
                            <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                              {Array.isArray(v)
                                ? v.join(", ") || "Not answered"
                                : String(v) || "Not answered"}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </>
                )}
              </div>
            </section>
            <div className="mt-7 flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                disabled={step === 0 || action.isPending}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  disabled={action.isPending}
                  onClick={() => save()}
                >
                  Save progress
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    disabled={action.isPending}
                    onClick={() => setStep(step + 1)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    disabled={action.isPending}
                    onClick={() => save(true)}
                  >
                    {action.isPending
                      ? "Submitting…"
                      : "Submit for practitioner review"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </CareLayout>
  );
}
