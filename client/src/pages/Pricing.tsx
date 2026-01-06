import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-6xl font-serif text-primary mb-6">Invest in Your Longevity</h1>
          <p className="text-xl text-muted-foreground font-light">
            Transparent pricing for comprehensive care. HSA/FSA eligible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {/* Basic Plan */}
          <Card className="border-border shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-serif text-primary">Essential</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-sans text-foreground">$499</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">Perfect for an annual deep dive into your baseline health.</p>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-4">
                {[
                  "100+ Biomarker Lab Panel (1x)",
                  "TCM Pattern Diagnosis",
                  "Integrative Health Report",
                  "Digital Dashboard Access",
                  "Standard Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Link href="/auth?signup=true&plan=essential">
                <Button className="w-full rounded-xl h-12 border-primary/20 hover:bg-primary/5 text-primary" variant="outline">Choose Essential</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan (Highlighted) */}
          <Card className="border-primary shadow-2xl relative bg-primary text-primary-foreground rounded-[1.5rem] lg:-mt-8 z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[hsl(35,60%,60%)]" />
            
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-serif text-white">Complete Care</CardTitle>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                  Most Popular
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold font-sans text-white">$999</span>
                <span className="text-white/60">/year</span>
              </div>
              <p className="text-white/80 mt-4 leading-relaxed">Biannual testing and dedicated clinician guidance for proactive optimization.</p>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-4">
                {[
                  "100+ Biomarker Lab Panel (2x)",
                  "TCM Pattern Diagnosis (2x)",
                  "Integrative Health Report (2x)",
                  "1-on-1 Clinician Review Call (2x)",
                  "Personalized Herbal Prescriptions",
                  "Quarterly Check-ins",
                  "Priority Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                       <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-white/90 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
               <Link href="/auth?signup=true&plan=complete">
                <Button className="w-full h-14 text-lg rounded-xl bg-white text-primary hover:bg-white/90 border-none shadow-lg">Choose Complete</Button>
               </Link>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-border shadow-sm hover:shadow-lg transition-all duration-300 rounded-[1.5rem] bg-white/50 backdrop-blur-sm">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-serif text-primary">Concierge</CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold font-sans text-foreground">$2,499</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed">Total health management & longevity planning.</p>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <ul className="space-y-4">
                {[
                  "Everything in Complete",
                  "Advanced Genetic Testing",
                  "Toxin & Heavy Metal Panel",
                  "Monthly TCM Consultations",
                  "Unlimited Messaging",
                  "Family Plan Options"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <Link href="/auth?signup=true&plan=concierge">
                <Button className="w-full rounded-xl h-12 border-primary/20 hover:bg-primary/5 text-primary" variant="outline">Contact Us</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
