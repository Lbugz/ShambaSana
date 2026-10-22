import type { Enrollment } from "./billing";

// Each registration/payment concerns one semester. Nothing creates the next order automatically.
export function semesterPrice(e: Pick<Enrollment, "course" | "semester" | "learningFormat">): number | undefined {
  if (e.course !== "Foundations of Chinese Medicine" || !e.semester || ![1, 2, 3].includes(e.semester)) return undefined;
  if (e.learningFormat === "self-paced") return e.semester === 1 ? 200_000 : undefined;
  if (e.learningFormat !== "live-online") return undefined;
  return 200_000;
}
export function semesterDescription(e: Pick<Enrollment, "course" | "semester" | "learningFormat">) {
  return `${e.course}${e.semester ? ` — Semester ${e.semester}` : ""}${e.learningFormat ? ` — ${e.learningFormat === "self-paced" ? "Self-paced catch-up" : "Live online"}` : ""}`;
}
export const tuitionText = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
