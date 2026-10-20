import { Link } from "wouter";
export default function FormulaLibrary() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl">Practitioner recommendations</h1>
      <p className="mt-6 leading-8 text-muted-foreground">
        Recommendations about herbs, supplements, vitamins, acupuncture or
        acupressure belong in your personal care report. Your practitioner
        considers your medications, allergies and health history before
        recommending a protocol.
      </p>
      <p className="mt-5 leading-8 text-muted-foreground">
        If a recommendation needs clarification, discuss it with your
        practitioner before starting it.
      </p>
      <Link
        className="mt-8 inline-block font-medium underline"
        href="/dashboard"
      >
        Go to your care dashboard
      </Link>
    </main>
  );
}
