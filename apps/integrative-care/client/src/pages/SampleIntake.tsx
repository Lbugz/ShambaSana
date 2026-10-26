import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { IntakeJourney } from "@/components/IntakeJourney";
import { blankIntake } from "@shared/care";
import { createSamplePractitionerCase } from "@/lib/sample-practitioner";

export default function SampleIntake() {
  const [, navigate] = useLocation();
  const [example, setExample] = useState(false);
  const [version, setVersion] = useState(0);
  return <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4"><Brand subtitle="CLIENT INTAKE PREVIEW"/><Link href="/sample-results" className="inline-flex min-h-12 items-center gap-2 text-sm"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>Sample workspace</Link></div></header>
    <div className="bg-secondary px-5 py-4 text-center text-xs leading-6"><strong>Fictional preview. Please use example answers only.</strong> No server saves, uploads, AI requests or emails. Refreshing clears this rehearsal.</div>
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="mx-auto mb-8 flex max-w-3xl flex-wrap gap-3"><Button variant="outline" className="min-h-12" onClick={()=>{setExample(true);setVersion(v=>v+1);}}>Load fictional example</Button><Button variant="ghost" className="min-h-12" onClick={()=>{setExample(false);setVersion(v=>v+1);}}><RotateCcw className="mr-2 h-4 w-4" aria-hidden="true"/>Start blank</Button></div>
      <IntakeJourney key={version} initial={example ? createSamplePractitionerCase().intake : blankIntake} preview onSave={async()=>{}} onExit={()=>navigate("/sample-results")}/>
    </main>
    <p className="mx-auto max-w-3xl px-5 py-7 text-xs leading-6 text-muted-foreground">Care remains a sandbox pilot. Complete your actual health intake only through the agreed private pilot process.</p>
  </div>;
}
