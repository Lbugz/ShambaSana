import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Flame, Mountain, Wind, Waves, Sparkles, ArrowLeft, BrainCircuit, Activity, UploadCloud, Camera, CheckCircle2, Share2, Copy } from "lucide-react";
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
      { id: "metal_3", text: "Dry skin, dry throat, or respiratory sensitivity are familiar to me.", element: "Metal" },
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
  },
  Fire: {
    color: "bg-rose-100 text-rose-800 border-rose-200",
    clinical: "Heart Shen disturbance / heat or overstimulation",
  },
  Earth: {
    color: "bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)] border-[hsl(35,60%,80%)]",
    clinical: "Spleen Qi deficiency / damp accumulation",
  },
  Metal: {
    color: "bg-slate-100 text-slate-800 border-slate-200",
    clinical: "Lung Qi deficiency / dryness or unresolved grief",
  },
  Water: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    clinical: "Kidney deficiency / depleted reserves",
  },
};

const steps = [
  "Welcome",
  "Patient Profile",
  "Current Health",
  "Constitution",
  "Tongue Exam",
  "Symptoms Map",
  "Lifestyle & Harmony",
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

export default function TcmAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [lifePhase, setLifePhase] = useState("phase_depleted");
  const [sliders, setSliders] = useState({ pain: 0, energy: 5, sleep: 5, stress: 5 });
  // Expanded vitals to include identity for public link cases
  const [vitals, setVitals] = useState({ name: "", email: "", phone: "", age: "", gender: "", bp: "", hr: "", weight: "", height: "" });
  const [lifestyle, setLifestyle] = useState({ diet: "", movement: "", balance: "" });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Determine if this is a public link mode by checking URL params (mock implementation)
  const isPublicLink = new URLSearchParams(window.location.search).get('public') === 'true';
  const isMobile = window.innerWidth <= 768; // Simple check for responsive text

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

  function toggle(id: string) {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSliderChange(key: keyof typeof sliders, val: number[]) {
    setSliders(prev => ({ ...prev, [key]: val[0] }));
  }

  function handleShareLink() {
    // Generate a mock public link
    const shareLink = `${window.location.origin}/#/tcm-assessment?public=true`;
    
    if (navigator.share && isMobile) {
      navigator.share({
        title: 'LifeRX Assessment',
        text: 'Please complete your clinical intake assessment before your next visit.',
        url: shareLink,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link Copied",
        description: "Public assessment link copied to clipboard. Ready to paste in SMS/Email.",
      });
    }
  }

  function goNext() {
    if (step === steps.length - 1) {
      const newAssessment = {
        id: Date.now(),
        patient: vitals.name || "Guest Patient",
        date: "Just now",
        type: "Constitutional Intake",
        status: "Pending Review",
        primary: primary,
        secondary: secondary,
        pattern: pattern
      };
      const existing = JSON.parse(localStorage.getItem('mockAssessments') || '[]');
      localStorage.setItem('mockAssessments', JSON.stringify([newAssessment, ...existing]));

      toast({
        title: "Assessment Submitted",
        description: "Your profile is securely saved.",
      });
      setLocation(isPublicLink ? "/" : "/dashboard");
      return;
    }
    
    // Validation for public mode - require Name and Email
    if (step === 1 && isPublicLink && (!vitals.name || !vitals.email)) {
      toast({
        title: "Information Required",
        description: "Please provide your Full Name and Email so we can match this assessment to your record.",
        variant: "destructive"
      });
      return;
    }

    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`min-h-screen ${brand.colors.bg} font-sans flex flex-col`}>
      {/* Header - Simplified for public mode */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-xl">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            {brand.name}
          </div>
          {!isPublicLink && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex rounded-full text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 shadow-sm" onClick={handleShareLink}>
                <Share2 className="w-4 h-4 mr-2" /> Share Assessment Link
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setLocation("/dashboard")}>
                Save & Exit
              </Button>
            </div>
          )}
        </div>
        <Progress value={percent} className="h-1 rounded-none bg-primary/10" indicatorClassName="bg-primary transition-all duration-500" />
      </header>

      {/* Mobile Sticky Share Button for Practitioners (only shown on step 0 if not public) */}
      {!isPublicLink && step === 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 sm:hidden">
           <Button className="w-full rounded-full py-6 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base" onClick={handleShareLink}>
             <Share2 className="w-5 h-5 mr-2" /> Send via SMS / WhatsApp
           </Button>
        </div>
      )}

      <main className="flex-1 p-4 md:p-10 pb-28">
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
              {step !== 7 && (
              <Card className={`${brand.colors.card} border-border rounded-[2rem] shadow-sm overflow-hidden`}>
                <CardHeader className="space-y-4 p-6 md:p-10 bg-white border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold mb-2">Pulse Meridian Intake</div>
                      <CardTitle className="text-3xl md:text-4xl font-serif text-primary">
                        {steps[step]}
                      </CardTitle>
                      {step === 0 && (
                        <CardDescription className="mt-3 text-base text-foreground/80 max-w-2xl font-sans">
                          {isPublicLink 
                            ? "Please complete this comprehensive clinical assessment prior to your visit. Your data is securely transmitted directly to your practitioner."
                            : "Comprehensive clinical assessment collecting baseline vitals, patient-reported symptoms, and TCM diagnostic indicators."}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                      <span>Step {step + 1} of {steps.length}</span>
                      <span className="hidden sm:inline">{steps[step]}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 md:p-10 bg-white/50">
                  {step === 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="rounded-2xl border-border shadow-none bg-white">
                        <CardHeader>
                          <CardTitle className="text-xl font-serif text-primary">Welcome</CardTitle>
                          <CardDescription>Patient instruction guide</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <h2 className="text-2xl font-serif font-bold text-primary leading-tight">
                            Understanding your complete clinical picture.
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            This guided form maps your objective vitals, current comfort levels, and subjective TCM diagnostic patterns (including a tongue photo) into a unified clinical record.
                          </p>
                          <div className="grid gap-3 text-xs md:text-sm text-foreground/80 grid-cols-2">
                            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-600" /> Vitals
                            </div>
                            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-emerald-600" /> Constitution
                            </div>
                            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4 text-emerald-600" /> Emotions
                            </div>
                            <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 flex items-center gap-2">
                              <Camera className="w-4 h-4 text-emerald-600" /> Tongue Exam
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-border shadow-none bg-white flex flex-col justify-center items-center p-8 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                           <Activity className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-primary mb-2">Ready to begin?</h3>
                        <p className="text-sm text-muted-foreground mb-8">This takes approximately 5-7 minutes to complete.</p>
                        <Button className="w-full rounded-full py-6 text-lg shadow-md" onClick={goNext}>
                          Start Assessment <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                        </Button>

                        {!isPublicLink && (
                          <div className="mt-6 pt-6 border-t border-border w-full hidden sm:block">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-3">Admin Actions</p>
                            <Button variant="outline" className="w-full rounded-full border-dashed border-primary/30 text-primary hover:bg-primary/5" onClick={handleShareLink}>
                              <Copy className="w-4 h-4 mr-2" /> Copy Link to Send to Patient
                            </Button>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-8 max-w-2xl">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Identity & Vitals</h3>
                        <p className="text-muted-foreground mt-1">Capture basic profile details and objective clinical measurements.</p>
                      </div>

                      {/* Identity Fields - Important for public links */}
                      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Patient Identity</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label>Full Name {isPublicLink && <span className="text-rose-500">*</span>}</Label>
                             <Input placeholder="First and Last Name" value={vitals.name} onChange={(e) => setVitals({...vitals, name: e.target.value})} className="bg-white rounded-xl h-12" />
                           </div>
                           <div className="space-y-2">
                             <Label>Email Address {isPublicLink && <span className="text-rose-500">*</span>}</Label>
                             <Input type="email" placeholder="For report delivery" value={vitals.email} onChange={(e) => setVitals({...vitals, email: e.target.value})} className="bg-white rounded-xl h-12" />
                           </div>
                           <div className="space-y-2 md:col-span-2">
                             <Label>Phone Number</Label>
                             <Input type="tel" placeholder="For appointment reminders (optional)" value={vitals.phone} onChange={(e) => setVitals({...vitals, phone: e.target.value})} className="bg-white rounded-xl h-12" />
                           </div>
                        </div>
                      </div>

                      <Separator className="bg-border/50" />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Age</Label>
                          <Input type="number" placeholder="e.g. 42" value={vitals.age} onChange={(e) => setVitals({...vitals, age: e.target.value})} className="bg-white rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Gender Identity</Label>
                          <Select value={vitals.gender} onValueChange={(val) => setVitals({...vitals, gender: val})}>
                            <SelectTrigger className="bg-white rounded-xl h-12">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="nonbinary">Non-binary</SelectItem>
                              <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Blood Pressure (if known)</Label>
                          <Input placeholder="e.g. 120/80" value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} className="bg-white rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Heart Rate (BPM)</Label>
                          <Input type="number" placeholder="e.g. 72" value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} className="bg-white rounded-xl h-12" />
                        </div>

                        <div className="space-y-2">
                          <Label>Height</Label>
                          <Input placeholder="e.g. 5'9&quot;" value={vitals.height} onChange={(e) => setVitals({...vitals, height: e.target.value})} className="bg-white rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Weight (lbs)</Label>
                          <Input type="number" placeholder="e.g. 165" value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} className="bg-white rounded-xl h-12" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Current Medications & Supplements</Label>
                        <Textarea placeholder="List all medications, herbs, and supplements currently taken..." className="bg-white rounded-xl min-h-[100px] resize-none" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Known Allergies & Sensitivities</Label>
                        <Textarea placeholder="Food, medication, and environmental allergies..." className="bg-white rounded-xl min-h-[80px] resize-none" />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 max-w-3xl">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">How are you feeling today?</h3>
                        <p className="text-muted-foreground mt-1">Capture your immediate health state, symptoms, and subjective wellbeing indicators.</p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-bold">Current Health Concerns</Label>
                        <Textarea placeholder="Describe your main symptoms, discomforts, or health challenges today in your own words..." className="bg-white rounded-xl min-h-[120px] resize-none text-base p-4" />
                      </div>

                      <Separator className="my-8 bg-border/50" />

                      <div className="space-y-10">
                        {/* Mobile optimized sliders - stacked label structure */}
                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-bold">Physical Comfort Level</Label>
                            <span className="text-xl font-serif text-primary font-bold">{sliders.pain}/10</span>
                          </div>
                          <Slider value={[sliders.pain]} max={10} step={1} onValueChange={(val) => handleSliderChange('pain', val)} className="py-2" />
                          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-1">
                            <span>0 - No Pain</span>
                            <span>10 - Severe</span>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-bold">Energy Level</Label>
                            <span className="text-xl font-serif text-primary font-bold">{sliders.energy}/10</span>
                          </div>
                          <Slider value={[sliders.energy]} max={10} step={1} onValueChange={(val) => handleSliderChange('energy', val)} className="py-2" />
                          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-1">
                            <span>0 - Depleted</span>
                            <span>10 - High Energy</span>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-bold">Sleep Quality</Label>
                            <span className="text-xl font-serif text-primary font-bold">{sliders.sleep}/10</span>
                          </div>
                          <Slider value={[sliders.sleep]} max={10} step={1} onValueChange={(val) => handleSliderChange('sleep', val)} className="py-2" />
                          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-1">
                            <span>0 - Restless</span>
                            <span>10 - Deeply Restorative</span>
                          </div>
                        </div>

                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-base font-bold">Stress Level & Mental Load</Label>
                            <span className="text-xl font-serif text-primary font-bold">{sliders.stress}/10</span>
                          </div>
                          <Slider value={[sliders.stress]} max={10} step={1} onValueChange={(val) => handleSliderChange('stress', val)} className="py-2" />
                          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-1">
                            <span>0 - Calm</span>
                            <span>10 - Overwhelmed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Lifelong Tendencies</h3>
                        <p className="text-base text-muted-foreground mt-1">Select the statements that deeply resonate with your lifelong patterns, not just how you feel today.</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {constitutionQuestions.map((group) => {
                          const Icon = group.icon;
                          return (
                            <Card key={group.id} className="rounded-2xl border-border shadow-none bg-white">
                              <CardHeader className="space-y-2 p-5 border-b border-border/50">
                                <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${group.color}`}>
                                  <Icon className="h-4 w-4" /> {group.title}
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2 p-5">
                                {group.items.map((item) => (
                                  <label key={item.id} className="flex items-start gap-3 rounded-xl border border-transparent p-2 cursor-pointer hover:bg-muted/50 transition-colors -mx-2">
                                    <Checkbox className="mt-1 shrink-0" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                                    <span className="text-sm text-foreground leading-snug">{item.text}</span>
                                  </label>
                                ))}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-8 max-w-3xl">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Tongue Examination</h3>
                        <p className="text-muted-foreground mt-1">A core diagnostic tool of Traditional Chinese Medicine.</p>
                      </div>

                      <div className="rounded-2xl bg-white border border-border p-6 space-y-6 shadow-sm">
                        <p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                          Your practitioner needs a clear photo of your tongue to complete your diagnosis. 
                          <br /><br /><strong>Instructions:</strong> Find good lighting (natural daylight is best). Stick your tongue out naturally without straining or pointing it, and hold still for the photo.
                        </p>

                        {/* Photo Upload Zone - Mobile Optimized */}
                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div className="border-2 border-primary/20 bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors group relative overflow-hidden shadow-sm">
                             {/* capture="user" explicitly asks for the front-facing camera on mobile */}
                             <input type="file" accept="image/*" capture="user" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                               <Camera className="w-8 h-8" />
                             </div>
                             <h5 className="font-bold text-primary text-lg mb-1">Take a Photo</h5>
                             <p className="text-sm text-muted-foreground font-medium">Use your phone's camera right now.</p>
                          </div>

                          <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden">
                             <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                               <UploadCloud className="w-8 h-8" />
                             </div>
                             <h5 className="font-bold text-slate-700 text-lg mb-1">Upload File</h5>
                             <p className="text-sm text-muted-foreground font-medium">Choose from your photo library.</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-4 w-full flex justify-center">
                          <span className="text-xs text-muted-foreground font-semibold">
                            Secure upload • JPEG, PNG, HEIC up to 10MB
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-8 max-w-4xl">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Symptom & Emotion Map</h3>
                        <p className="text-muted-foreground mt-1">Refining physical and spiritual imbalance patterns. Select all that currently apply.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-sm uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 w-fit px-3 py-1 rounded-full">Physical Symptoms</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {symptomQuestions.map((item) => (
                            <label key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${answers[item.id] ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:bg-muted/50'}`}>
                              <Checkbox className="mt-0.5 shrink-0" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                              <div className="text-sm font-medium text-foreground">{item.text}</div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-border/50" />

                      <div className="space-y-4">
                        <h4 className="text-sm uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 w-fit px-3 py-1 rounded-full">Emotional Patterns</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          {emotionQuestions.map((item) => (
                            <label key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${answers[item.id] ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-white hover:bg-muted/50'}`}>
                              <Checkbox className="mt-0.5 shrink-0" checked={!!answers[item.id]} onCheckedChange={() => toggle(item.id)} />
                              <div className="text-sm font-medium text-foreground">{item.text}</div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-8 max-w-3xl">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-primary">Lifestyle & Harmony</h3>
                        <p className="text-muted-foreground mt-1">Understand daily habits and life transitions that affect the flow of Qi.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <Label className="text-base font-bold">Diet / Nourishment Patterns</Label>
                          <Textarea 
                            placeholder="Describe typical eating patterns, food preferences, cravings, or dietary approaches..." 
                            value={lifestyle.diet} onChange={(e) => setLifestyle({...lifestyle, diet: e.target.value})}
                            className="bg-slate-50 border-transparent rounded-xl min-h-[100px] resize-none focus-visible:bg-white" 
                          />
                        </div>

                        <div className="space-y-3 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <Label className="text-base font-bold">Movement Practices</Label>
                          <Textarea 
                            placeholder="Describe exercise routine, movement activities, and frequency..." 
                            value={lifestyle.movement} onChange={(e) => setLifestyle({...lifestyle, movement: e.target.value})}
                            className="bg-slate-50 border-transparent rounded-xl min-h-[100px] resize-none focus-visible:bg-white" 
                          />
                        </div>

                        <div className="space-y-3 bg-white p-5 rounded-2xl border border-border shadow-sm">
                          <Label className="text-base font-bold">Life Balance & Stress Management</Label>
                          <Textarea 
                            placeholder="Work-life balance, relaxation techniques, spiritual practices..." 
                            value={lifestyle.balance} onChange={(e) => setLifestyle({...lifestyle, balance: e.target.value})}
                            className="bg-slate-50 border-transparent rounded-xl min-h-[100px] resize-none focus-visible:bg-white" 
                          />
                        </div>
                      </div>

                      <Separator className="bg-border/50 my-4" />

                      <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
                        <h4 className="text-base font-bold mb-4">Current Life Phase</h4>
                        <div className="grid gap-3">
                          {lifePhaseOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => setLifePhase(option.id)}
                              className={`text-left rounded-xl border p-4 transition-all ${lifePhase === option.id ? "border-primary bg-primary text-white shadow-md" : "border-border bg-slate-50 hover:bg-slate-100"}`}
                            >
                              <div className={`font-medium ${lifePhase === option.id ? "text-white" : "text-foreground"}`}>{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step < 7 && step > 0 && (
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-border/50">
                      <Button variant="outline" className="rounded-full px-6" onClick={goBack} disabled={step === 0}>Back</Button>
                      <Button className="rounded-full shadow-md px-8" onClick={goNext}>
                        {step === steps.length - 2 ? "Complete Intake" : "Next Step"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}
              
              {/* Patient Facing Results Screen */}
              {step === 7 && (
                <div className="space-y-6 max-w-xl mx-auto text-center pt-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-4 tracking-tight">Intake Submitted</h3>
                  <p className="text-lg text-muted-foreground mb-10 leading-relaxed px-4">
                    Thank you. Your responses and tongue photograph have been securely transmitted to your LifeRX practitioner.
                  </p>
                  
                  <Card className="rounded-[2rem] border-border shadow-md bg-white text-left overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 pb-6 pt-8 px-6 sm:px-8">
                      <CardTitle className="text-xl font-serif text-primary">What happens next?</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">1</div>
                          <p className="text-foreground text-sm sm:text-base leading-relaxed">Your practitioner will review your clinical vitals, subjective symptoms, and tongue photo.</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">2</div>
                          <p className="text-foreground text-sm sm:text-base leading-relaxed">A final comprehensive TCM diagnosis will be established and added to your chart.</p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">3</div>
                          <p className="text-foreground text-sm sm:text-base leading-relaxed">Your personalized treatment protocol and herbal formula recommendations will be unlocked on your dashboard.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="pt-8 px-4">
                    <Button className="rounded-full shadow-lg text-base sm:text-lg px-8 py-6 w-full sm:w-auto" onClick={goNext}>
                      {isPublicLink ? "Close & Return Home" : "Return to Dashboard"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="text-center text-xs sm:text-sm text-muted-foreground mt-12 pb-8 font-medium opacity-60">
            {brand.name} · {brand.tagline}
          </div>
        </div>
      </main>
    </div>
  );
}
