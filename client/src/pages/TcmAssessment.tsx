import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Flame, Mountain, Wind, Waves, Sparkles, ArrowLeft, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const brand = {
  name: "LifeRX",
  tagline: "Ancient pattern recognition. Modern patient clarity.",
  colors: {
    bg: "bg-[hsl(38,35%,94%)]",
    card: "bg-white/90",
    accent: "text-emerald-800",
    border: "border-border",
  },
};

const constitutionQuestions = [
  {
    id: "wood",
    title: "Wood · Liver / Hun",
    icon: Leaf,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Drive, movement, direction, frustration, stress reactivity",
    items: [
      { id: "wood_1", text: "I am goal-oriented and tend to push forward even when tired.", element: "Wood" },
      { id: "wood_2", text: "I become frustrated or irritated easily.", element: "Wood" },
      { id: "wood_3", text: "Stress shows up as tension, headaches, or tight shoulders.", element: "Wood" },
      { id: "wood_4", text: "I prefer control, structure, and decisive action.", element: "Wood" },
    ],
  },
  {
    id: "fire",
    title: "Fire · Heart / Shen",
    icon: Flame,
    color: "bg-rose-100 text-rose-800 border-rose-200",
    description: "Expression, connection, joy, overstimulation, restlessness",
    items: [
      { id: "fire_1", text: "I am expressive, social, or emotionally open.", element: "Fire" },
      { id: "fire_2", text: "I deal with restlessness, anxiety, or insomnia.", element: "Fire" },
      { id: "fire_3", text: "I often feel overstimulated or mentally scattered.", element: "Fire" },
      { id: "fire_4", text: "My mind feels busy, especially at night.", element: "Fire" },
    ],
  },
  {
    id: "earth",
    title: "Earth · Spleen / Yi",
    icon: Mountain,
    color: "bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)] border-[hsl(35,60%,80%)]",
    description: "Nourishment, worry, digestion, grounding, support",
    items: [
      { id: "earth_1", text: "I am nurturing and often take care of others first.", element: "Earth" },
      { id: "earth_2", text: "I overthink or worry a lot.", element: "Earth" },
      { id: "earth_3", text: "I struggle with bloating, heaviness, or sluggish digestion.", element: "Earth" },
      { id: "earth_4", text: "I crave sweets or comfort foods when stressed.", element: "Earth" },
    ],
  },
  {
    id: "metal",
    title: "Metal · Lung / Po",
    icon: Wind,
    color: "bg-slate-100 text-slate-800 border-slate-200",
    description: "Order, grief, boundaries, refinement, dryness",
    items: [
      { id: "metal_1", text: "I value order, cleanliness, and precision.", element: "Metal" },
      { id: "metal_2", text: "I tend to hold grief, sadness, or emotional reserve.", element: "Metal" },
      { id: "metal_3", text: "Dry skin, dry cough, or respiratory sensitivity are familiar to me.", element: "Metal" },
      { id: "metal_4", text: "I can be self-critical or highly discerning.", element: "Metal" },
    ],
  },
  {
    id: "water",
    title: "Water · Kidney / Zhi",
    icon: Waves,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Essence, endurance, fear, will, restoration",
    items: [
      { id: "water_1", text: "I often feel depleted, exhausted, or deeply taxed.", element: "Water" },
      { id: "water_2", text: "Fear, insecurity, or uncertainty is a recurring theme for me.", element: "Water" },
      { id: "water_3", text: "I experience low back weakness, weak knees, or low reserve.", element: "Water" },
      { id: "water_4", text: "I need solitude or stillness to recover.", element: "Water" },
    ],
  },
];

const symptomQuestions = [
  { id: "sym_bloat", text: "Bloating or abdominal fullness", tags: ["Earth"] },
  { id: "sym_constipation", text: "Constipation or dry stools", tags: ["Metal", "Wood"] },
  { id: "sym_loose", text: "Loose stools or digestive weakness", tags: ["Earth"] },
  { id: "sym_headaches", text: "Headaches, especially tension-related", tags: ["Wood"] },
  { id: "sym_insomnia", text: "Difficulty falling or staying asleep", tags: ["Fire", "Water"] },
  { id: "sym_anxiety", text: "Anxiety, agitation, or palpitations", tags: ["Fire"] },
  { id: "sym_fatigue", text: "Fatigue or energy crashes", tags: ["Earth", "Water"] },
  { id: "sym_dryness", text: "Dry skin, dry throat, dry cough", tags: ["Metal"] },
  { id: "sym_pain", text: "Fixed pain, tightness, or irritability with stress", tags: ["Wood"] },
  { id: "sym_lowback", text: "Low back weakness or frequent urination", tags: ["Water"] },
];

const emotionQuestions = [
  { id: "emo_anger", text: "Anger / frustration", tags: ["Wood"] },
  { id: "emo_joy", text: "Overexcitement / emotional overstimulation", tags: ["Fire"] },
  { id: "emo_worry", text: "Worry / rumination", tags: ["Earth"] },
  { id: "emo_grief", text: "Grief / difficulty letting go", tags: ["Metal"] },
  { id: "emo_fear", text: "Fear / insecurity", tags: ["Water"] },
];

const lifePhaseOptions = [
  { id: "phase_stuck", label: "I feel stuck and unable to move forward.", hint: "Suggests stagnation / constrained movement." },
  { id: "phase_change", label: "I am in a period of transformation.", hint: "Suggests transition and dynamic reorganization." },
  { id: "phase_depleted", label: "I feel depleted and need restoration.", hint: "Suggests deficiency and rebuilding." },
  { id: "phase_building", label: "I am building something new.", hint: "Suggests growth, initiative, and emergence." },
  { id: "phase_misaligned", label: "I feel out of alignment with my purpose.", hint: "Suggests spirit-level reassessment and redirection." },
];

const elementMeta = {
  Wood: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    clinical: "Liver Qi stagnation / constrained movement",
    guidance: "Reduce internal pressure, regulate movement, soften frustration, restore flow.",
    foods: "Leafy greens, lightly cooked vegetables, sour flavors in moderation.",
    practices: "Breath + stretching, walking, Qi Gong, boundary reset.",
  },
  Fire: {
    color: "bg-rose-100 text-rose-800 border-rose-200",
    clinical: "Heart Shen disturbance / heat or overstimulation",
    guidance: "Calm the mind, reduce overstimulation, anchor sleep, regulate emotional intensity.",
    foods: "Bitter greens, cooling teas, less stimulants.",
    practices: "Evening routine, meditation, screen reduction, paced speech.",
  },
  Earth: {
    color: "bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)] border-[hsl(35,60%,80%)]",
    clinical: "Spleen Qi deficiency / damp accumulation",
    guidance: "Strengthen digestion, reduce dampness, simplify meals, interrupt overthinking.",
    foods: "Warm cooked meals, roots, soups, less sugar and cold food.",
    practices: "Meal regularity, abdominal breathing, grounding rituals.",
  },
  Metal: {
    color: "bg-slate-100 text-slate-800 border-slate-200",
    clinical: "Lung Qi deficiency / dryness or unresolved grief",
    guidance: "Support breath, hydration, boundaries, and emotional release.",
    foods: "Pears, soups, white radish, moistening foods.",
    practices: "Breathwork, grief acknowledgment, decluttering, rhythmic walks.",
  },
  Water: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    clinical: "Kidney deficiency / depleted reserves",
    guidance: "Restore reserve, protect sleep, conserve essence, rebuild steadily.",
    foods: "Mineral-rich broths, black sesame, beans, warming foods.",
    practices: "Earlier sleep, restorative exercise, heat, pacing and recovery.",
  },
};

const steps = [
  "Welcome",
  "Constitution",
  "Symptoms",
  "Emotions",
  "Life Phase",
  "Results",
];

function getTopTwo(scores: Record<string, number>) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { primary: entries[0]?.[0] || "Earth", secondary: entries[1]?.[0] || "Wood" };
}

function inferPattern(scores: Record<string, number>, selectedSymptoms: string[]) {
  const { primary, secondary } = getTopTwo(scores);
  const symptomSet = new Set(selectedSymptoms);

  if (primary === "Earth" && (symptomSet.has("sym_bloat") || symptomSet.has("sym_loose"))) {
    return "Spleen Qi deficiency with Dampness";
  }
  if (primary === "Wood" && (symptomSet.has("sym_headaches") || symptomSet.has("sym_pain"))) {
    return "Liver Qi stagnation";
  }
  if (primary === "Fire" && (symptomSet.has("sym_insomnia") || symptomSet.has("sym_anxiety"))) {
    return "Heart Shen disturbance";
  }
  if (primary === "Water" && (symptomSet.has("sym_lowback") || symptomSet.has("sym_fatigue"))) {
    return "Kidney Qi / Jing depletion";
  }
  if (primary === "Metal" && symptomSet.has("sym_dryness")) {
    return "Lung dryness / Metal imbalance";
  }
  return `${primary}-${secondary} constitutional blend`;
}

function inferHexagramHint(phase: string) {
  const map: Record<string, string> = {
    phase_stuck: "Hexagram theme: obstruction, stagnation, or blocked movement.",
    phase_change: "Hexagram theme: transformation, crossing thresholds, reorganization.",
    phase_depleted: "Hexagram theme: nourishment, return, restoration, replenishment.",
    phase_building: "Hexagram theme: emergence, growth, gathering strength.",
    phase_misaligned: "Hexagram theme: alignment, purpose, inner correction, spirit guidance.",
  };
  return map[phase] || "Hexagram theme: constitutional and life-phase review needed.";
}

export default function TcmAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [lifePhase, setLifePhase] = useState("phase_depleted");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const percent = (step / (steps.length - 1)) * 100;

  const scores = useMemo(() => {
    const base: Record<string, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };

    constitutionQuestions.forEach((group) => {
      group.items.forEach((item) => {
        if (answers[item.id]) base[item.element] += 2;
      });
    });

    symptomQuestions.forEach((item) => {
      if (answers[item.id]) item.tags.forEach((tag) => (base[tag] += 1));
    });

    emotionQuestions.forEach((item) => {
      if (answers[item.id]) item.tags.forEach((tag) => (base[tag] += 1));
    });

    if (lifePhase === "phase_stuck") base.Wood += 1;
    if (lifePhase === "phase_change") base.Fire += 1;
    if (lifePhase === "phase_depleted") base.Water += 2;
    if (lifePhase === "phase_building") base.Wood += 1;
    if (lifePhase === "phase_misaligned") base.Metal += 1;

    return base;
  }, [answers, lifePhase]);

  const selectedSymptoms = symptomQuestions.filter((q) => answers[q.id]).map((q) => q.id);
  const { primary, secondary } = getTopTwo(scores);
  const pattern = inferPattern(scores, selectedSymptoms);
  const hexagramHint = inferHexagramHint(lifePhase);

  function toggle(id: string) {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function goNext() {
    if (step === steps.length - 1) {
      toast({
        title: "Assessment Saved",
        description: "Your TCM profile has been updated on your dashboard.",
      });
      setLocation("/dashboard");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const ScoreBar = ({ label, value }: { label: string, value: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-serif">{label}</span>
        <span className="font-medium text-primary">{value} pts</span>
      </div>
      <div className="h-2.5 rounded-full bg-primary/10 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value * 10, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-primary" 
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${brand.colors.bg} font-sans flex flex-col`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-xl">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            {brand.name}
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setLocation("/dashboard")}>
            Save & Exit
          </Button>
        </div>
        <Progress value={percent} className="h-1 rounded-none bg-primary/10" indicatorClassName="bg-primary transition-all duration-500" />
      </header>

      <main className="flex-1 p-4 md:p-10">
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <Card className={`${brand.colors.card} border-border rounded-3xl shadow-sm overflow-hidden`}>
                <CardHeader className="space-y-4 p-8 md:p-10 bg-white border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-bold mb-2">LifeRX intake</div>
                      <CardTitle className="text-3xl md:text-4xl font-serif text-primary">
                        {step === 0 ? "Constitutional Discovery" : 
                         step === 1 ? "Five Elements Constitution" : 
                         step === 2 ? "Current Symptoms" :
                         step === 3 ? "Emotional Pattern Map" :
                         step === 4 ? "Life Phase & Transition" :
                         "Patient Output Report"}
                      </CardTitle>
                      {step === 0 && (
                        <CardDescription className="mt-3 text-base text-foreground/80 max-w-2xl font-sans">
                          Website-ready intake flow adapted for LifeRX branding, TCM constitutional scoring, and Medical Yi Jing integration.
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                      <span>Step {step + 1} of {steps.length}</span>
                      <span>{steps[step]}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 md:p-10 bg-white/50">
                  {step === 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="rounded-2xl border-border shadow-none bg-white">
                        <CardHeader>
                          <CardTitle className="text-xl font-serif text-primary">Welcome screen</CardTitle>
                          <CardDescription>Patient-facing introduction</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 font-medium">
                            <Sparkles className="h-4 w-4" /> Discover your constitutional pattern
                          </div>
                          <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary leading-tight">
                            Understand how your body tends to lose balance — and how to restore it.
                          </h2>
                          <p className="text-muted-foreground">
                            This guided questionnaire identifies your primary constitutional tendencies through the lens of Chinese medicine.
                            Your results provide a personalized LifeRX summary with element balance, likely TCM pattern, and next-step guidance.
                          </p>
                          <div className="grid gap-3 text-sm text-foreground/80 md:grid-cols-3">
                            <div className="rounded-2xl bg-[hsl(35,50%,95%)] p-3 border border-[hsl(35,50%,90%)]">5–7 minute completion</div>
                            <div className="rounded-2xl bg-[hsl(35,50%,95%)] p-3 border border-[hsl(35,50%,90%)]">Patient-friendly language</div>
                            <div className="rounded-2xl bg-[hsl(35,50%,95%)] p-3 border border-[hsl(35,50%,90%)]">LifeRX clinical follow-up</div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-border shadow-none bg-white flex flex-col justify-center items-center p-8 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                           <BrainCircuit className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-primary mb-2">Ready to begin?</h3>
                        <p className="text-muted-foreground mb-8">Take the LifeRX assessment to discover your primary element and areas of imbalance.</p>
                        <Button className="w-full rounded-full py-6 text-lg shadow-md" onClick={goNext}>
                          Start My Assessment <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                        </Button>
                      </Card>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <p className="text-lg text-muted-foreground">Select the statements that deeply resonate with your lifelong tendencies, not just how you feel today.</p>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {constitutionQuestions.map((group) => {
                          const Icon = group.icon;
                          return (
                            <Card key={group.id} className="rounded-2xl border-border shadow-none bg-white">
                              <CardHeader className="space-y-3">
                                <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${group.color}`}>
                                  <Icon className="h-4 w-4" /> {group.title}
                                </div>
                                <CardDescription>{group.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {group.items.map((item) => (
                                  <label key={item.id} className="flex items-start gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <Checkbox className="mt-1" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                                    <span className="text-sm text-foreground leading-6">{item.text}</span>
                                  </label>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Current symptoms</h3>
                        <p className="text-muted-foreground mt-1">These answers refine constitution into likely present-time imbalance.</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {symptomQuestions.map((item) => (
                          <label key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${answers[item.id] ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted/50'}`}>
                            <Checkbox className="mt-0.5" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                            <div>
                              <div className="text-sm font-medium text-foreground">{item.text}</div>
                              <div className="text-xs text-muted-foreground mt-1">Maps to: {item.tags.join(", ")}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Emotional pattern map</h3>
                        <p className="text-muted-foreground mt-1">Emotions help identify the spirit dimension of imbalance.</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {emotionQuestions.map((item) => (
                          <label key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${answers[item.id] ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted/50'}`}>
                            <Checkbox className="mt-0.5" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                            <div>
                              <div className="text-sm font-medium text-foreground">{item.text}</div>
                              <div className="text-xs text-muted-foreground mt-1">Element: {item.tags.join(", ")}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Life phase / Medical Yi Jing layer</h3>
                        <p className="text-muted-foreground mt-1">This final prompt adds narrative meaning and helps direct the next interpretive layer.</p>
                      </div>
                      <div className="grid gap-3 max-w-2xl">
                        {lifePhaseOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setLifePhase(option.id)}
                            className={`text-left rounded-2xl border p-4 transition-colors ${lifePhase === option.id ? "border-primary bg-primary text-white" : "border-border bg-white hover:bg-muted/50"}`}
                          >
                            <div className={`font-medium ${lifePhase === option.id ? "text-white" : "text-foreground"}`}>{option.label}</div>
                            <div className={`text-sm mt-1 ${lifePhase === option.id ? "text-white/80" : "text-muted-foreground"}`}>{option.hint}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-6">
                      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
                        <Card className="rounded-2xl border-border shadow-none bg-white">
                          <CardHeader>
                            <CardTitle className="text-2xl font-serif text-primary">Patient output report</CardTitle>
                            <CardDescription>Auto-generated results page / downloadable report structure.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`${(elementMeta as any)[primary].color} rounded-full px-3 py-1 font-medium border`}>Primary: {primary}</Badge>
                              <Badge className={`${(elementMeta as any)[secondary].color} rounded-full px-3 py-1 font-medium border`}>Secondary: {secondary}</Badge>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-primary">Likely constitutional theme</h4>
                              <p className="text-foreground mt-1">{(elementMeta as any)[primary].clinical}</p>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-primary">Current pattern impression</h4>
                              <p className="text-foreground mt-1">{pattern}</p>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-primary">What this means in plain language</h4>
                              <p className="text-foreground mt-1 leading-relaxed">
                                Your system appears to rely most heavily on the <span className="font-bold text-primary">{primary}</span> element.
                                When this element is taxed, your body may drift toward {(elementMeta as any)[primary].clinical.toLowerCase()}.
                                Right now, your answers suggest <span className="font-bold text-primary">{pattern}</span>.
                              </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="rounded-2xl bg-[hsl(35,50%,95%)] p-4 border border-[hsl(35,50%,90%)]">
                                <div className="font-bold text-primary">LifeRX care focus</div>
                                <p className="text-sm text-foreground/80 mt-2">{(elementMeta as any)[primary].guidance}</p>
                              </div>
                              <div className="rounded-2xl bg-[hsl(35,50%,95%)] p-4 border border-[hsl(35,50%,90%)]">
                                <div className="font-bold text-primary">Medical Yi Jing note</div>
                                <p className="text-sm text-foreground/80 mt-2">{hexagramHint}</p>
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="font-bold text-primary">Food direction</div>
                                <p className="text-sm text-foreground mt-1">{(elementMeta as any)[primary].foods}</p>
                              </div>
                              <div>
                                <div className="font-bold text-primary">Practice direction</div>
                                <p className="text-sm text-foreground mt-1">{(elementMeta as any)[primary].practices}</p>
                              </div>
                            </div>
                            <Separator />
                            <div>
                              <div className="font-bold text-primary">Recommended CTA block</div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Book a LifeRX consultation to confirm your pattern with pulse, tongue, symptom history, and personalized treatment planning.
                              </p>
                              <div className="flex flex-wrap gap-3 mt-4">
                                <Button className="rounded-full shadow-md">Book Consultation</Button>
                                <Button variant="outline" className="rounded-full">Save to Dashboard</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="rounded-2xl border-border shadow-none bg-white">
                          <CardHeader>
                            <CardTitle className="text-2xl font-serif text-primary">Scoring snapshot</CardTitle>
                            <CardDescription>Display optionally in admin mode only.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {Object.entries(scores).map(([label, value]) => (
                              <ScoreBar key={label} label={label} value={value} />
                            ))}
                            <div className="rounded-2xl bg-[hsl(35,50%,95%)] border border-[hsl(35,50%,90%)] p-4 text-sm text-muted-foreground">
                              Scoring model: constitutional questions = 2 points, symptom/emotion matches = 1 point, life-phase overlay = 1–2 points.
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {step > 0 && (
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-border/50">
                      <Button variant="outline" className="rounded-full" onClick={goBack} disabled={step === 0}>Back</Button>
                      <Button className="rounded-full shadow-md" onClick={goNext}>
                        {step === steps.length - 1 ? "Return to Dashboard" : "Next"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
          
          <div className="text-center text-sm text-muted-foreground mt-8 font-medium">
            {brand.name} · {brand.tagline}
          </div>
        </div>
      </main>
    </div>
  );
}
