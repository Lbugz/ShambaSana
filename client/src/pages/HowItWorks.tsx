import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, FileSearch, TrendingUp, Activity, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Schedule Comprehensive Labs",
      description: "Book a visit at a local lab near you. We test over 100 biomarkers including hormones, metabolic markers, nutrients, and heavy metals—far more than a standard annual physical.",
      icon: Calendar,
      color: "bg-emerald-100 text-emerald-800",
      accent: "border-emerald-200"
    },
    {
      id: 2,
      title: "Complete TCM Intake",
      description: "Answer a detailed questionnaire about your symptoms, digestion, sleep, and stress. Upload photos of your tongue for traditional diagnostic analysis.",
      icon: FileSearch,
      color: "bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)]",
      accent: "border-[hsl(35,60%,80%)]"
    },
    {
      id: 3,
      title: "Receive Integrative Report",
      description: "Our clinicians and TCM practitioners review your data together. You get a unified dashboard showing where your western labs and eastern patterns align.",
      icon: Activity,
      color: "bg-[hsl(2,35%,90%)] text-[hsl(2,35%,50%)]",
      accent: "border-[hsl(2,35%,80%)]"
    },
    {
      id: 4,
      title: "Take Action & Monitor",
      description: "Follow your personalized plan including supplements, herbal formulas, and nutrition. Retest every 6 months to track objective progress.",
      icon: TrendingUp,
      color: "bg-[hsl(280,15%,90%)] text-[hsl(280,15%,40%)]",
      accent: "border-[hsl(280,15%,80%)]"
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6">How LifeRX Works</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            A seamless journey from confusion to clarity. We've simplified the process of getting deep health insights by merging two powerful systems of medicine.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-1/2" />

          <div className="space-y-24 lg:space-y-0">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex flex-col lg:flex-row gap-12 items-center group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards`} style={{ animationDelay: `${index * 150}ms` }}>
                 
                 {/* Layout Logic for Alternating Sides */}
                 <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:order-last lg:text-left lg:pl-12'}`}>
                    <div className={`inline-flex p-3 rounded-2xl ${step.color} mb-6 shadow-sm border ${step.accent}`}>
                      <step.icon size={28} />
                    </div>
                    <h3 className="text-3xl font-serif text-primary mb-4">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                 </div>

                {/* Center Marker (Desktop) */}
                <div className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background border-4 border-white shadow-lg items-center justify-center z-10 font-serif font-bold text-xl text-primary transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white ${index % 2 === 0 ? '' : ''}`}>
                  {step.id}
                </div>
                
                {/* Mobile Marker */}
                <div className="lg:hidden absolute -top-6 left-6 bg-background border border-border px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  Step {step.id}
                </div>

                <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'}`}>
                   {/* Card / Image Placeholder */}
                   <div className="aspect-[16/9] bg-white rounded-2xl shadow-lg shadow-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden relative group-hover:shadow-xl transition-all duration-500">
                      <div className="absolute inset-0 bg-secondary/30 opacity-50" />
                      <p className="text-primary/20 font-serif text-4xl font-bold relative z-10">0{step.id}</p>
                   </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 text-center">
          <div className="bg-primary text-primary-foreground rounded-[2rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
             
             <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to take control?</h2>
                <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
                  Join hundreds of members who have discovered the power of integrative diagnostics.
                </p>
                <Link href="/auth?signup=true">
                  <Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-primary hover:bg-white/90 shadow-xl border-none">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
