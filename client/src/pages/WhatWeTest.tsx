import { Link } from "wouter";
import { Button } from "@/components/ui/button";
const categories = [
  [
    "Metabolic health",
    "Glucose, HbA1c and lipid results can help your practitioner understand aspects of metabolic health.",
  ],
  [
    "Nutrients and blood health",
    "Existing results may include blood counts, ferritin, B12 or vitamin D. Interpretation depends on your history and the laboratory’s reference intervals.",
  ],
  [
    "Thyroid, liver and kidney markers",
    "Your practitioner considers available findings in context and discusses whether follow-up testing is appropriate.",
  ],
  [
    "Your TCM assessment",
    "Your symptoms, routines and self-reported observations inform a separate TCM assessment. Lab findings do not establish or validate a TCM diagnosis.",
  ],
];
export default function WhatWeTest() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 max-w-3xl">
        <p className="mb-4 text-xs uppercase tracking-[.2em] text-muted-foreground">
          Labs in context
        </p>
        <h1 className="text-4xl md:text-5xl">
          Start with the results you have.
        </h1>
        <p className="mt-6 leading-8 text-muted-foreground">
          The pilot reviews existing lab documents. The tests you need depend on
          your goals, medical history and practitioner assessment. We do not
          promise a fixed number of biomarkers.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map(([title, text]) => (
          <section
            key={title}
            className="rounded-2xl border border-border bg-card p-7"
          >
            <h2 className="text-xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {text}
            </p>
          </section>
        ))}
      </div>
      <section className="mt-10 rounded-2xl bg-secondary/50 p-7">
        <h2 className="text-2xl">Need new lab tests?</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Request a lab order in your care dashboard. Your practitioner
          determines appropriate tests and arranges the order outside the app.
          The dashboard shows the order only after your practitioner records it.
          Laboratory fees are separate.
        </p>
      </section>
      <Link href="/pricing">
        <Button className="mt-8 rounded-full px-8">Explore the pilot</Button>
      </Link>
    </main>
  );
}
