import { intakeErrors, intakeSchema, type Intake } from "./care";

export const intakeSections = [
  { title: "About you", description: "Start with what brought you here and what you hope to improve.", keys: ["name", "age", "gender", "phone", "concern", "goals"] },
  { title: "Health history", description: "Help your practitioner understand your history and check for safety considerations.", keys: ["history", "medications", "allergies", "pregnancy"] },
  { title: "How you feel", description: "Choose the ratings that best describe how you feel recently.", keys: ["pain", "energy", "sleep", "stress", "symptoms"] },
  { title: "Your observations", description: "Share what you notice. These optional answers support your practitioner's TCM assessment.", keys: ["temperature", "thirst", "digestion", "constitution", "tongueColor", "tongueCoating", "tongueShape", "tongueMoisture", "tongueNotes"] },
  { title: "Daily life", description: "Tell us about your routines. Add measurements only if you know them.", keys: ["diet", "movement", "sleepHabits", "emotionalWellbeing", "bloodPressure", "heartRate", "weight", "height"] },
] as const;

export const intakeLabels: Partial<Record<keyof Intake, string>> = {
  name: "Full name", age: "Age", gender: "Gender", phone: "Phone", concern: "Main concern", goals: "Your goals",
  history: "Medical history", medications: "Medications, supplements and herbs", allergies: "Allergies and reactions", pregnancy: "Pregnancy, breastfeeding or trying to conceive",
  pain: "Pain · 0 none, 10 worst imaginable", energy: "Energy · 0 depleted, 10 very energetic", sleep: "Sleep quality · 0 very poor, 10 excellent", stress: "Stress · 0 none, 10 very high", symptoms: "Symptoms you notice",
  temperature: "Warmth and cold", thirst: "Thirst", digestion: "Digestion and bowel habits", constitution: "Patterns you recognize", tongueColor: "Tongue color", tongueCoating: "Tongue coating", tongueShape: "Tongue shape", tongueMoisture: "Tongue moisture", tongueNotes: "Other tongue observations",
  diet: "Food and eating habits", movement: "Movement and exercise", sleepHabits: "Sleep routines", emotionalWellbeing: "Emotional wellbeing and support", bloodPressure: "Blood pressure", heartRate: "Resting heart rate", weight: "Weight", height: "Height",
};
export const requiredIntakeKeys: (keyof Intake)[] = ["name", "age", "concern", "history", "medications", "allergies", "pregnancy", "pain", "energy", "sleep", "stress"];

export function intakeStepErrors(intake: Intake, step: number): string[] {
  const normalized = intakeSchema.parse(intake);
  if (step === 0) return intakeErrors({ ...normalized, history: "none", medications: "none", allergies: "none", pregnancy: "not-applicable", pain: "0", energy: "0", sleep: "0", stress: "0" });
  if (step === 1) return intakeErrors({ ...normalized, name: "Review", age: "18", concern: "Review", pain: "0", energy: "0", sleep: "0", stress: "0" });
  if (step === 2) return intakeErrors({ ...normalized, name: "Review", age: "18", concern: "Review", history: "none", medications: "none", allergies: "none", pregnancy: "not-applicable" });
  return [];
}

export function intakeAnswer(i: Intake, key: keyof Intake): string {
  const value = i[key];
  if (Array.isArray(value)) return value.join(", ") || "Not selected";
  if (key === "pregnancy") return ({ yes: "Yes", no: "No", unsure: "Unsure", "not-applicable": "Not applicable", "": "Not answered" })[i.pregnancy];
  if (key === "weight" && value) return `${value} ${i.weightUnit}`;
  if (key === "height" && value) return `${value} ${i.heightUnit}`;
  return String(value).trim() || "Not answered";
}
