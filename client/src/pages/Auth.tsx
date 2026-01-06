import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const isSignup = searchParams.get("signup") === "true";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock Auth
    setTimeout(() => {
      setLoading(false);
      toast({
        title: isSignup ? "Account Created" : "Welcome Back",
        description: "Redirecting to your dashboard...",
      });
      setLocation("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-serif text-primary">
            {isSignup ? "Join LifeRX" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignup 
              ? "Start your journey to holistic health today." 
              : "Access your insights and protocols."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && (
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="first-name">First name</Label>
                   <Input id="first-name" required />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="last-name">Last name</Label>
                   <Input id="last-name" required />
                 </div>
               </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>}
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (isSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center">
          <div className="text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link href={isSignup ? "/auth" : "/auth?signup=true"}>
              <a className="text-primary font-medium hover:underline">
                {isSignup ? "Sign in" : "Sign up"}
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
