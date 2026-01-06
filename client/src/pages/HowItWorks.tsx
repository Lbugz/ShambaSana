import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, FileSearch, TrendingUp, Activity } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Schedule Your Comprehensive Labs",
      description: "Book a visit at a local lab near you. We test over 100 biomarkers including hormones, metabolic markers, nutrients, and heavy metals—far more than a standard annual physical.",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      title: "Complete TCM Intake",
      description: "Answer a detailed questionnaire about your symptoms, digestion, sleep, and stress. Upload photos of your tongue for traditional diagnostic analysis.",
      icon: FileSearch,
      color: "bg-amber-100 text-amber-600"
    },
    {
      id: 3,
      title: "Receive Your Integrative Report",
      description: "Our clinicians and TCM practitioners review your data together. You get a unified dashboard showing where your western labs and eastern patterns align.",
      icon: Activity,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 4,
      title: "Take Action & Monitor",
      description: "Follow your personalized plan including supplements, herbal formulas, and nutrition. Retest every 6 months to track objective progress.",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How LifeRX Works</h1>
          <p className="text-xl text-muted-foreground">
            A seamless journey from confusion to clarity. We've simplified the process of getting deep health insights.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-16 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex flex-col lg:flex-row gap-8 items-center ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                
                {/* Center Marker (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border-4 border-primary items-center justify-center z-10 font-bold text-primary">
                  {step.id}
                </div>

                <div className="flex-1 w-full lg:w-1/2">
                   {/* Placeholder for illustration/image per step */}
                   <div className="aspect-video bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground/50 border border-border/50">
                      Step {step.id} Visualization
                   </div>
                </div>

                <div className="flex-1 w-full lg:w-1/2 p-6 lg:p-12">
                  <div className={`w-12 h-12 rounded-lg ${step.color} flex items-center justify-center mb-6`}>
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center bg-primary/5 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-6">Ready to take control?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of members who have discovered the power of integrative diagnostics.
          </p>
          <Link href="/auth?signup=true">
            <Button size="lg" className="rounded-full px-12 h-14 text-lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
