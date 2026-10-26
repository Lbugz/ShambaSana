import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { useState, useEffect, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";

// Custom hash location hook to support static deployment environments
const currentHashLocation = () => {
  // If we arrived via a path (e.g. /tcm-assessment) due to a 404 fallback,
  // we should redirect to the hash version to fix the URL.
  if (
    window.location.pathname !== "/" &&
    window.location.pathname !== "/index.html"
  ) {
    const pathAndSearch = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", "/#" + pathAndSearch);
    return pathAndSearch.split("?")[0];
  }

  const hash = window.location.hash.replace(/^#/, "");
  return hash.split("?")[0] || "/";
};

const hashNavigate = (to: string) => {
  window.location.hash = to;
};

const useHashLocation = (): [string, (to: string) => void] => {
  const [loc, setLoc] = useState(currentHashLocation());

  useEffect(() => {
    const handler = () => setLoc(currentHashLocation());
    window.addEventListener("hashchange", handler);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("popstate", handler);
    };
  }, []);

  return [loc, hashNavigate];
};
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SandboxNotice } from "@/components/SandboxNotice";

// Pages
import Home from "@/pages/Home";
import HowItWorks from "@/pages/HowItWorks";
import WhatWeTest from "@/pages/WhatWeTest";
import Pricing from "@/pages/Pricing";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import FormulaLibrary from "@/pages/FormulaLibrary";
import TcmAssessment from "@/pages/TcmAssessment";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Policies from "@/pages/Policies";
import BillingDashboard from "@/pages/BillingDashboard";
import CoursePayment from "@/pages/CoursePayment";
const SampleResults = lazy(() => import("@/pages/SampleResults"));
const SamplePractitioner = lazy(() => import("@/pages/SamplePractitioner"));
const SampleIntake = lazy(() => import("@/pages/SampleIntake"));

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);

  // Hide Navbar/Footer on Dashboard and Auth pages for immersive experience
  const isAppRoute =
    location.startsWith("/sample-results") ||
    location.startsWith("/sample-practitioner") ||
    location.startsWith("/sample-intake") ||
    location.startsWith("/dashboard") ||
    location.startsWith("/auth") ||
    location.startsWith("/formula-library") ||
    location.startsWith("/course-payment") ||
    location.startsWith("/tcm-assessment") ||
    location.startsWith("/admin");

  return (
    <>
      {!isAppRoute && <Navbar />}
      {!isAppRoute && <SandboxNotice />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/what-we-test" component={WhatWeTest} />
        <Route path="/sample-results"><Suspense fallback={<p className="p-8">Loading sample workspace…</p>}><SampleResults /></Suspense></Route>
        <Route path="/sample-practitioner"><Suspense fallback={<p className="p-8">Loading practitioner rehearsal…</p>}><SamplePractitioner /></Suspense></Route>
        <Route path="/sample-intake"><Suspense fallback={<p className="p-8">Loading intake preview…</p>}><SampleIntake /></Suspense></Route>
        <Route path="/pricing" component={Pricing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/formula-library" component={FormulaLibrary} />
        <Route path="/tcm-assessment" component={TcmAssessment} />
        <Route path="/auth">
          <Auth />
        </Route>
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/billing" component={BillingDashboard} />
        <Route path="/course-payment" component={CoursePayment} />
        <Route path="/privacy">
          <Policies kind="privacy" />
        </Route>
        <Route path="/terms">
          <Policies kind="terms" />
        </Route>
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
        <WouterRouter hook={useHashLocation}>
          <Toaster />
          <Router />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
