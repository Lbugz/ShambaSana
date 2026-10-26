import { useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  Check,
  ClipboardCheck,
  Droplets,
  Flame,
  FlaskConical,
  HeartPulse,
  Leaf,
  Search,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import mandalaImage from "@assets/generated_images/holistic_body_system_mandala_illustration.png";
import paperImage from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";

// Educational examples, not an included panel or a recommendation to order every test.
const categories = [
  {
    id: "heart",
    label: "Heart",
    icon: HeartPulse,
    title: "Heart & circulation",
    description:
      "Cholesterol and related markers help frame a cardiovascular risk discussion alongside family history, blood pressure and other factors.",
    context:
      "Circulation, movement and your personal or family health history.",
    items: [
      {
        name: "Standard lipid panel",
        aliases: "cholesterol LDL HDL triglycerides",
        description:
          "Measures LDL cholesterol, HDL cholesterol and triglycerides—different types of fats circulating in the blood.",
      },
      {
        name: "Apolipoprotein B (ApoB)",
        aliases: "apob",
        description:
          "Reflects the number of certain cholesterol-carrying particles; may add information to a cardiovascular risk assessment.",
      },
      {
        name: "Lipoprotein(a)",
        aliases: "lpa lp(a)",
        description:
          "A largely inherited lipoprotein that can contribute to cardiovascular risk.",
      },
    ],
  },
  {
    id: "thyroid",
    label: "Thyroid",
    icon: Activity,
    title: "Thyroid function",
    description:
      "Thyroid results can help investigate symptoms such as temperature sensitivity, fatigue or unexplained changes in weight, together with your medical history.",
    context:
      "Energy, temperature sensitivity, medications and changes over time.",
    items: [
      {
        name: "Thyroid-stimulating hormone (TSH)",
        aliases: "tsh thyroid",
        description:
          "A hormone involved in signaling the thyroid. Often used as an initial thyroid function test.",
      },
      {
        name: "Free T4",
        aliases: "thyroxine ft4 thyroid",
        description:
          "Measures the amount of unbound thyroxine, one of the hormones produced by the thyroid.",
      },
      {
        name: "Free T3",
        aliases: "triiodothyronine ft3 thyroid",
        description:
          "Measures unbound triiodothyronine. Its usefulness depends on the clinical question and other thyroid findings.",
      },
      {
        name: "Thyroid antibodies",
        aliases: "tpo tgab thyroid peroxidase thyroglobulin",
        description:
          "May help evaluate autoimmune thyroid conditions when your practitioner considers them appropriate.",
      },
    ],
  },
  {
    id: "hormones",
    label: "Hormones",
    icon: Sparkles,
    title: "Hormones & life stages",
    description:
      "Hormone values depend on factors such as age, cycle timing, medications and the reason for testing. A single number needs that context.",
    context: "Cycle patterns, life stage, symptoms and sample timing.",
    items: [
      {
        name: "Testosterone",
        aliases: "total free testosterone",
        description:
          "A hormone involved in reproductive function and other body processes. Interpretation may consider total and free levels.",
      },
      {
        name: "Estradiol",
        aliases: "estrogen e2",
        description:
          "A form of estrogen. Expected levels vary substantially across the menstrual cycle and life stages.",
      },
      {
        name: "Progesterone",
        aliases: "cycle fertility",
        description:
          "A hormone that changes across the menstrual cycle; sample timing is important to interpretation.",
      },
      {
        name: "Cortisol",
        aliases: "stress adrenal",
        description:
          "A hormone with a daily rhythm. The type and timing of the test depend on the specific medical question.",
      },
    ],
  },
  {
    id: "metabolic",
    label: "Metabolic",
    icon: Flame,
    title: "Blood sugar & metabolic health",
    description:
      "Glucose-related markers offer different views of blood sugar regulation. Your practitioner considers them with eating patterns, activity and health history.",
    context: "Meals, activity, changes in weight and family history.",
    items: [
      {
        name: "Hemoglobin A1c (HbA1c)",
        aliases: "a1c hba1c glucose blood sugar diabetes",
        description:
          "Estimates average blood glucose over roughly the past two to three months; some conditions can affect its accuracy.",
      },
      {
        name: "Fasting glucose",
        aliases: "blood sugar glucose diabetes",
        description:
          "A blood sugar measurement at one point in time after fasting.",
      },
      {
        name: "Fasting insulin",
        aliases: "insulin resistance",
        description:
          "Measures circulating insulin after fasting. May be considered with glucose and other findings when appropriate.",
      },
    ],
  },
  {
    id: "nutrients",
    label: "Nutrients",
    icon: Leaf,
    title: "Nutrients & minerals",
    description:
      "Nutrient results may help investigate specific concerns. Diet, absorption, supplementation and the type of test all influence what a result means.",
    context: "Food choices, digestion, supplements and your energy concerns.",
    items: [
      {
        name: "Vitamin D (25-OH)",
        aliases: "vitamin d d3 25 hydroxy",
        description:
          "The usual blood marker for vitamin D status, considered alongside bone health and individual risk factors.",
      },
      {
        name: "Vitamin B12",
        aliases: "b12 cobalamin energy",
        description:
          "A nutrient important for blood cells and nerve function. A result may need additional context or follow-up tests.",
      },
      {
        name: "Folate",
        aliases: "vitamin b9 folic acid",
        description:
          "A B vitamin needed for cell production; results can be considered with dietary intake and blood counts.",
      },
      {
        name: "Magnesium",
        aliases: "magnesium mg mineral",
        description:
          "A mineral involved in many body processes. Interpretation depends on the sample type and clinical situation.",
      },
      {
        name: "Zinc",
        aliases: "zinc mineral",
        description:
          "An essential trace mineral; testing is considered in the context of diet, symptoms and specific risk factors.",
      },
    ],
  },
  {
    id: "blood",
    label: "Blood & iron",
    icon: Droplets,
    title: "Blood health & iron stores",
    description:
      "Blood counts and iron studies can help investigate fatigue and other concerns. Results are considered together rather than interpreted in isolation.",
    context: "Fatigue, bleeding history, nutrition and other potential causes.",
    items: [
      {
        name: "Complete blood count (CBC)",
        aliases:
          "cbc hemoglobin haematocrit hematocrit red white cells platelets anemia",
        description:
          "Describes red blood cells, white blood cells and platelets, including hemoglobin and other measurements.",
      },
      {
        name: "Ferritin",
        aliases: "iron storage anemia fatigue energy",
        description:
          "A protein used to assess iron stores. Inflammation and other conditions can also affect the result.",
      },
      {
        name: "Iron & transferrin saturation",
        aliases: "iron tibc transferrin saturation anemia",
        description:
          "Help assess circulating iron and how much of the iron-binding capacity is being used.",
      },
    ],
  },
  {
    id: "organs",
    label: "Liver & kidney",
    icon: FlaskConical,
    title: "Liver & kidney function",
    description:
      "These markers help your practitioner consider organ function, medications and potential follow-up needs in the context of your broader health.",
    context: "Medical history, hydration, medications and relevant symptoms.",
    items: [
      {
        name: "ALT & AST",
        aliases: "liver enzymes alanine aspartate transaminase",
        description:
          "Enzymes that can signal liver or other tissue changes. The pattern and degree of change help guide further assessment.",
      },
      {
        name: "Alkaline phosphatase (ALP)",
        aliases: "alp liver bone",
        description:
          "An enzyme associated with the liver, bile ducts and bone; other findings help clarify its source.",
      },
      {
        name: "Bilirubin",
        aliases: "liver jaundice",
        description:
          "A product of red blood cell breakdown processed by the liver.",
      },
      {
        name: "Creatinine & eGFR",
        aliases: "kidney renal filtration creatinine egfr",
        description:
          "Used together to estimate kidney filtration; muscle mass and other factors can affect interpretation.",
      },
    ],
  },
  {
    id: "inflammation",
    label: "Inflammation",
    icon: Flame,
    title: "Inflammatory markers",
    description:
      "Inflammation markers can be elevated for many reasons. They offer clues for a clinical assessment rather than identifying a cause on their own.",
    context:
      "Recent illness, ongoing symptoms and relevant medical conditions.",
    items: [
      {
        name: "C-reactive protein (CRP / hs-CRP)",
        aliases: "crp hs-crp high sensitivity inflammation heart",
        description:
          "A marker of inflammation. A high-sensitivity version may also be used in cardiovascular risk assessment in appropriate circumstances.",
      },
      {
        name: "Erythrocyte sedimentation rate (ESR)",
        aliases: "esr sed rate inflammation",
        description:
          "An indirect inflammation marker that is interpreted alongside symptoms and other findings.",
      },
    ],
  },
  {
    id: "immune",
    label: "Immune",
    icon: Shield,
    title: "Immune-related findings",
    description:
      "Immune testing is guided by symptoms and medical history. Broad screening without a specific clinical question can create results that are difficult to interpret.",
    context:
      "Symptoms, infection history and the question your clinician is investigating.",
    items: [
      {
        name: "White blood cell differential",
        aliases: "wbc neutrophils lymphocytes eosinophils cbc immune",
        description:
          "Shows the different types of white blood cells and is often reported with a complete blood count.",
      },
      {
        name: "Immunoglobulins (IgA, IgG, IgM)",
        aliases: "iga igg igm immunoglobulin antibodies immune",
        description:
          "Measure classes of antibodies when an immune-related medical question warrants testing.",
      },
      {
        name: "Antinuclear antibodies (ANA)",
        aliases: "ana autoimmune antibodies",
        description:
          "May be used in evaluating certain autoimmune conditions. A positive result alone does not establish a diagnosis.",
      },
    ],
  },
];

export default function WhatWeTest() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<{name:string; description:string; category:string; context:string}>();
  const query = search.trim().toLowerCase();
  const filtered = categories
    .filter(
      (category) => activeCategory === "all" || activeCategory === category.id,
    )
    .map((category) => {
      const categoryMatches = `${category.label} ${category.title}`
        .toLowerCase()
        .includes(query);
      const items = category.items.filter(
        (item) =>
          categoryMatches ||
          `${item.name} ${item.aliases} ${item.description}`
            .toLowerCase()
            .includes(query),
      );
      return { ...category, items };
    })
    .filter((category) => category.items.length > 0);
  const reset = () => {
    setSearch("");
    setActiveCategory("all");
  };

  return (
    <main>
      <header className="relative overflow-hidden px-6 pb-8 pt-10 text-center md:pt-14">
        <img
          src={paperImage}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.23em] text-muted-foreground">
            Understand your results
          </p>
          <h1 className="text-4xl leading-[1.15] md:text-5xl">
            Lab guide.
            <br />
            <span className="italic text-emerald-800/80">
              Every result has a story.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Explore the markers in your lab reports by body system. Understand
            what they can tell you, with your story and practitioner’s guidance
            in view.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Bring your existing reports. Additional testing is chosen with your
            practitioner and priced separately.
          </p>
          <div className="relative mx-auto mt-8 max-w-xl">
            <label htmlFor="lab-search" className="sr-only">
              Search lab tests
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-4 h-5 w-5 text-muted-foreground"
            />
            <Input
              id="lab-search"
              type="search"
              value={search}
              onChange={(event) => {setSearch(event.target.value);setActiveCategory("all");}}
              placeholder="Search a test or topic, e.g. ferritin, thyroid…"
              className="h-14 rounded-full border-primary/20 bg-card pl-13 pr-13 text-base shadow-sm [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <button
                aria-label="Clear test search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-background px-6 pb-6 text-center"><Link href="/sample-results" className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold underline underline-offset-4">Explore a sample results workspace<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      <nav
        aria-label="Filter tests by body system"
        className="border-y border-border/60 bg-background/95"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-4">
          {[
            { id: "all", label: "All areas", icon: FlaskConical },
            ...categories,
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-pressed={activeCategory === id}
              onClick={() => {
                setActiveCategory(id);
                document.getElementById("lab-explorer")?.scrollIntoView({
                  block: "start",
                  behavior: "instant",
                });
              }}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${activeCategory === id ? "border-primary bg-primary text-white" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <section
        id="lab-explorer"
        aria-label="Explore lab markers"
        className="mx-auto max-w-6xl scroll-mt-44 px-6 py-10 md:py-14"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {filtered.length
              ? `${filtered.length} ${filtered.length === 1 ? "area" : "areas"} · ${filtered.reduce((count, category) => count + category.items.length, 0)} test ${filtered.reduce((count, category) => count + category.items.length, 0) === 1 ? "example" : "examples"}`
              : "No matching test examples"}
          </p>
          {(search || activeCategory !== "all") && (
            <button
              onClick={reset}
              className="min-h-11 rounded-md px-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Reset explorer
            </button>
          )}
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-8">
            {filtered.map((category) => (
              <section
                key={category.id}
                aria-labelledby={`lab-${category.id}`}
                className="overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-sm"
              >
                <header className="border-b border-border/50 bg-secondary/30 p-6 md:px-8">
                  <div className="flex items-center gap-3">
                    <category.icon
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 text-primary/70"
                    />
                    <h2 id={`lab-${category.id}`} className="text-2xl">
                      {category.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {category.description}
                  </p>
                </header>
                <dl className="divide-y divide-border/60">
                  {category.items.map((item) => (
                    <div key={item.name} className="px-6 py-5 md:px-8">
                      <dt className="font-semibold text-primary">
                        <button onClick={() => setSelectedMarker({...item,category:category.title,context:category.context})} className="flex min-h-11 w-full items-center justify-between gap-4 rounded-md text-left underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">{item.name}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">Learn about {item.name}</span></button>
                      </dt>
                      <dd className="mt-2 text-sm leading-7 text-muted-foreground">
                        {item.description}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex gap-3 border-t border-amber-800/10 bg-amber-50/70 p-6 md:px-8">
                  <Leaf
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0 text-amber-800"
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.17em] text-amber-800">
                      Your story adds context
                    </p>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {category.context}
                    </p>
                  </div>
                </div>
              </section>
            ))}
            {!filtered.length && (
              <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
                <Search
                  aria-hidden="true"
                  className="mx-auto mb-5 h-8 w-8 text-muted-foreground"
                />
                <h2 className="text-2xl">No tests found.</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Try a different test name or explore another body system.
                </p>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="mt-6 min-h-11 rounded-full border-primary/20 px-6"
                >
                  Show all areas
                </Button>
              </div>
            )}
            <p className="text-sm leading-7 text-muted-foreground">
              This is an educational guide to representative tests. Your care
              episode reviews the reports you provide; it does not include a
              fixed lab panel or every test listed here.
            </p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-44">
            <div className="rounded-3xl border border-primary/10 bg-card p-7 text-center shadow-sm">
              <img
                src={mandalaImage}
                alt="Botanical illustration of interconnected body systems"
                width={1024}
                height={1024}
                className="mx-auto mb-5 aspect-square w-48 rounded-full object-cover"
              />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
                Data meets wisdom
              </p>
              <h2 className="text-2xl">More than a lab value.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Your practitioner considers lab findings alongside your
                symptoms, daily life and a separate TCM assessment. The goal is
                a report that makes the bigger picture easier to understand.
              </p>
              <Button asChild className="mt-6 min-h-11 w-full rounded-full">
                <Link href="/how-it-works">
                  See how it comes together
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-amber-800/10 bg-amber-50/70 p-6">
              <h3 className="flex items-center gap-2 text-xl">
                <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
                Every report starts with the source.
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-6">
                {[
                  "Original lab document",
                  "Values, units and reference intervals",
                  "Collection date and relevant history",
                  "Verification by your practitioner",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-emerald-700"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-secondary/30 p-6">
              <h3 className="text-xl">Already have results?</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Upload PDFs or clear photos in your private care dashboard after
                enrollment. Include the full report so your practitioner can
                review the source.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Explore the pilot
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-card/70 px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">
              The TCM perspective
            </p>
            <h2 className="text-3xl leading-tight md:text-4xl">
              The numbers are one part.
              <br />
              <span className="italic text-emerald-800/80">
                Your experience is another.
              </span>
            </h2>
            <p className="mt-5 leading-8 text-muted-foreground">
              Traditional Chinese Medicine explores patterns in how you feel and
              function. Your intake brings those observations into the
              conversation: your energy, digestion, sleep, temperature and
              emotional rhythms.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-background p-7">
            <h3 className="text-2xl">Two perspectives. A thoughtful review.</h3>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">
              Lab findings are clinical measurements. TCM patterns are a
              separate interpretive framework, informed by your intake and
              practitioner assessment. Lab results do not establish a TCM
              diagnosis. Your practitioner explains each perspective clearly in
              your report.
            </p>
            <Link
              href="/how-it-works"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Follow the care journey
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-primary px-6 py-12 text-white md:p-14">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs uppercase tracking-[.2em] text-amber-200">
              The next piece of the picture
            </p>
            <h2 className="text-3xl text-white md:text-4xl">
              Need new lab tests?
            </h2>
            <p className="mt-5 leading-8 text-white/80">
              Request a lab order in your care dashboard. Your practitioner
              determines appropriate tests and arranges the order with an
              external laboratory. Your dashboard shows the recorded order and
              reference; laboratory fees are separate.
            </p>
            <Button
              asChild
              className="mt-7 h-12 rounded-full border-0 bg-white px-7 text-primary hover:bg-amber-50"
            >
              <Link href="/pricing">
                Explore your care options
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Sheet open={!!selectedMarker} onOpenChange={open => {if(!open)setSelectedMarker(undefined);}}><SheetContent className="w-full overflow-y-auto sm:max-w-lg"><SheetHeader className="text-left"><SheetDescription>{selectedMarker?.category} · Educational guide</SheetDescription><SheetTitle className="pr-6 font-serif text-3xl">{selectedMarker?.name}</SheetTitle></SheetHeader><div className="mt-8 space-y-7"><section><h3 className="text-xl">What it measures</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{selectedMarker?.description}</p></section><section className="rounded-2xl bg-secondary/40 p-5"><h3 className="text-xl">Your story adds context</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{selectedMarker?.context}</p></section><section><h3 className="text-xl">Reading your own result</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">Keep the collection date, units and laboratory reference interval with the value. Your practitioner checks the source report and considers your history before interpreting the result.</p></section><p className="rounded-xl border border-border p-4 text-xs leading-6 text-muted-foreground">This guide does not include a fixed testing panel or a universal target range. Additional tests are chosen with your practitioner and priced separately.</p><Button asChild className="min-h-12 w-full rounded-full"><Link href="/sample-results" onClick={()=>setSelectedMarker(undefined)}>Explore the sample results workspace<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link></Button></div></SheetContent></Sheet>
    </main>
  );
}
