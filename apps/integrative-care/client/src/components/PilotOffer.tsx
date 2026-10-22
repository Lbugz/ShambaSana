import { Link } from "wouter";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useCareConfig, money } from "@/lib/care";
export function PilotOffer() {
  const config = useCareConfig();
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-primary/15 bg-card p-7 shadow-sm md:p-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
        One starting point · Integrative Care pilot
      </p>
      <h2 className="text-3xl md:text-4xl">Your health, brought together.</h2>
      <p className="mt-4 leading-7 text-muted-foreground">
        A TCM-informed intake, review of your existing labs, and a personal
        report edited and approved by your practitioner.
      </p>
      <div className="my-7">
        {config.data?.billingMode !== "live" && <p className="mb-2 text-sm font-semibold text-primary">Sandbox package · test checkout only</p>}
        <span className="font-serif text-4xl">
          {config.data ? money(config.data.amount) : "Pilot package"}
        </span>
        {config.data && (
          <span className="ml-3 text-sm text-muted-foreground">
            one care episode
          </span>
        )}
      </div>
      <ul className="mb-7 space-y-3 text-sm">
        {[
          "Saved health history and TCM questionnaire",
          "Upload and review of existing lab reports",
          "Practitioner assessment combining labs and your intake",
          "Plain-language priorities, recommendations and follow-up",
        ].map((t) => (
          <li key={t} className="flex gap-3">
            <Check className="h-5 w-5 shrink-0 text-primary" />
            {t}
          </li>
        ))}
      </ul>
      <p className="mb-7 text-sm leading-6 text-muted-foreground">
        New lab tests, supplements, acupuncture and other services are priced
        separately. Your practitioner can discuss which are appropriate. This
        pilot is a single care episode.
      </p>
      <Button asChild className="h-12 rounded-full px-7">
        <Link href="/auth?signup=true&plan=remote-pilot">
          {config.data?.billingMode === "live" ? "Start your care journey" : "Explore the pilot"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      {config.data?.pilot && (
        <p className="mt-4 text-xs text-muted-foreground">
          An unpaid pilot path is available in your care dashboard for testing.
        </p>
      )}
    </div>
  );
}
