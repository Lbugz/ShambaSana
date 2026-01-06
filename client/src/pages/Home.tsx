import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Activity, Sprout, HeartPulse, ShieldCheck } from "lucide-react";
import heroBg from "@assets/generated_images/clean_minimal_abstract_nature_medical_background.png";
import labImg from "@assets/generated_images/modern_medical_lab_equipment_aesthetic.png";
import tcmImg from "@assets/generated_images/tcm_herbs_and_acupuncture_minimalist.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
             src={heroBg} 
             alt="Background" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/50 text-accent-foreground text-xs font-semibold tracking-wide mb-6 animate-in fade-in zoom-in duration-700">
            THE FUTURE OF INTEGRATIVE HEALTH
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto">
            Your Health, <br/>
            <span className="text-primary italic">Fully Understood.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            LifeRX combines 100+ comprehensive lab tests with Traditional Chinese Medicine insights to uncover the root cause of your symptoms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?signup=true">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Complete Picture of You</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Western diagnostics tell you "what". Eastern medicine tells you "why". We give you both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center mb-24">
             <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <img src={labImg} alt="Lab Testing" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">100+ Biomarker Lab Panel</h3>
                    <p className="text-white/80">Far beyond a standard annual checkup. We test hormones, thyroid, nutrients, metabolic health, and more.</p>
                  </div>
                </div>
             </div>
             <div className="space-y-6 lg:pl-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Data-Driven Precision</h4>
                    <p className="text-muted-foreground">Establish a baseline with clinical accuracy. Identify deficiencies and risks before they become chronic issues.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Proactive Monitoring</h4>
                    <p className="text-muted-foreground">Retest every 6 months to track improvements and adjust your protocol based on real data.</p>
                  </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
             <div className="order-2 md:order-1 space-y-6 lg:pr-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                    <Sprout className="text-amber-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">TCM Pattern Diagnosis</h4>
                    <p className="text-muted-foreground">Our practitioners analyze your tongue, pulse (via report), and symptoms to identify patterns like "Qi Deficiency" or "Liver Stagnation".</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                    <HeartPulse className="text-amber-600 h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Personalized Protocols</h4>
                    <p className="text-muted-foreground">Receive custom herbal formulas, dietary guidance, and lifestyle adjustments tailored to your unique constitution.</p>
                  </div>
                </div>
             </div>
             <div className="order-1 md:order-2 relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group">
                <img src={tcmImg} alt="TCM" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-2">Ancient Wisdom</h3>
                    <p className="text-white/80">Thousands of years of empirical evidence applied to your modern health challenges.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Health Seekers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4 text-amber-500">
                    {"★★★★★"}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "I finally understand why I was feeling tired all the time. The lab tests showed low iron, but the TCM diagnosis explained the root cause."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20" />
                    <div>
                      <p className="font-semibold text-sm">Sarah J.</p>
                      <p className="text-xs text-muted-foreground">Member since 2024</p>
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
