import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Activity, Sprout, HeartPulse, ShieldCheck, Star, Check } from "lucide-react";
import heroBg from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";
import abstractImg from "@assets/generated_images/deep_jade_and_gold_abstract_flow_illustration.png";
import precisionVialsImg from "@assets/generated_images/minimalist_precision_test_tubes_warm_light.png";
import tcmImg from "@assets/generated_images/tcm_herbs_and_acupuncture_minimalist.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-100 mix-blend-multiply pointer-events-none">
           <img 
             src={heroBg} 
             alt="Background" 
             className="w-full h-full object-cover"
           />
        </div>
        
        {/* Abstract Flow Graphic */}
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-10 pointer-events-none z-0">
           <img 
             src={abstractImg} 
             alt="Flow" 
             className="w-full h-full object-cover mix-blend-multiply mask-image-fade-left"
             style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
           />
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              THE FUTURE OF INTEGRATIVE HEALTH
            </span>
            
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-primary mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Where Qi Moves, <br/>
              <span className="italic text-emerald-700/80">Healing Follows.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-light">
              Modern lab precision meets ancient wisdom. We bridge 100+ clinical biomarkers with Traditional Chinese Medicine to uncover the root cause of your symptoms.
            </p>

            <div className="flex items-center gap-3 mb-10 text-emerald-800 bg-emerald-50/50 w-fit px-4 py-2 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
               <span className="font-semibold text-sm tracking-wide">MEMBERSHIP STARTS AT $499/YEAR</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/auth?signup=true">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90">
                  Begin My Healing Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full bg-background border-primary/20 text-primary hover:bg-background hover:border-primary/40 shadow-sm transition-all">
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">A Complete Picture of You</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Western diagnostics tell you "what". Eastern medicine tells you "why". We give you both in one unified protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
             <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/10 aspect-[4/3] group card-hover border border-white/50">
                <img src={precisionVialsImg} alt="Lab Testing" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex items-end p-10">
                  <div className="text-white">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block text-sm font-medium mb-3 border border-white/30">Western Science</div>
                    <h3 className="text-3xl font-serif mb-3">100+ Biomarker Lab Panel</h3>
                    <p className="text-white/90 leading-relaxed font-light">Far beyond a standard annual checkup. We test hormones, thyroid, nutrients, metabolic health, and heavy metals with clinical precision.</p>
                  </div>
                </div>
             </div>
             
             <div className="space-y-10 lg:pl-4">
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="text-emerald-700 h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Data-Driven Precision</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Establish a baseline with clinical accuracy. Identify deficiencies and risks before they become chronic issues using advanced diagnostic markers.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="text-emerald-700 h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Proactive Monitoring</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Retest every 6 months to track improvements and adjust your protocol based on real data, not guesswork.</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
             <div className="order-2 md:order-1 space-y-10 lg:pr-4">
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sprout className="text-[hsl(2,35%,54%)] h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">TCM Pattern Diagnosis</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Our practitioners analyze your tongue, pulse, and symptoms to identify patterns like <span className="text-[hsl(2,35%,54%)] font-medium">"Blood Deficiency"</span> or <span className="text-emerald-700 font-medium">"Liver Stagnation"</span>.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <HeartPulse className="text-[hsl(2,35%,54%)] h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Personalized Protocols</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Receive custom herbal formulas, dietary guidance, and lifestyle adjustments tailored to your unique constitution and current season.</p>
                  </div>
                </div>
             </div>
             
             <div className="order-1 md:order-2 relative rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/10 aspect-[4/3] group card-hover border border-white/50">
                <img src={tcmImg} alt="TCM" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex items-end p-10">
                  <div className="text-white">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block text-sm font-medium mb-3 border border-white/30">Eastern Wisdom</div>
                    <h3 className="text-3xl font-serif mb-3">Ancient Roots</h3>
                    <p className="text-white/90 leading-relaxed font-light">Thousands of years of empirical evidence applied to your modern health challenges, restoring balance to your body's systems.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Comparison / Why LifeRX */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-primary mb-6">Why Choose LifeRX?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer the best of both worlds. See how we compare to standard care.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-border">
             <div className="grid grid-cols-4 bg-primary/5 p-6 border-b border-border text-primary font-bold font-serif text-lg">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-center">Standard GP</div>
                <div className="col-span-1 text-center">Function Health</div>
                <div className="col-span-1 text-center text-emerald-700 bg-white rounded-lg py-1 shadow-sm">LifeRX</div>
             </div>
             
             <div className="divide-y divide-border/50">
               {[
                 { label: "100+ Biomarker Panel", gp: false, fh: true, lrx: true },
                 { label: "TCM Pattern Diagnosis", gp: false, fh: false, lrx: true },
                 { label: "Herbal Protocols", gp: false, fh: false, lrx: true },
                 { label: "Clinician Review", gp: "Brief", fh: true, lrx: true },
                 { label: "Seasonal Retesting", gp: false, fh: true, lrx: true },
               ].map((row, i) => (
                 <div key={i} className="grid grid-cols-4 p-6 items-center hover:bg-secondary/5 transition-colors">
                    <div className="col-span-1 font-medium text-foreground">{row.label}</div>
                    <div className="col-span-1 flex justify-center text-muted-foreground">
                      {row.gp === false ? <span className="text-red-300">✕</span> : row.gp === true ? <Check className="text-primary" /> : <span className="text-sm">{row.gp}</span>}
                    </div>
                    <div className="col-span-1 flex justify-center text-muted-foreground">
                       {row.fh === false ? <span className="text-red-300">✕</span> : <Check className="text-primary" />}
                    </div>
                    <div className="col-span-1 flex justify-center relative">
                       <div className="absolute inset-y-0 bg-primary/5 w-full -z-10" />
                       <Check className="text-emerald-700 stroke-[3px]" />
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif text-primary text-center mb-16">Stories of Renewal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-md rounded-2xl p-2 group">
                <CardContent className="pt-8 px-6 pb-6">
                  <div className="flex items-center gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="w-4 h-4 fill-[hsl(35,60%,60%)] text-[hsl(35,60%,60%)]" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-8 italic text-lg font-serif leading-relaxed">
                    "I finally understand why I was feeling tired all the time. The lab tests showed low iron, but the TCM diagnosis explained the root cause was Spleen Qi Deficiency."
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg">S</div>
                    <div>
                      <p className="font-serif font-bold text-primary">Sarah Jenkins</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">LifeRX Member</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
