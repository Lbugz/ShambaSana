import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, ChevronDown, ChevronUp, Check, Info } from "lucide-react";
import mandalaImg from "@assets/generated_images/holistic_body_system_mandala_illustration.png";

const categories = [
  "All", "Heart", "Thyroid", "Hormones", "Metabolic", "Nutrients", 
  "Liver & Kidney", "Autoimmunity", "Heavy Metals", "Stress & Aging"
];

const tests = [
  {
    category: "Heart",
    title: "Advanced Lipid Panel",
    items: [
      { name: "ApoB", description: "The most accurate marker of cardiovascular risk." },
      { name: "LDL Particle Number (LDL-P)", description: "Measures the actual number of LDL particles." },
      { name: "Lipoprotein(a)", description: "Genetically determined risk factor for heart disease." },
      { name: "hs-CRP", description: "Marker of systemic inflammation." }
    ]
  },
  {
    category: "Thyroid",
    title: "Complete Thyroid Panel",
    items: [
      { name: "TSH", description: "Pituitary hormone stimulating the thyroid." },
      { name: "Free T3 & Free T4", description: "Active thyroid hormones available to tissues." },
      { name: "Reverse T3", description: "Inactive form of T3, often elevated in stress." },
      { name: "Thyroid Antibodies (TPO & TgAb)", description: "Screens for Hashimoto's and Graves'." }
    ]
  },
  {
    category: "Hormones",
    title: "Sex Hormones & Adrenals",
    items: [
      { name: "Testosterone (Total & Free)", description: "Crucial for energy, muscle, and mood." },
      { name: "Estradiol & Progesterone", description: "Key for cycle health and fertility." },
      { name: "Cortisol (AM/PM)", description: "Stress hormone rhythm." },
      { name: "DHEA-S", description: "Adrenal precursor hormone." }
    ]
  },
  {
    category: "Metabolic",
    title: "Metabolic Health & Insulin",
    items: [
      { name: "HbA1c", description: "Average blood sugar over 3 months." },
      { name: "Fasting Insulin", description: "Early detector of insulin resistance." },
      { name: "Uric Acid", description: "Marker for metabolic stress and fructose load." },
      { name: "Leptin", description: "Satiety hormone regulating energy balance." }
    ]
  },
  {
    category: "Nutrients",
    title: "Micronutrients & Minerals",
    items: [
      { name: "Vitamin D3", description: "Essential for immune and bone health." },
      { name: "Ferritin", description: "Iron storage protein." },
      { name: "Vitamin B12 & Folate", description: "Crucial for energy and methylation." },
      { name: "Magnesium (RBC)", description: "Intracellular magnesium levels." }
    ]
  },
  {
    category: "Liver & Kidney",
    title: "Organ Function",
    items: [
      { name: "ALT & AST", description: "Liver enzymes indicating stress or damage." },
      { name: "GGT", description: "Sensitive marker for liver and bile duct health." },
      { name: "eGFR & Creatinine", description: "Key measures of kidney filtration." }
    ]
  },
   {
    category: "Heavy Metals",
    title: "Toxins & Heavy Metals",
    items: [
      { name: "Lead & Mercury", description: "Common neurotoxins." },
      { name: "Arsenic & Cadmium", description: "Environmental heavy metals." }
    ]
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
      {/* Header Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-6xl font-serif text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             160+ Biomarkers. <br/>
             <span className="italic text-emerald-700/80">One Complete Picture.</span>
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             We don't guess. We test. From advanced heart health markers to detailed hormone panels, we look deeper than standard medicine to find the root cause.
           </p>
           
           <div className="max-w-xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
             <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
             <Input 
               className="pl-12 h-12 rounded-full border-primary/20 bg-white/50 backdrop-blur-sm focus:ring-primary/20 text-lg shadow-sm"
               placeholder="Search for a specific test (e.g. Magnesium, Thyroid)..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </section>

      {/* Category Pills - Sticky */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 py-4 shadow-sm">
        <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${activeCategory === cat 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                    : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Test List */}
          <div className="lg:col-span-2 space-y-8">
            {filteredTests.length > 0 ? (
              filteredTests.map((section, idx) => (
                <div key={idx} className="bg-white rounded-[1.5rem] border border-border/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
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
                            <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-muted-foreground mt-1 leading-relaxed text-[0.95rem]">{item.description}</p>
                          </div>
                          <Info className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No tests found matching "{searchTerm}"</p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary mt-2">Clear search</Button>
              </div>
            )}
          </div>

          {/* Right: Illustration & CTA */}
          <div className="space-y-8">
            <div className="sticky top-40">
               <div className="bg-white rounded-[2rem] p-8 border border-border shadow-md text-center mb-8">
                 <div className="mb-6 relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-secondary/30 shadow-inner">
                   <img src={mandalaImg} alt="Holistic Body" className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-2xl font-serif text-primary mb-3">Western Data, Eastern Wisdom</h3>
                 <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                   We interpret these 160+ biomarkers through the lens of TCM. A "normal" thyroid panel might still show "Qi Deficiency" in our protocol.
                 </p>
                 <Link href="/auth?signup=true">
                   <Button className="w-full h-12 rounded-xl text-lg shadow-lg">Start Your Journey</Button>
                 </Link>
               </div>

               <div className="bg-[hsl(35,30%,96%)] rounded-2xl p-6 border border-[hsl(35,20%,90%)]">
                 <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                   <Check className="h-5 w-5 text-emerald-600" />
                   What's included?
                 </h4>
                 <ul className="space-y-3 text-sm text-muted-foreground">
                   <li>• 100+ Core Biomarkers</li>
                   <li>• Advanced Thyroid & Hormones</li>
                   <li>• Heavy Metal Screening</li>
                   <li>• TCM Pulse & Tongue Analysis</li>
                   <li>• Personalized Herbal Plan</li>
                 </ul>
               </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
