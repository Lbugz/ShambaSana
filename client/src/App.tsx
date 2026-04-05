import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import WhatWeTest from "@/pages/WhatWeTest";
import Pricing from "@/pages/Pricing";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import FormulaLibrary from "@/pages/FormulaLibrary";
import TcmAssessment from "@/pages/TcmAssessment";

function Router() {
  const [location] = useLocation();

  // Hide Navbar/Footer on Dashboard and Auth pages for immersive experience
  const isAppRoute = location.startsWith("/dashboard") || location.startsWith("/auth") || location.startsWith("/formula-library") || location.startsWith("/tcm-assessment");

  return (
    <>
      {!isAppRoute && <Navbar />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/what-we-test" component={WhatWeTest} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/formula-library" component={FormulaLibrary} />
        <Route path="/tcm-assessment" component={TcmAssessment} />
        <Route path="/auth" component={Auth} />
        <Route component={NotFound} />
      </Switch>
      {!isAppRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
