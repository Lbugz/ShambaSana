import { Link } from "wouter";
import { ArrowRight, FlaskConical, Leaf, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PilotOffer } from "@/components/PilotOffer";
import heroBg from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";
import abstractImg from "@assets/generated_images/deep_jade_and_gold_abstract_flow_illustration.png";
export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden py-20 md:py-28">
        <img
          src={heroBg}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
        <img
          src={abstractImg}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full w-2/3 object-cover opacity-10"
          style={{ maskImage: "linear-gradient(to right,transparent,black)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[.23em] text-primary/70">
            Shamba Sana · Remote integrative care
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.12] md:text-7xl">
            Cultivating wellbeing.
            <br />
            <span className="italic text-emerald-800/80">
              Starting with you.
            </span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Your story, your lab results and the perspective of Traditional
            Chinese Medicine—brought together by a practitioner who helps you
            understand what comes next.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/pricing">
              <Button className="h-13 rounded-full px-8 text-base">
                Explore the pilot
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button
                variant="outline"
                className="h-13 rounded-full bg-background/70 px-8 text-base"
              >
                How your care works
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[.17em] text-primary/60">
            Your story → Labs → Practitioner review → Personal guidance
          </p>
        </div>
      </section>
      <section className="border-y border-border bg-card/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
              A fuller picture
            </p>
            <h2 className="text-3xl md:text-4xl">
              Care that connects the pieces.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Your lived experience",
                text: "Share symptoms, health history, daily routines and TCM-related observations in a questionnaire you can save and return to.",
              },
              {
                icon: FlaskConical,
                title: "Your lab evidence",
                text: "Bring your existing results. Your practitioner checks the original values, units and reference ranges before using them in an assessment.",
              },
              {
                icon: ClipboardCheck,
                title: "Your practitioner’s judgment",
                text: "Receive an approved report in everyday language, with priorities and suggestions tailored to your history, goals and results.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="mb-5 h-7 w-7 text-primary/70" />
                <h3 className="mb-3 text-xl">{title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-20">
        <PilotOffer />
      </section>
      <section className="bg-primary px-6 py-16 text-center text-primary-foreground">
        <p className="text-xs uppercase tracking-[.2em] text-white/65">
          Rooted in a larger vision
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl text-white md:text-4xl">
          A healthier connection to yourself, your community and the world
          around you.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75">
          Shamba Sana begins with remote care. Our longer-term vision brings
          together learning, community and spaces for wellbeing.
        </p>
      </section>
    </div>
  );
}
