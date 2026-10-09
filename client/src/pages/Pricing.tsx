import { PilotOffer } from "@/components/PilotOffer";
export default function Pricing() {
  return (
    <main className="px-5 py-16">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-4 text-xs uppercase tracking-[.2em] text-muted-foreground">
          Begin with clarity
        </p>
        <h1 className="text-4xl md:text-5xl">The remote care pilot</h1>
        <p className="mt-5 leading-7 text-muted-foreground">
          One complete journey from your intake and existing labs to
          practitioner-reviewed guidance.
        </p>
      </header>
      <PilotOffer />
    </main>
  );
}
