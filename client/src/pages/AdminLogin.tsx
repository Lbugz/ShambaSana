import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock Auth
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Access Granted",
        description: "Welcome to the Clinical Portal.",
      });
      setLocation("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(161,67%,10%)] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-8 left-8 flex items-center gap-2 text-white font-serif font-bold text-2xl z-10">
        <BrainCircuit className="w-6 h-6 text-emerald-400" />
        LifeRX <span className="font-sans font-normal text-sm tracking-widest text-emerald-400/80 uppercase ml-2 border-l border-emerald-400/30 pl-4 hidden sm:inline-block">Clinical Portal</span>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-white/95 backdrop-blur-md rounded-3xl z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif text-primary">
            Practitioner Login
          </CardTitle>
          <CardDescription className="text-foreground/70">
            Secure access to patient assessments and clinical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Practitioner Email</Label>
              <Input id="email" type="email" placeholder="dr.smith@liferx.health" required className="bg-white border-border/50" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
              </div>
              <Input id="password" type="password" required className="bg-white border-border/50" />
            </div>
            <Button type="submit" className="w-full rounded-full py-6 text-base shadow-md mt-2" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-center pb-8 border-t border-border/50 pt-6 mt-4 mx-6 px-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            HIPAA Compliant System • Authorized Personnel Only
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}