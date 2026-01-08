import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, Check, Info, Sparkles, Shield, ArrowRight } from "lucide-react";
import mandalaImg from "@assets/generated_images/holistic_body_system_mandala_illustration.png";

const categories = [
  { id: "All", label: "All", icon: "🔬" },
  { id: "Heart", label: "Heart", icon: "❤️" },
  { id: "Thyroid", label: "Thyroid", icon: "🦋" },
  { id: "Hormones", label: "Hormones", icon: "⚡" },
  { id: "Metabolic", label: "Metabolic", icon: "🔥" },
  { id: "Nutrients", label: "Nutrients", icon: "🌿" },
  { id: "Liver & Kidney", label: "Liver & Kidney", icon: "🫘" },
  { id: "Inflammation", label: "Inflammation", icon: "🌡️" },
  { id: "Heavy Metals", label: "Toxins", icon: "☠️" },
  { id: "Immune", label: "Immune", icon: "🛡️" },
];

const tests = [
  {
    category: "Heart",
    title: "Advanced Lipid Panel",
    items: [
      { name: "ApoB", description: "The most accurate marker of cardiovascular risk.", core: true },
      { name: "LDL Particle Number (LDL-P)", description: "Measures the actual number of LDL particles.", core: true },
      { name: "Lipoprotein(a)", description: "Genetically determined risk factor for heart disease.", core: true },
      { name: "hs-CRP", description: "Marker of systemic inflammation.", core: true }
    ],
    tcmParallel: "Elevated lipids and inflammation markers often correlate with Phlegm-Dampness or Blood Stasis patterns in TCM—conditions associated with sluggish circulation and metabolic congestion."
  },
  {
    category: "Thyroid",
    title: "Complete Thyroid Panel",
    items: [
      { name: "TSH", description: "Pituitary hormone stimulating the thyroid.", core: true },
      { name: "Free T3 & Free T4", description: "Active thyroid hormones available to tissues.", core: true },
      { name: "Reverse T3", description: "Inactive form of T3, often elevated in stress.", core: true },
      { name: "Thyroid Antibodies (TPO & TgAb)", description: "Screens for Hashimoto's and Graves'.", core: true }
    ],
    tcmParallel: "Low thyroid function often maps to Kidney Yang Deficiency or Spleen Qi Deficiency—patterns marked by fatigue, cold intolerance, and slow metabolism."
  },
  {
    category: "Hormones",
    title: "Sex Hormones & Adrenals",
    items: [
      { name: "Testosterone (Total & Free)", description: "Crucial for energy, muscle, and mood.", core: true },
      { name: "Estradiol & Progesterone", description: "Key for cycle health and fertility.", core: true },
      { name: "Cortisol (AM/PM)", description: "Stress hormone rhythm.", core: true },
      { name: "DHEA-S", description: "Adrenal precursor hormone.", core: true },
      { name: "Pregnenolone", description: "Master precursor to all steroid hormones.", core: false }
    ],
    tcmParallel: "Hormonal imbalances often reflect Kidney Essence deficiency (for low hormones) or Liver Qi Stagnation (for irregular cycles and mood swings)."
  },
  {
    category: "Metabolic",
    title: "Metabolic Health & Insulin",
    items: [
      { name: "HbA1c", description: "Average blood sugar over 3 months.", core: true },
      { name: "Fasting Insulin", description: "Early detector of insulin resistance.", core: true },
      { name: "Fasting Glucose", description: "Baseline blood sugar level.", core: true },
      { name: "Uric Acid", description: "Marker for metabolic stress and fructose load.", core: true },
      { name: "Leptin", description: "Satiety hormone regulating energy balance.", core: false }
    ],
    tcmParallel: "Elevated glucose and insulin resistance often align with Dampness and Spleen Deficiency patterns—conditions where the body struggles to transform and transport nutrients efficiently."
  },
  {
    category: "Nutrients",
    title: "Micronutrients & Minerals",
    items: [
      { name: "Vitamin D3 (25-OH)", description: "Essential for immune and bone health.", core: true },
      { name: "Ferritin", description: "Iron storage protein.", core: true },
      { name: "Vitamin B12 & Folate", description: "Crucial for energy and methylation.", core: true },
      { name: "Magnesium (RBC)", description: "Intracellular magnesium levels.", core: true },
      { name: "Zinc & Copper", description: "Essential trace minerals for immunity and metabolism.", core: true },
      { name: "Omega-3 Index", description: "EPA/DHA levels in red blood cells.", core: false }
    ],
    tcmParallel: "Low ferritin and B12 often map to Blood Deficiency—a pattern marked by fatigue, pale complexion, and poor concentration. Low Vitamin D may reflect Kidney Yang weakness."
  },
  {
    category: "Liver & Kidney",
    title: "Organ Function",
    items: [
      { name: "ALT & AST", description: "Liver enzymes indicating stress or damage.", core: true },
      { name: "GGT", description: "Sensitive marker for liver and bile duct health.", core: true },
      { name: "Alkaline Phosphatase", description: "Bone and liver health marker.", core: true },
      { name: "eGFR & Creatinine", description: "Key measures of kidney filtration.", core: true },
      { name: "BUN", description: "Protein metabolism and kidney function.", core: true }
    ],
    tcmParallel: "Elevated liver enzymes can indicate Liver Qi Stagnation with Heat, while poor kidney filtration may reflect Kidney Yin or Yang Deficiency depending on accompanying symptoms."
  },
  {
    category: "Inflammation",
    title: "Inflammatory Markers",
    items: [
      { name: "hs-CRP", description: "High-sensitivity C-reactive protein.", core: true },
      { name: "Homocysteine", description: "Cardiovascular and methylation marker.", core: true },
      { name: "ESR", description: "Erythrocyte sedimentation rate.", core: true },
      { name: "Fibrinogen", description: "Clotting factor and inflammation marker.", core: false }
    ],
    tcmParallel: "Chronic inflammation often correlates with Heat patterns or Damp-Heat accumulation in TCM—conditions requiring cooling and draining therapeutic approaches."
  },
  {
    category: "Heavy Metals",
    title: "Toxins & Heavy Metals",
    items: [
      { name: "Lead", description: "Neurotoxin affecting cognition and blood pressure.", core: true },
      { name: "Mercury", description: "Common from fish consumption and dental fillings.", core: true },
      { name: "Arsenic", description: "Environmental toxin from water and food.", core: true },
      { name: "Cadmium", description: "Found in tobacco smoke and industrial exposure.", core: true }
    ],
    tcmParallel: "Heavy metal accumulation often manifests as Dampness and Phlegm patterns, creating systemic stagnation that impairs organ function and mental clarity."
  },
  {
    category: "Immune",
    title: "Immune & Autoimmunity",
    items: [
      { name: "ANA", description: "Antinuclear antibodies screening.", core: false },
      { name: "RF (Rheumatoid Factor)", description: "Marker for rheumatoid arthritis.", core: false },
      { name: "Immunoglobulins (IgA, IgG, IgM)", description: "Immune system antibody levels.", core: true },
      { name: "White Blood Cell Differential", description: "Breakdown of immune cell types.", core: true }
    ],
    tcmParallel: "Autoimmune patterns often reflect a complex interplay of Heat (inflammation) and Deficiency (weakened Wei Qi or defensive energy), requiring both clearing and tonifying approaches."
  }
];

export default function WhatWeTest() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTests = tests.filter(test => {
    const matchesCategory = activeCategory === "All" || test.category === activeCategory;
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="text-page-title">
             160+ Biomarkers. <br/>
             <span className="italic text-emerald-700/80">Organized by Body System.</span>
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             We don't guess. We test. From advanced heart health markers to detailed hormone panels, we look deeper than standard medicine—and interpret results through both Western and TCM lenses.
           </p>
           
           <div className="flex flex-wrap justify-center gap-3 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
             <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 px-4 py-2">
               <Shield className="h-4 w-4 mr-2" />
               CLIA-Certified Labs
             </Badge>
             <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 px-4 py-2">
               <Check className="h-4 w-4 mr-2" />
               Physician-Ordered
             </Badge>
             <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 px-4 py-2">
               <Sparkles className="h-4 w-4 mr-2" />
               TCM Pattern Integration
             </Badge>
           </div>
           
           <div className="max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
             <Input 
               className="pl-12 h-12 rounded-full border-primary/20 bg-white/50 backdrop-blur-sm focus:ring-primary/20 text-lg shadow-sm"
               placeholder="Search for a specific test (e.g. Magnesium, Thyroid)..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               data-testid="input-search"
             />
           </div>
        </div>
      </section>

      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 py-4 shadow-sm">
        <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`button-category-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${activeCategory === cat.id 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                    : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"}
                `}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            {filteredTests.length > 0 ? (
              filteredTests.map((section, idx) => (
                <div key={idx} className="bg-white rounded-[1.5rem] border border-border/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }} data-testid={`card-test-${section.category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="px-8 py-6 bg-secondary/20 border-b border-border/40 flex justify-between items-center">
                    <h3 className="text-2xl font-serif text-primary">{section.title}</h3>
                    <Badge variant="outline" className="bg-white border-primary/20 text-primary uppercase tracking-wider text-xs">
                      {section.category}
                    </Badge>
                  </div>
                  <div className="divide-y divide-border/30">
                    {section.items.map((item, i) => (
                      <div key={i} className="px-8 py-5 hover:bg-secondary/5 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{item.name}</p>
                              {item.core ? (
                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-medium border-0">CORE</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] font-medium border-amber-300 text-amber-700 bg-amber-50">ADD-ON</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 leading-relaxed text-[0.95rem]">{item.description}</p>
                          </div>
                          <Info className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {section.tcmParallel && (
                    <div className="px-8 py-5 bg-[hsl(35,40%,97%)] border-t border-[hsl(35,30%,90%)]">
                      <div className="flex gap-3">
                        <Sparkles className="h-5 w-5 text-[hsl(35,60%,50%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(35,60%,40%)] mb-1">TCM Pattern Connection</p>
                          <p className="text-sm text-muted-foreground leading-relaxed italic">{section.tcmParallel}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No tests found matching "{searchTerm}"</p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary mt-2" data-testid="button-clear-search">Clear search</Button>
              </div>
            )}
            
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center mt-12">
              <h3 className="text-2xl font-serif text-primary mb-4">See How These Biomarkers Map to Your Patterns</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Numbers tell one story. Patterns tell another. Discover how LifeRX integrates both to give you a complete understanding of your health.
              </p>
              <Link href="/#patterns">
                <Button className="rounded-full px-8" data-testid="button-view-patterns">
                  Explore Pattern Intelligence
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="sticky top-40">
               <div className="bg-white rounded-[2rem] p-8 border border-border shadow-md text-center mb-8">
                 <div className="mb-6 relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-secondary/30 shadow-inner">
                   <img src={mandalaImg} alt="Holistic Body" className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-2xl font-serif text-primary mb-3">Data Meets Wisdom</h3>
                 <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                   We interpret these 160+ biomarkers through the lens of TCM. A "normal" thyroid panel might still reveal Qi Deficiency patterns that explain your symptoms.
                 </p>
                 <Link href="/auth?signup=true">
                   <Button className="w-full h-12 rounded-xl text-lg shadow-lg" data-testid="button-start-journey">Start Your Journey</Button>
                 </Link>
               </div>

               <div className="bg-[hsl(35,30%,96%)] rounded-2xl p-6 border border-[hsl(35,20%,90%)] mb-6">
                 <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                   <Check className="h-5 w-5 text-emerald-600" />
                   Core Panel Includes:
                 </h4>
                 <ul className="space-y-3 text-sm text-muted-foreground">
                   <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> 100+ Core Biomarkers</li>
                   <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Advanced Thyroid & Hormones</li>
                   <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Heavy Metal Screening</li>
                   <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Metabolic & Inflammatory Markers</li>
                   <li className="flex items-center gap-2"><span className="text-emerald-600">✓</span> Nutrient & Mineral Panel</li>
                 </ul>
               </div>
               
               <div className="bg-white rounded-2xl p-6 border border-border">
                 <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                   <Shield className="h-5 w-5 text-primary" />
                   Data Quality Assurance
                 </h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   LifeRX partners with CLIA-certified laboratories and provides physician-ordered testing, ensuring accuracy and full regulatory compliance. Your results are reviewed by licensed practitioners before interpretation.
                 </p>
               </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
