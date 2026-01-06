import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="min-h-screen py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Invest in your long-term health. HSA/FSA eligible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Essential</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$499</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Perfect for an annual deep dive.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  "100+ Biomarker Lab Panel (1x)",
                  "TCM Pattern Diagnosis",
                  "Integrative Health Report",
                  "Digital Dashboard Access",
                  "Standard Support"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth?signup=true&plan=essential">
                <Button className="w-full" variant="outline">Choose Essential</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan (Highlighted) */}
          <Card className="border-primary shadow-xl relative scale-105 bg-background">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Complete Care</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$999</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Biannual testing for proactive optimization.</p>
            </CardHeader>
            <CardContent>
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
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
               <Link href="/auth?signup=true&plan=complete">
                <Button className="w-full h-12 text-lg">Choose Complete</Button>
               </Link>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Concierge</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">$2,499</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total health management & longevity.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  "Everything in Complete",
                  "Advanced Genetic Testing",
                  "Toxin & Heavy Metal Panel",
                  "Monthly TCM Consultations",
                  "Unlimited Messaging",
                  "Family Plan Options"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth?signup=true&plan=concierge">
                <Button className="w-full" variant="outline">Contact Us</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
