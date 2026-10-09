import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Leaf,
  MessageCircle,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportFields } from "@shared/care";
import storyImage from "@assets/generated_images/tongue_photo_pattern_intake.png";
import labsImage from "@assets/generated_images/lab_vials_with_botanicals.png";
import integrationImage from "@assets/generated_images/data_meets_tcm_integration.png";
import protocolImage from "@assets/generated_images/herbal_preparation_ritual.png";
import seasonsImage from "@assets/generated_images/seasonal_health_monitoring_cycle.png";
import paperImage from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";

const steps = [
  {
    id: "story",
    label: "Your story",
    title: "Discover your patterns.",
    eyebrow: "A fuller picture of you",
    icon: MessageCircle,
    description:
      "Your health story is the starting point. A guided TCM intake explores how you sleep, eat, feel and move—alongside your medical history and the changes you want to make.",
    details: [
      "Health goals, symptoms and daily routines",
      "Medications, allergies and medical history",
      "Optional tongue photo for practitioner review",
      "Save your answers and return at your own pace",
    ],
    outcome:
      "An intake that helps your practitioner understand your lived experience.",
    image: storyImage,
    alt: "An illustration of someone sharing a tongue photo from their phone",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
    href: "/auth?signup=true&plan=remote-pilot",
    link: "Begin your care journey",
  },
  {
    id: "labs",
    label: "Your labs",
    title: "Bring your labs into focus.",
    eyebrow: "Evidence, with context",
    icon: FlaskConical,
    description:
      "Start with the reports you already have. Your practitioner reviews the original results and, when more information would help, discusses appropriate new tests with you.",
    details: [
      "Upload existing lab reports in your dashboard",
      "Original values, units and reference ranges",
      "Request new tests for your practitioner to arrange",
      "New laboratory tests are priced separately",
    ],
    outcome:
      "A verified set of lab findings, connected to the questions that matter to you.",
    image: labsImage,
    alt: "Laboratory vials arranged with ginkgo leaves and botanicals on warm stone",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
    href: "/what-we-test",
    link: "Explore the lab guide",
  },
  {
    id: "review",
    label: "Connect the pieces",
    title: "Turn information into understanding.",
    eyebrow: "Practitioner-led interpretation",
    icon: ClipboardCheck,
    description:
      "Your practitioner checks the lab documents, considers your health history and reviews your TCM observations. They bring these perspectives together, with room for questions and clinical judgment.",
    details: [
      "Lab findings checked against the source report",
      "TCM observations considered as a separate perspective",
      "Medications and health history kept in view",
      "Follow-up questions when information is missing",
    ],
    outcome:
      "An assessment that explains the findings, the uncertainties and what deserves attention.",
    image: integrationImage,
    alt: "Jade and gold illustration connecting data charts with a yin-yang motif",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
    href: "/what-we-test",
    link: "See what informs your assessment",
  },
  {
    id: "guidance",
    label: "Personal guidance",
    title: "A protocol shaped around you.",
    eyebrow: "From insight to everyday action",
    icon: Leaf,
    description:
      "Your personal report turns the assessment into clear priorities. Your practitioner edits and approves the guidance, including food, routines and recommendations suited to your history and goals.",
    details: [
      "Food, nutrition, movement and rest",
      "Vitamins and supplements to discuss, when appropriate",
      "Potential TCM services such as acupuncture or acupressure",
      "Practical priorities and questions for follow-up",
    ],
    outcome:
      "A plain-language care report approved by your practitioner before you receive it.",
    image: protocolImage,
    alt: "Hands preparing herbs in a jade mortar beside a cup of tea",
    tone: "bg-teal-50 text-teal-800 border-teal-200",
    href: "/pricing",
    link: "See what your care includes",
  },
  {
    id: "next",
    label: "Your next steps",
    title: "Make space for what comes next.",
    eyebrow: "Guidance you can come back to",
    icon: Sprout,
    description:
      "Keep your approved report in your care dashboard, revisit your priorities and save a copy for your records. It gives you a starting point for the next conversation about your wellbeing.",
    details: [
      "Your released report in one place",
      "Print or save a PDF for your records",
      "Recommendations and follow-up considerations",
      "Additional tests and treatments arranged separately",
    ],
    outcome:
      "A useful starting point for the habits, conversations and care that follow.",
    image: seasonsImage,
    alt: "An illustrated tree moving through the seasons, with roots and leaves in jade and gold",
    tone: "bg-violet-50 text-violet-800 border-violet-200",
    href: "/pricing",
    link: "Explore the remote care pilot",
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-journey-step]"),
    );
    let frame = 0;
    const updateActiveStep = () => {
      frame = 0;
      let current = 0;
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= 240) current = index;
      });
      setActiveStep(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveStep);
    };
    updateActiveStep();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const goToStep = (index: number) => {
    const heading = document.getElementById(`journey-${steps[index].id}`);
    setActiveStep(index);
    heading?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    heading?.focus({ preventScroll: true });
  };

  return (
    <main>
      <header className="relative overflow-hidden px-6 pb-12 pt-16 text-center md:pb-16 md:pt-24">
        <img
          src={paperImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.23em] text-muted-foreground">
            The Shamba Sana journey
          </p>
          <h1 className="text-4xl leading-[1.15] md:text-6xl">
            From your story.
            <br />
            <span className="italic text-emerald-800/80">
              To your next chapter.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Your story, lab evidence and TCM insight—brought together by a
            practitioner. A clear path from understanding to action.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
            {[
              { icon: MessageCircle, text: "TCM intake" },
              { icon: FlaskConical, text: "Existing labs" },
              { icon: ClipboardCheck, text: "Practitioner review" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-card/80 px-4 py-2.5"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-primary/70" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </header>

      <nav
        aria-label="Care journey stages"
        className="sticky top-20 z-30 border-y border-border/60 bg-background/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-4 lg:justify-between">
          {steps.map((step, index) => (
            <button
              key={step.id}
              aria-current={activeStep === index ? "step" : undefined}
              onClick={() => goToStep(index)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${activeStep === index ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
            >
              <span className="font-serif">0{index + 1}</span>
              <step.icon aria-hidden="true" className="h-4 w-4" />
              {step.label}
            </button>
          ))}
        </div>
      </nav>

      <section
        aria-label="Your care journey"
        className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:pt-16"
      >
        <div className="mb-16 flex flex-col justify-between gap-5 rounded-2xl border border-primary/10 bg-secondary/35 p-6 sm:flex-row sm:items-center md:px-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
              Before you begin
            </p>
            <h2 className="text-xl md:text-2xl">
              Choose your care. Create your account.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review the package and complete enrollment, then start your saved
              intake.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 shrink-0 rounded-full border-primary/20 bg-card px-6"
          >
            <Link href="/pricing">
              Explore the pilot
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ol className="relative space-y-16 before:pointer-events-none before:absolute before:bottom-10 before:left-1/2 before:top-10 before:hidden before:border-l before:border-primary/15 lg:space-y-24 lg:before:block">
          {steps.map((step, index) => (
            <li
              key={step.id}
              data-journey-step
              data-step={index}
              className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-24"
            >
              <div
                className={index % 2 === 0 ? "lg:pr-2" : "lg:order-2 lg:pl-2"}
              >
                <div
                  className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${step.tone}`}
                >
                  <step.icon aria-hidden="true" className="h-4 w-4" />
                  Step 0{index + 1} · {step.label}
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
                  {step.eyebrow}
                </p>
                <h2
                  id={`journey-${step.id}`}
                  tabIndex={-1}
                  className="scroll-mt-48 text-3xl leading-tight focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:text-4xl"
                >
                  {step.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  {step.description}
                </p>
                <ul className="mt-6 space-y-3 text-sm leading-6">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <Check
                        aria-hidden="true"
                        className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
                <Link
                  href={step.href}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {step.link}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary font-serif text-lg text-white shadow-md lg:flex"
              >
                {index + 1}
              </span>
              <figure
                className={index % 2 === 0 ? "min-w-0" : "min-w-0 lg:order-1"}
              >
                <div className="overflow-hidden rounded-[1.75rem] border border-primary/10 shadow-lg">
                  <img
                    src={step.image}
                    alt={step.alt}
                    loading="lazy"
                    width={1280}
                    height={896}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
                  />
                </div>
                <figcaption className="mt-5 border-l-2 border-amber-600/50 pl-4 text-sm leading-7 text-muted-foreground">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-primary/75">
                    What you leave with
                  </span>
                  {step.outcome}
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-card/70 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <FileText
              aria-hidden="true"
              className="mb-5 h-8 w-8 text-amber-700"
            />
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              Your personal care report
            </p>
            <h2 className="text-3xl leading-tight md:text-4xl">
              Clarity you can carry
              <br />
              <span className="italic text-emerald-800/80">
                into everyday life.
              </span>
            </h2>
            <p className="mt-5 leading-8 text-muted-foreground">
              Understand what your labs show, how your practitioner views your
              TCM assessment, and which actions come first. Your report brings
              the detail together in language you can use.
            </p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Recommendations are tailored to you. New lab tests, supplements
              and treatments are separate from the care episode.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/15 bg-background p-6 shadow-sm md:p-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              Shamba Sana
            </p>
            <h3 className="border-b border-border pb-5 text-2xl">
              Inside your report
            </h3>
            <ol className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {Object.values(reportFields).map((label, index) => (
                <li
                  key={label}
                  className="flex items-start gap-3 text-sm leading-6"
                >
                  <span className="font-serif text-amber-800">
                    0{index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-center gap-2 border-t border-border pt-5 text-xs font-medium text-primary">
              <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
              Reviewed and approved by your practitioner
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-primary px-6 py-12 text-center text-white shadow-lg md:p-16">
          <p className="mb-4 text-xs uppercase tracking-[.23em] text-amber-200">
            Cultivating wellbeing
          </p>
          <h2 className="text-3xl leading-tight text-white md:text-5xl">
            Your story deserves a fuller picture.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-8 text-white/80">
            Begin with a TCM-informed intake, your existing labs and thoughtful
            guidance from your practitioner.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-full border-0 bg-white px-8 text-primary hover:bg-amber-50"
          >
            <Link href="/pricing">
              Explore your care options
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
