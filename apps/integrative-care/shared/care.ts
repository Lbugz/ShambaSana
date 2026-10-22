import { z } from "zod";

const text = z.string().trim().max(5000);
export const intakeSchema = z.object({
  schemaVersion: z.literal(1),
  name: text,
  age: z.string().max(3),
  gender: text,
  phone: text,
  concern: text,
  goals: text,
  history: text,
  medications: text,
  allergies: text,
  pregnancy: z.enum(["", "yes", "no", "unsure", "not-applicable"]),
  pain: z.string().max(2),
  energy: z.string().max(2),
  sleep: z.string().max(2),
  stress: z.string().max(2),
  temperature: text,
  thirst: text,
  digestion: text,
  symptoms: z.array(z.string().max(100)).max(30),
  constitution: z.array(z.string().max(100)).max(30),
  tongueColor: text,
  tongueCoating: text,
  tongueShape: text,
  tongueMoisture: text,
  tongueNotes: text,
  bloodPressure: text,
  heartRate: text,
  weight: text,
  weightUnit: z.enum(["kg", "lb"]),
  height: text,
  heightUnit: z.enum(["cm", "in"]),
  diet: text,
  movement: text,
  sleepHabits: text,
  emotionalWellbeing: text,
});
export type Intake = z.infer<typeof intakeSchema>;
export const blankIntake: Intake = {
  schemaVersion: 1,
  name: "",
  age: "",
  gender: "",
  phone: "",
  concern: "",
  goals: "",
  history: "",
  medications: "",
  allergies: "",
  pregnancy: "",
  pain: "",
  energy: "",
  sleep: "",
  stress: "",
  temperature: "",
  thirst: "",
  digestion: "",
  symptoms: [],
  constitution: [],
  tongueColor: "",
  tongueCoating: "",
  tongueShape: "",
  tongueMoisture: "",
  tongueNotes: "",
  bloodPressure: "",
  heartRate: "",
  weight: "",
  weightUnit: "kg",
  height: "",
  heightUnit: "cm",
  diet: "",
  movement: "",
  sleepHabits: "",
  emotionalWellbeing: "",
};
export function intakeErrors(i: Intake): string[] {
  const errors: string[] = [];
  if (!i.name) errors.push("Enter your name.");
  if (!/^\d+$/.test(i.age) || +i.age < 18 || +i.age > 120)
    errors.push("This pilot is for adults aged 18 and over. Enter your age.");
  if (!i.concern) errors.push("Tell us your main health concern.");
  if (!i.medications || !i.allergies || !i.history)
    errors.push(
      "Complete medical history, medications and allergies. Write 'none' when appropriate.",
    );
  if (!i.pregnancy) errors.push("Complete the pregnancy question.");
  for (const k of ["pain", "energy", "sleep", "stress"] as const) {
    if (!/^\d+$/.test(i[k]) || +i[k] > 10)
      errors.push(`Choose a ${k} rating from 0 to 10.`);
  }
  return errors;
}
export const labRowSchema = z.object({
  name: z.string().trim().min(1).max(200),
  value: z.string().trim().min(1).max(200),
  unit: z.string().max(100),
  referenceRange: z.string().max(200),
  flag: z.enum(["normal", "high", "low", "critical", "unknown"]),
  sourcePage: z.string().max(100),
});
export type LabRow = z.infer<typeof labRowSchema>;
export const extractionSchema = z.object({
  patientName: z.string().max(200),
  collectionDate: z.string().max(100),
  laboratory: z.string().max(200),
  results: z.array(labRowSchema).max(400),
  uncertainty: z.string().max(5000),
});
export type Extraction = z.infer<typeof extractionSchema>;
export const reportFields = {
  overview: "Your health overview",
  labs: "What your labs show",
  tcm: "Your TCM assessment",
  priorities: "Your next steps",
  nutrition: "Food and nutrition",
  lifestyle: "Movement, rest and routines",
  recommendations: "Practitioner recommendations",
  safety: "Safety and follow-up",
} as const;
export const reportSchema = z.object({
  overview: text,
  labs: text,
  tcm: text,
  priorities: text,
  nutrition: text,
  lifestyle: text,
  recommendations: text,
  safety: text,
});
export type Report = z.infer<typeof reportSchema>;
export const blankReport: Report = {
  overview: "",
  labs: "",
  tcm: "",
  priorities: "",
  nutrition: "",
  lifestyle: "",
  recommendations: "",
  safety: "",
};
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "practitioner";
};
export type User = PublicUser & { passwordHash: string };
export type Document = {
  id: string;
  name: string;
  mime: string;
  size: number;
  purpose: "lab" | "tongue";
  uploadedAt: string;
  extraction?: Extraction;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNote?: string;
};
export type ReportVersion = {
  id: string;
  createdAt: string;
  author: string;
  content: Report;
  approvedAt: string;
  sourceRevision: number;
};
export type CareCase = {
  id: string;
  revision: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
  consent: { version: "pilot-v1"; acceptedAt: string };
  aiConsent?: { version: "ai-v1"; acceptedAt: string };
  payment: {
    status: "unpaid-pilot" | "pending" | "paid" | "refunded";
    checkoutId?: string;
    paymentIntent?: string;
    amount: number;
    currency: "usd";
  };
  intake: Intake;
  intakeSubmittedAt?: string;
  documents: Document[];
  labRequest?: {
    requestedAt: string;
    status: "requested" | "ordered";
    details?: string;
    externalReference?: string;
    orderedAt?: string;
  };
  practitionerNotes: string;
  followupRequest: string;
  draft?: {
    content: Report;
    author: string;
    createdAt: string;
    source: "manual" | "ai";
    basedOnRevision: number;
  };
  reports: ReportVersion[];
  events: { at: string; action: string; actor: string }[];
};
export type CareConfig = {
  pilot: boolean;
  billingMode: "sandbox" | "live";
  checkout: boolean;
  ai: boolean;
  amount: number;
  currency: string;
};
export function caseStatus(c: CareCase): string {
  if (c.payment.status === "refunded")
    return "Payment refunded — contact your care team";
  if (c.payment.status === "pending") return "Payment pending";
  if (c.followupRequest) return "More information requested";
  if (c.reports.length) return "Your report is ready";
  if (!c.intakeSubmittedAt) return "Complete your intake";
  if (!c.documents.some((d) => d.purpose === "lab"))
    return c.labRequest?.status === "ordered"
      ? "Labs ordered — awaiting results"
      : "Add labs or request an order";
  if (c.documents.some((d) => d.purpose === "lab" && !d.verifiedAt))
    return "Lab verification in progress";
  return c.draft
    ? "Practitioner reviewing your report"
    : "Ready for practitioner review";
}
