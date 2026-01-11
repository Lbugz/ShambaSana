import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  TestTube2, 
  Combine, 
  Leaf, 
  RefreshCw, 
  ArrowRight,
  Clock,
  Shield,
  Star,
  Calendar,
  ChevronRight
} from "lucide-react";
import step1Img from "@assets/generated_images/tongue_photo_pattern_intake.png";
import step2Img from "@assets/generated_images/lab_vials_with_botanicals.png";
import step3Img from "@assets/generated_images/data_meets_tcm_integration.png";
import step4Img from "@assets/generated_images/herbal_preparation_ritual.png";
import step5Img from "@assets/generated_images/seasonal_health_monitoring_cycle.png";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const stepElements = document.querySelectorAll('[data-step-id]');
      stepElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const stepId = parseInt(el.getAttribute('data-step-id') || '1');
        if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 3) {
          setActiveStep(stepId);
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Discover Your Pattern",
      subtitle: "Pattern Intake",
      description: "Complete a guided intake capturing your symptoms, lifestyle, stress patterns, and constitution. Upload a tongue photo and answer a pulse-quality questionnaire to surface potential TCM patterns.",
      details: [
        "15-minute guided questionnaire",
        "Tongue photo analysis",
        "Symptom constellation mapping",
        "Constitutional typing (Five Elements)"
      ],
      icon: MessageCircle,
      iconLabel: "tongue",
      color: "from-amber-100 to-amber-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100 text-amber-700",
      image: step1Img,
      link: "/auth?signup=true",
      linkText: "Discover My Pattern",
      testimonial: {
        quote: "The intake asked questions no doctor ever asked me. It finally felt like someone was looking at the whole picture.",
        author: "Jennifer L., Austin TX"
      },
      timeline: "Week 0"
    },
    {
      id: 2,
      title: "Test & Validate",
      subtitle: "Comprehensive Diagnostics",
      description: "Schedule labs at a convenient local partner lab or request a home kit. We test 160+ biomarkers across hormones, nutrients, metabolic health, cardiovascular markers, and toxins.",
      details: [
        "160+ biomarkers across 20 body systems",
        "Home kit or local lab options",
        "Physician-ordered, CLIA-certified",
        "Optional add-ons: CGM, wearables"
      ],
      icon: TestTube2,
      iconLabel: "test tubes",
      color: "from-emerald-100 to-emerald-50",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      image: step2Img,
      link: "/what-we-test",
      linkText: "What We Test",
      testimonial: {
        quote: "The lab panel was incredibly thorough. Tests my regular doctor never ran revealed the root cause of my fatigue.",
        author: "Marcus T., Portland OR"
      },
      timeline: "Week 1-2"
    },
    {
      id: 3,
      title: "Integrate & Interpret",
      subtitle: "Unified Analysis",
      description: "Our dual-trained team—Western clinicians and licensed TCM practitioners—interpret the data together. Labs confirm or refine pattern hypotheses, transforming raw numbers into a narrative.",
      details: [
        "Dual practitioner review (MD + TCM)",
        "Pattern-lab correlation analysis",
        "Unified dashboard visualization",
        "Video consultation to discuss findings"
      ],
      icon: Combine,
      iconLabel: "yin-yang",
      color: "from-rose-100 to-rose-50",
      borderColor: "border-rose-200",
      iconBg: "bg-rose-100 text-rose-600",
      image: step3Img,
      link: "/how-it-works#integration",
      linkText: "Learn More",
      testimonial: {
        quote: "My low ferritin finally made sense when they showed it correlated with Blood Deficiency. The protocol addressed both at once.",
        author: "Sarah K., Brooklyn NY"
      },
      timeline: "Week 2-3"
    },
    {
      id: 4,
      title: "Personalised Protocol",
      subtitle: "Botanical Fulfillment",
      description: "Receive a personalized protocol: dietary recommendations, lifestyle adjustments, movement suggestions, and—for Complete/Concierge members—practitioner-guided herbal formulas tailored to your pattern.",
      details: [
        "Customized nutrition & lifestyle plan",
        "Herbal formulas (Complete/Concierge)",
        "Seasonal protocol adjustments",
        "Educational resources for self-care"
      ],
      icon: Leaf,
      iconLabel: "leaf",
      color: "from-teal-100 to-teal-50",
      borderColor: "border-teal-200",
      iconBg: "bg-teal-100 text-teal-700",
      image: step4Img,
      link: "/formula-library",
      linkText: "Explore Formula Library",
      testimonial: {
        quote: "The formula they prescribed wasn't a generic supplement—it was customized to my exact pattern and adjusted as my labs improved.",
        author: "David M., San Francisco CA"
      },
      timeline: "Week 3+"
    },
    {
      id: 5,
      title: "Monitor & Renew",
      subtitle: "Longitudinal Care",
      description: "LifeRX is a living system. Retest every 6 months, receive seasonal check-ins, and watch your patterns shift as protocols take effect. Your dashboard tracks biomarker trends and pattern scores.",
      details: [
        "6-month retesting cadence",
        "Pattern re-evaluation each cycle",
        "Proactive alerts for concerning trends",
        "Seasonal health content & adjustments"
      ],
      icon: RefreshCw,
      iconLabel: "calendar",
      color: "from-violet-100 to-violet-50",
      borderColor: "border-violet-200",
      iconBg: "bg-violet-100 text-violet-700",
      image: step5Img,
      link: "/dashboard",
      linkText: "Preview Dashboard",
      testimonial: {
        quote: "After 6 months, my CRP dropped 40% and my Qi stagnation pattern had completely shifted. The retesting proved the protocol worked.",
        author: "Elena R., Miami FL"
      },
      timeline: "Month 6+"
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-3">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => {
              document.querySelector(`[data-step-id="${step.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`group flex items-center gap-3 transition-all duration-300 ${activeStep === step.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            data-testid={`nav-step-${step.id}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${activeStep === step.id ? step.iconBg + ' scale-110' : 'bg-white/80'}`}>
              <step.icon size={18} />
            </div>
            <span className={`text-sm font-medium transition-all duration-300 ${activeStep === step.id ? 'opacity-100 translate-x-0 text-primary' : 'opacity-0 -translate-x-2'}`}>
              {step.title}
            </span>
          </button>
        ))}
      </div>

      <div className="pt-20 pb-12 lg:pt-28">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6" data-testid="text-page-title">
              The LifeRX Journey
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From confusion to clarity. Patterns create the hypothesis. Labs remain the anchor. Together, they power preventive, personalized care.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-border/50">
                <Clock className="h-4 w-4 text-primary" />
                <span>~30 min to get started</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-border/50">
                <Shield className="h-4 w-4 text-primary" />
                <span>HIPAA-compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-border/50">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Results in 1-2 weeks</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="max-w-5xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative bg-gradient-to-r from-primary/5 via-emerald-50/50 to-primary/5 rounded-3xl p-8 border border-primary/10 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(14,70,52,0.03),transparent_50%)]" />
              <div className="relative flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-0">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div 
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 ${step.iconBg} shadow-sm`}
                      onClick={() => {
                        document.querySelector(`[data-step-id="${step.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      <step.icon size={16} />
                      <span className="text-sm font-medium whitespace-nowrap">{step.subtitle}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 mx-2 hidden lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div 
        className="relative max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2" />

        <div className="space-y-20 lg:space-y-32">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              data-step-id={step.id}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              data-testid={`step-${step.id}`}
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}>
                
                <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-8' : 'lg:text-left lg:pl-8'}`}>
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">{step.timeline}</span>
                  </div>
                  
                  <div className={`inline-flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className={`p-3 rounded-2xl ${step.iconBg} shadow-sm`}>
                      <step.icon size={24} />
                    </div>
                  </div>
                  
                  <p className="text-sm font-semibold text-primary/60 uppercase tracking-wider mb-2">{step.subtitle}</p>
                  <h3 className="text-3xl lg:text-4xl font-serif text-primary mb-4">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <ul className={`space-y-2.5 text-sm text-muted-foreground mb-6 ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    {step.details.map((detail, i) => (
                      <li key={i} className={`flex items-center gap-2.5 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 text-xs">✓</span>
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={step.link}>
                    <Button 
                      variant="ghost" 
                      className="group text-primary hover:text-primary hover:bg-primary/5 font-medium"
                      data-testid={`link-step-${step.id}`}
                    >
                      {step.linkText}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  
                  {step.testimonial && (
                    <Card className={`mt-6 border-none bg-white/70 shadow-sm backdrop-blur-sm ${index % 2 === 0 ? 'lg:ml-auto' : ''} max-w-sm`}>
                      <CardContent className="p-4">
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                        </div>
                        <p className="text-sm italic text-foreground/80 mb-2">"{step.testimonial.quote}"</p>
                        <p className="text-xs text-muted-foreground">— {step.testimonial.author}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className={`w-14 h-14 rounded-full bg-white shadow-lg border-4 ${step.borderColor} flex items-center justify-center font-serif font-bold text-xl text-primary transition-all duration-500 hover:scale-110`}>
                    {step.id}
                  </div>
                </div>
                
                <div className="lg:hidden absolute -top-4 left-4 bg-white border border-border px-3 py-1 rounded-full text-sm font-bold shadow-sm z-10">
                  Step {step.id}
                </div>

                <div className={`flex-1 w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                  <div className={`relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border ${step.borderColor} group cursor-pointer`}>
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-10 group-hover:opacity-5 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                        <p className="text-sm font-medium text-primary">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <motion.div 
                className="bg-white rounded-2xl p-6 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-serif text-lg text-primary mb-2">Time Commitment</h4>
                <p className="text-sm text-muted-foreground">Two 15-minute virtual touchpoints to start: pattern intake and lab kit review. Then a 30-min results consultation.</p>
              </motion.div>
              <motion.div 
                className="bg-white rounded-2xl p-6 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-serif text-lg text-primary mb-2">Privacy & Security</h4>
                <p className="text-sm text-muted-foreground">Your health data is stored securely, meets HIPAA/HITECH requirements, and is used only for personalized care.</p>
              </motion.div>
              <motion.div 
                className="bg-white rounded-2xl p-6 border border-border text-center shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                <h4 className="font-serif text-lg text-primary mb-2">Location Flexibility</h4>
                <p className="text-sm text-muted-foreground">Choose from 2,000+ partner lab locations nationwide or request a home collection kit for convenience.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-6">
          <motion.div 
            className="bg-primary text-primary-foreground rounded-[2.5rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to discover your patterns?</h2>
              <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
                Join LifeRX and start with a comprehensive lab panel and full TCM assessment. Your journey from confusion to clarity begins here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth?signup=true">
                  <Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-primary hover:bg-white/90 shadow-xl border-none group" data-testid="button-start-journey">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="rounded-full px-12 h-16 text-lg bg-transparent border-white/30 text-white hover:bg-white/10" data-testid="button-view-plans">
                    View Plans & Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
