import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  ClipboardList, 
  TestTube2, 
  Combine, 
  Leaf, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Shield,
  Star,
  Calendar
} from "lucide-react";
import step1Img from "@assets/generated_images/integrated_diagnostics_illustration.png";
import step2Img from "@assets/generated_images/practitioner_reviewing_integrated_health_data.png";
import step3Img from "@assets/generated_images/person_preparing_herbal_tea_holistic_health.png";
import step4Img from "@assets/generated_images/five_elements_cycle_nature_growth.png";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Start With Your Story",
      subtitle: "Pattern Intake",
      description: "Complete a guided intake capturing your symptoms, lifestyle, stress patterns, and constitution. Upload a tongue photo and answer a pulse-quality questionnaire. This surfaces potential TCM patterns—Qi stagnation, Blood deficiency, Dampness—and sets hypotheses about systemic imbalances.",
      details: [
        "15-minute guided questionnaire",
        "Tongue photo analysis",
        "Symptom constellation mapping",
        "Constitutional typing (Five Elements)"
      ],
      icon: ClipboardList,
      color: "bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)]",
      accent: "border-[hsl(35,60%,80%)]",
      image: step1Img,
      testimonial: {
        quote: "The intake asked questions no doctor ever asked me. It finally felt like someone was looking at the whole picture.",
        author: "Jennifer L., Austin TX"
      },
      timeline: "Week 0"
    },
    {
      id: 2,
      title: "Validate With Data",
      subtitle: "Comprehensive Diagnostics",
      description: "Schedule labs at a convenient local partner lab or request a home kit. We test 160+ biomarkers across hormones, nutrients, metabolic health, cardiovascular markers, and toxins—far beyond a standard physical. Labs are physician-ordered and CLIA-certified.",
      details: [
        "160+ biomarkers across 20 body systems",
        "Home kit or local lab options",
        "Physician-ordered, CLIA-certified",
        "Optional add-ons: CGM, MRI/CT, wearables"
      ],
      icon: TestTube2,
      color: "bg-emerald-100 text-emerald-800",
      accent: "border-emerald-200",
      image: step2Img,
      testimonial: {
        quote: "The lab panel was incredibly thorough. Tests my regular doctor never ran revealed the root cause of my fatigue.",
        author: "Marcus T., Portland OR"
      },
      timeline: "Week 1-2"
    },
    {
      id: 3,
      title: "Integrate Patterns & Data",
      subtitle: "Unified Interpretation",
      description: "Once both pattern intake and lab results are in, our dual-trained team—Western clinicians and licensed TCM practitioners—interpret the data together. Labs confirm or refine pattern hypotheses. This synthesis transforms raw numbers into a narrative about how your body is functioning.",
      details: [
        "Dual practitioner review (MD + TCM)",
        "Pattern-lab correlation analysis",
        "Unified dashboard visualization",
        "Video consultation to discuss findings"
      ],
      icon: Combine,
      color: "bg-[hsl(2,35%,90%)] text-[hsl(2,35%,50%)]",
      accent: "border-[hsl(2,35%,80%)]",
      image: step3Img,
      testimonial: {
        quote: "My low ferritin finally made sense when they showed it correlated with Blood Deficiency. The protocol addressed both at once.",
        author: "Sarah K., Brooklyn NY"
      },
      timeline: "Week 2-3"
    },
    {
      id: 4,
      title: "Personalized Protocol",
      subtitle: "Guided Action & Botanical Fulfillment",
      description: "Receive a personalized protocol: dietary recommendations, lifestyle adjustments, movement suggestions, and—for Complete/Concierge members—practitioner-guided herbal formulas tailored to your pattern. Formulas are executed under practitioner oversight, not sold as generic supplements.",
      details: [
        "Customized nutrition & lifestyle plan",
        "Herbal formulas (Complete/Concierge)",
        "Seasonal protocol adjustments",
        "Educational resources for self-care"
      ],
      icon: Leaf,
      color: "bg-[hsl(160,30%,90%)] text-[hsl(160,30%,35%)]",
      accent: "border-[hsl(160,30%,80%)]",
      image: step4Img,
      testimonial: {
        quote: "The Xiao Yao San formula they prescribed wasn't a generic supplement—it was customized to my exact pattern and adjusted as my labs improved.",
        author: "David M., San Francisco CA"
      },
      timeline: "Week 3+"
    },
    {
      id: 5,
      title: "Monitor, Learn & Adapt",
      subtitle: "Longitudinal Care",
      description: "LifeRX is a living system. Retest every 6 months (80+ biomarker mid-year panel, full panel at year-end), receive seasonal check-ins, and watch your patterns shift as protocols take effect. Your dashboard tracks biomarker trends, pattern scores, and protocol adherence.",
      details: [
        "6-month retesting cadence",
        "Pattern re-evaluation each cycle",
        "Proactive alerts for concerning trends",
        "Seasonal health content & adjustments"
      ],
      icon: TrendingUp,
      color: "bg-[hsl(280,15%,90%)] text-[hsl(280,15%,40%)]",
      accent: "border-[hsl(280,15%,80%)]",
      image: null,
      testimonial: {
        quote: "After 6 months, my CRP dropped 40% and my Qi stagnation pattern had completely shifted. The retesting proved the protocol worked.",
        author: "Elena R., Miami FL"
      },
      timeline: "Month 6+"
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6" data-testid="text-page-title">How LifeRX Works</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            A seamless journey from confusion to clarity. Patterns create the hypothesis. Labs remain the anchor. Together, they power preventive, personalized care.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>~30 min to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>HIPAA-compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Results in 1-2 weeks</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-center font-serif text-lg text-primary mb-4">The LifeRX Journey</p>
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-sm font-medium">
            <span className="bg-[hsl(35,60%,90%)] text-[hsl(35,60%,30%)] px-4 py-2 rounded-full">Pattern Intake</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">Lab Validation</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="bg-[hsl(2,35%,90%)] text-[hsl(2,35%,50%)] px-4 py-2 rounded-full">Integration</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="bg-[hsl(160,30%,90%)] text-[hsl(160,30%,35%)] px-4 py-2 rounded-full">Protocol</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="bg-[hsl(280,15%,90%)] text-[hsl(280,15%,40%)] px-4 py-2 rounded-full">Monitoring</span>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-primary/20 -translate-x-1/2" />

          <div className="space-y-24 lg:space-y-32">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex flex-col lg:flex-row gap-12 items-center group animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards`} style={{ animationDelay: `${index * 150}ms` }} data-testid={`step-${step.id}`}>
                 
                 <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:order-last lg:text-left lg:pl-12'}`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{step.timeline}</div>
                    <div className={`inline-flex p-3 rounded-2xl ${step.color} mb-4 shadow-sm border ${step.accent}`}>
                      <step.icon size={28} />
                    </div>
                    <p className="text-sm font-medium text-primary/60 uppercase tracking-wider mb-1">{step.subtitle}</p>
                    <h3 className="text-3xl font-serif text-primary mb-4">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    
                    <ul className={`space-y-2 text-sm text-muted-foreground mb-6 ${index % 2 === 0 ? 'lg:ml-auto lg:text-right' : ''}`}>
                      {step.details.map((detail, i) => (
                        <li key={i} className={`flex items-center gap-2 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                          <span className="text-emerald-600">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    
                    {step.testimonial && (
                      <Card className={`border-none bg-white/50 shadow-sm ${index % 2 === 0 ? 'lg:ml-auto' : ''} max-w-sm`}>
                        <CardContent className="p-4">
                          <div className="flex gap-1 mb-2">
                            {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                          </div>
                          <p className="text-sm italic text-foreground/80 mb-2">"{step.testimonial.quote}"</p>
                          <p className="text-xs text-muted-foreground">— {step.testimonial.author}</p>
                        </CardContent>
                      </Card>
                    )}
                 </div>

                <div className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background border-4 border-white shadow-lg items-center justify-center z-10 font-serif font-bold text-xl text-primary transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white`}>
                  {step.id}
                </div>
                
                <div className="lg:hidden absolute -top-6 left-6 bg-background border border-border px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  Step {step.id}
                </div>

                <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'}`}>
                   {step.image ? (
                     <div className="aspect-[16/9] bg-white rounded-2xl shadow-lg shadow-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden relative group-hover:shadow-xl transition-all duration-500">
                        <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     </div>
                   ) : (
                     <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-emerald-50 rounded-2xl shadow-lg border border-primary/10 flex items-center justify-center p-8">
                       <div className="text-center">
                         <TrendingUp className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                         <p className="font-serif text-xl text-primary">Your Dashboard</p>
                         <p className="text-sm text-muted-foreground mt-2">Track biomarker trends, pattern shifts, and protocol adherence over time</p>
                       </div>
                     </div>
                   )}
                </div>

              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 border border-border text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-serif text-lg text-primary mb-2">Time Commitment</h4>
              <p className="text-sm text-muted-foreground">Two 15-minute virtual touchpoints to start: pattern intake and lab kit review. Then a 30-min results consultation.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-serif text-lg text-primary mb-2">Privacy & Security</h4>
              <p className="text-sm text-muted-foreground">Your health data is stored securely, meets HIPAA/HITECH requirements, and is used only for personalized care.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
              <h4 className="font-serif text-lg text-primary mb-2">Location Flexibility</h4>
              <p className="text-sm text-muted-foreground">Choose from 2,000+ partner lab locations nationwide or request a home collection kit for convenience.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-primary text-primary-foreground rounded-[2rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl max-w-5xl mx-auto">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
             
             <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to discover your patterns?</h2>
                <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
                  Join LifeRX and start with a comprehensive lab panel and full TCM assessment. Your journey from confusion to clarity begins here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth?signup=true">
                    <Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-primary hover:bg-white/90 shadow-xl border-none" data-testid="button-start-journey">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="rounded-full px-12 h-16 text-lg bg-transparent border-white/30 text-white hover:bg-white/10" data-testid="button-view-plans">
                      View Plans & Pricing
                    </Button>
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
