import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, BrainCircuit, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const questions = [
  {
    id: "energy",
    title: "Energy & Vitality",
    description: "How would you describe your overall energy levels recently?",
    options: [
      { value: "high", label: "Consistently high and stable" },
      { value: "fluctuating", label: "Up and down throughout the day" },
      { value: "low_morning", label: "Hard to wake up, gets better later" },
      { value: "low_afternoon", label: "Afternoon crashes are common" },
      { value: "exhausted", label: "Constantly exhausted or fatigued" },
    ]
  },
  {
    id: "sleep",
    title: "Sleep Quality",
    description: "What best describes your typical night's sleep?",
    options: [
      { value: "deep", label: "Deep, uninterrupted sleep" },
      { value: "trouble_falling", label: "Trouble falling asleep (racing mind)" },
      { value: "waking_up", label: "Waking up often during the night" },
      { value: "vivid_dreams", label: "Restless with vivid or stressful dreams" },
      { value: "unrefreshing", label: "Sleep full hours but wake up unrefreshed" },
    ]
  },
  {
    id: "temperature",
    title: "Temperature Preferences",
    description: "How does your body naturally run in terms of temperature?",
    options: [
      { value: "balanced", label: "Generally comfortable" },
      { value: "cold_hands", label: "Cold hands and feet, easily chilled" },
      { value: "hot", label: "Tend to run hot, sweat easily" },
      { value: "night_sweats", label: "Night sweats or hot flashes" },
      { value: "alternating", label: "Alternating chills and feverish feelings" },
    ]
  },
  {
    id: "digestion",
    title: "Digestion & Appetite",
    description: "How is your digestive system functioning?",
    options: [
      { value: "normal", label: "Regular, comfortable digestion" },
      { value: "bloating", label: "Frequent bloating or gas after meals" },
      { value: "poor_appetite", label: "Poor appetite or get full quickly" },
      { value: "cravings", label: "Intense cravings (especially sweets or carbs)" },
      { value: "acid", label: "Acid reflux or burning sensation" },
    ]
  },
  {
    id: "stress",
    title: "Emotions & Stress",
    description: "Where do you tend to hold stress emotionally?",
    options: [
      { value: "balanced", label: "Generally calm and adaptable" },
      { value: "frustration", label: "Irritability, frustration, or anger" },
      { value: "worry", label: "Overthinking, worry, or rumination" },
      { value: "anxiety", label: "Anxiety, palpitations, or restlessness" },
      { value: "sadness", label: "Sadness, melancholy, or lack of motivation" },
    ]
  }
];

export default function TcmAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitAssessment();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[step].id]: value });
  };

  const submitAssessment = () => {
    setIsSubmitting(true);
    // Mock processing time
    setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
      toast({
        title: "Assessment Complete",
        description: "Your TCM patterns have been analyzed.",
      });
      
      // Redirect after showing completion screen briefly
      setTimeout(() => {
        setLocation("/dashboard");
      }, 3000);
    }, 2000);
  };

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const isAnswered = !!answers[currentQuestion?.id];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[hsl(38,35%,94%)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-serif text-primary font-bold">Assessment Complete</h1>
          <p className="text-muted-foreground text-lg">
            We've analyzed your responses and updated your TCM Pattern Profile.
            Integrating with your latest biomarker data...
          </p>
          <div className="flex justify-center pt-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground font-medium pt-4">Redirecting to Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(38,35%,94%)] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-xl">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            LifeRX
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Save & Exit
            </Button>
          </Link>
        </div>
        <Progress value={progress} className="h-1 rounded-none bg-primary/10" indicatorClassName="bg-primary transition-all duration-500" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-8 md:p-10 pb-6">
                  <div className="text-sm font-bold tracking-widest uppercase text-emerald-700 mb-4">
                    Question {step + 1} of {questions.length}
                  </div>
                  <CardTitle className="text-3xl md:text-4xl font-serif text-primary">
                    {currentQuestion.title}
                  </CardTitle>
                  <CardDescription className="text-lg md:text-xl text-foreground/80 mt-2">
                    {currentQuestion.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8 md:p-10 pt-0">
                  <RadioGroup 
                    value={answers[currentQuestion.id] || ""} 
                    onValueChange={handleAnswer}
                    className="space-y-4"
                  >
                    {currentQuestion.options.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem 
                          value={option.value} 
                          id={`${currentQuestion.id}-${option.value}`} 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor={`${currentQuestion.id}-${option.value}`}
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-200"
                        >
                          <span className="w-full text-base font-medium">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>

                <CardFooter className="p-8 md:p-10 pt-4 bg-primary/5 flex items-center justify-between border-t border-primary/10">
                  <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    disabled={step === 0 || isSubmitting}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  
                  <Button 
                    onClick={handleNext} 
                    disabled={!isAnswered || isSubmitting}
                    className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 shadow-md"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Analyzing...
                      </span>
                    ) : step === questions.length - 1 ? (
                      "Complete Assessment"
                    ) : (
                      <>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
