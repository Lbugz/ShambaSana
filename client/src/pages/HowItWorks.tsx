import { Link } from "wouter";
import { Button } from "@/components/ui/button";
const steps = [
  [
    "Choose your care episode",
    "Create your account, review what the pilot includes, and complete enrollment. Paid enrollment uses hosted checkout when available.",
  ],
  [
    "Tell us your story",
    "Complete your health history and TCM questionnaire. Save your progress, add medications and allergies, and describe your goals.",
  ],
  [
    "Bring in your labs",
    "Upload existing lab reports. If you need new tests, request an order for your practitioner to arrange with a laboratory. New tests are priced separately.",
  ],
  [
    "Your practitioner reviews",
    "Lab values are checked against the original document. Your practitioner considers them alongside your intake, asks for missing information, and edits the combined assessment.",
  ],
  [
    "Receive your personal report",
    "Your practitioner approves the report before it appears in your care dashboard. Read clear priorities, discuss recommendations, and print a copy for your records.",
  ],
];
export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <p className="mb-4 text-xs uppercase tracking-[.2em] text-muted-foreground">
          The Shamba Sana journey
        </p>
        <h1 className="text-4xl md:text-5xl">
          From information to understanding.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
          A practical path with your practitioner involved at every decision.
        </p>
      </header>
      <ol className="space-y-5">
        {steps.map(([title, text], i) => (
          <li
            key={title}
            className="flex gap-5 rounded-2xl border border-border bg-card p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif">
              {i + 1}
            </span>
            <div>
              <h2 className="text-xl">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {text}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/pricing">
        <Button className="mt-10 rounded-full px-8">Explore the pilot</Button>
      </Link>
    </main>
  );
}
