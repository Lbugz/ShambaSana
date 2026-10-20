import { Link } from "wouter";
import {
  ArrowRight,
  FlaskConical,
  Leaf,
  ClipboardCheck,
  Check,
  HeartPulse,
  MessageCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PilotOffer } from "@/components/PilotOffer";
import heroBg from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";
import abstractImg from "@assets/generated_images/deep_jade_and_gold_abstract_flow_illustration.png";
import tcmImage from "@assets/generated_images/tcm_herbs_and_acupuncture_minimalist.png";
import labsImage from "@assets/generated_images/minimalist_precision_test_tubes_warm_light.png";
import guidanceImage from "@assets/generated_images/flat_lay_herbal_formulas_on_stone.png";
export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-28">
        <img
          src={heroBg}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
        <img
          src={abstractImg}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full w-2/3 object-cover opacity-20"
          style={{ maskImage: "linear-gradient(to right,transparent,black)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-[.16em] text-primary/80">
            <Leaf aria-hidden="true" className="h-4 w-4" />
            Shamba Sana · Integrative Care
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.12] md:text-7xl">
            Your body speaks
            <br />
            <span className="italic text-emerald-800/80">in patterns.</span>
          </h1>
          <p className="mt-6 font-serif text-2xl text-primary/80 md:text-3xl">
            We help you understand them.
          </p>
          <p className="mt-6 max-w-2xl border-l-2 border-amber-700/40 pl-5 text-lg leading-8 text-muted-foreground">
            Traditional Chinese Medicine, your lab results and the story only
            you can tell. Your practitioner brings them together in a personal
            assessment—and a practical path forward.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/pricing">
              <Button className="h-13 rounded-full px-8 text-base">
                Explore your care
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
            Patterns → Labs → Understanding → Personal guidance
          </p>
        </div>
      </section>
      <section className="border-y border-border bg-card/60 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              A complete picture of you
            </p>
            <h2 className="text-3xl leading-tight md:text-5xl">
              Your experience. Your evidence.
              <br />
              <span className="italic text-emerald-800/80">
                Care that connects them.
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Health is personal. We make room for the detail: the way you feel,
              the patterns you notice and the results you want to understand.
            </p>
          </div>

          <div className="grid items-center gap-9 md:grid-cols-2 md:gap-14 lg:gap-20">
            <figure className="overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-lg">
              <img
                src={tcmImage}
                alt="Traditional herbs and acupuncture tools arranged on a warm natural surface"
                width={1024}
                height={1024}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="border-t border-border/50 px-6 py-4 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                01 · Traditional wisdom
              </figcaption>
            </figure>
            <div>
              <Leaf
                aria-hidden="true"
                className="mb-5 h-8 w-8 text-amber-800"
              />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
                TCM-informed assessment
              </p>
              <h3 className="text-3xl leading-tight md:text-4xl">
                Listen to your body’s language.
              </h3>
              <p className="mt-5 leading-8 text-muted-foreground">
                Your energy, digestion, sleep and response to stress can reveal
                patterns in your daily life. Our guided intake gives your
                practitioner a way to explore these observations through the
                perspective of Traditional Chinese Medicine.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-6">
                {[
                  "Your health history and the changes you want to make",
                  "Symptoms, routines and self-reported observations",
                  "An optional tongue photo for practitioner review",
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                    />
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/how-it-works"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Discover the care journey
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-9 md:mt-24 md:grid-cols-2 md:gap-14 lg:gap-20">
            <figure className="overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-lg md:order-2">
              <img
                src={labsImage}
                alt="Precision laboratory vials in warm light beside botanical stems"
                width={1024}
                height={1024}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="border-t border-border/50 px-6 py-4 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                02 · Modern evidence
              </figcaption>
            </figure>
            <div className="md:order-1">
              <FlaskConical
                aria-hidden="true"
                className="mb-5 h-8 w-8 text-emerald-800"
              />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
                Your labs, in context
              </p>
              <h3 className="text-3xl leading-tight md:text-4xl">
                Give the numbers meaning.
              </h3>
              <p className="mt-5 leading-8 text-muted-foreground">
                Bring in the lab reports you already have. Your practitioner
                checks the original findings and considers them alongside your
                history, medications and symptoms. If more information would
                help, they can discuss appropriate new tests.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-6">
                {[
                  "Metabolic, nutrient, thyroid and other available results",
                  "Verified values, units and laboratory reference ranges",
                  "Clear explanations of findings and follow-up questions",
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                    />
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/what-we-test"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Explore tests by body system
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-16 grid items-center gap-9 md:mt-24 md:grid-cols-2 md:gap-14 lg:gap-20">
            <figure className="overflow-hidden rounded-[2rem] border border-primary/10 bg-background shadow-lg">
              <img
                src={guidanceImage}
                alt="Herbs and botanical preparations arranged on natural stone"
                width={1024}
                height={1024}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="border-t border-border/50 px-6 py-4 text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">
                03 · Personal guidance
              </figcaption>
            </figure>
            <div>
              <ClipboardCheck
                aria-hidden="true"
                className="mb-5 h-8 w-8 text-rose-700"
              />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
                Practitioner-reviewed care
              </p>
              <h3 className="text-3xl leading-tight md:text-4xl">
                An assessment.
                <br />
                And a way forward.
              </h3>
              <p className="mt-5 leading-8 text-muted-foreground">
                Receive a report in everyday language, edited and approved by
                your practitioner. It explains your lab findings and TCM
                assessment, then brings the focus back to practical steps for
                your wellbeing.
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-6">
                {[
                  "Food, movement, rest and daily routines",
                  "Vitamins, supplements or TCM services to discuss",
                  "Priorities, safety considerations and follow-up",
                ].map((text) => (
                  <li key={text} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                    />
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/how-it-works"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                See what your report includes
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
                From insight to action
              </p>
              <h2 className="text-3xl md:text-4xl">
                A thoughtful path. A human guide.
              </h2>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              How it works
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessageCircle,
                title: "Share your story",
                text: "A guided intake that you can save and return to.",
              },
              {
                icon: FlaskConical,
                title: "Bring your results",
                text: "Upload existing labs; discuss new tests when needed.",
              },
              {
                icon: HeartPulse,
                title: "Connect the pieces",
                text: "Your practitioner reviews the evidence and your intake.",
              },
              {
                icon: FileText,
                title: "Find your next step",
                text: "An approved report with clear priorities and guidance.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="rounded-2xl border border-primary/10 bg-card p-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <Icon
                    aria-hidden="true"
                    className="h-6 w-6 text-primary/70"
                  />
                  <span className="font-serif text-lg text-amber-800">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {text}
                </p>
              </li>
            ))}
          </ol>
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
          Integrative Care and the Shamba Sana Institute are our first pathways
          toward a wider vision: urban sanctuaries where learning, care, nourishing
          food, nature and community belong together.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          <a className="underline underline-offset-4" href="https://shambasana-production.up.railway.app/">
            Explore Shamba Sana
          </a>
          <a className="underline underline-offset-4" href="https://shambasana-production.up.railway.app/institute/">
            Explore the Institute
          </a>
        </div>
      </section>
    </main>
  );
}
