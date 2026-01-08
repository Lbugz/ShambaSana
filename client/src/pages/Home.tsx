import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Activity, Sprout, HeartPulse, ShieldCheck, Star, Check } from "lucide-react";
import heroBg from "@assets/generated_images/warm_cream_paper_texture_with_subtle_botanical_jade_watermark.png";
import abstractImg from "@assets/generated_images/deep_jade_and_gold_abstract_flow_illustration.png";
import precisionVialsImg from "@assets/generated_images/minimalist_precision_test_tubes_warm_light.png";
import tcmImg from "@assets/generated_images/tcm_herbs_and_acupuncture_minimalist.png";
import formulaImg from "@assets/generated_images/flat_lay_herbal_formulas_on_stone.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-100 mix-blend-multiply pointer-events-none">
           <img 
             src={heroBg} 
             alt="Background" 
             className="w-full h-full object-cover"
           />
        </div>
        
        {/* Abstract Flow Graphic */}
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-10 pointer-events-none z-0">
           <img 
             src={abstractImg} 
             alt="Flow" 
             className="w-full h-full object-cover mix-blend-multiply mask-image-fade-left"
             style={{ maskImage: "linear-gradient(to right, transparent, black)" }}
           />
        </div>
        
        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              THE FUTURE OF INTEGRATIVE HEALTH
            </span>
            
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-primary mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Your Body Speaks <br/>
              <span className="italic text-emerald-700/80">in Patterns.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-6 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-light">
              We help you understand them.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 font-light border-l-2 border-emerald-500/30 pl-4">
              Traditional Chinese Medicine pattern intelligence, validated by 160+ modern biomarkers. We translate your unique constellation of symptoms into actionable insights—then prove them with comprehensive lab data and longitudinal tracking.
            </p>
            
            <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               <p className="font-serif text-base md:text-lg text-primary/70 font-medium tracking-wide">
                 Patterns → Labs → Guidance → Monitoring
               </p>
            </div>

            <div className="group relative flex items-center gap-3 mb-10 text-emerald-800 bg-emerald-50/50 w-fit px-4 py-2 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 cursor-help">
               <span className="font-semibold text-sm tracking-wide">MEMBERSHIP STARTS AT $499/YEAR *</span>
               <div className="absolute left-0 bottom-full mb-2 w-64 bg-white p-3 rounded-lg shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground pointer-events-none z-50">
                 Includes 2 comprehensive lab panels/year, TCM pattern analysis, and dashboard access.
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="flex flex-col items-center gap-2">
                <Link href="/auth?signup=true">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all bg-primary hover:bg-primary/90">
                    Join Core Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">Labs + Patterns + Dashboard</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full bg-background border-primary/20 text-primary hover:bg-background hover:border-primary/40 shadow-sm transition-all">
                    Explore Complete & Concierge
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">+ Herbal Fulfillment & Consults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="patterns" className="py-24 relative scroll-mt-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">Pattern Intelligence First</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Eastern medicine tells you "why". Western diagnostics confirm and refine. We give you both in one unified protocol.
            </p>
          </div>

          {/* TCM PATTERN INTELLIGENCE - NOW FIRST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
             <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/10 aspect-[5/6] md:aspect-[4/3] group card-hover border border-white/50">
                <img src={tcmImg} alt="TCM Pattern Intelligence" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex items-end p-6 md:p-10">
                  <div className="text-white">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block text-sm font-medium mb-2 md:mb-3 border border-white/30">Pattern Intelligence</div>
                    <h3 className="text-2xl md:text-3xl font-serif mb-2 md:mb-3">Your Body's Language</h3>
                    <p className="text-white/90 leading-relaxed font-light text-sm md:text-base">We decode patterns like Qi stagnation, Blood deficiency, or Yin/Yang imbalance—using 2,000 years of clinical observation as our foundation.</p>
                  </div>
                </div>
             </div>
             
             <div className="space-y-10 lg:pl-4">
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Sprout className="text-[hsl(2,35%,54%)] h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">TCM Assessment Stack</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Our pattern diagnostics include:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-muted-foreground text-base space-y-1 ml-1">
                      <li>Tongue Photo Analysis</li>
                      <li>Pulse Intake Assessment</li>
                      <li>Symptom Pattern Mapping</li>
                      <li>Constitutional Typing</li>
                      <li>Five-Element Stress Mapping</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <HeartPulse className="text-[hsl(2,35%,54%)] h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Meaning Behind Symptoms</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Your fatigue isn't just "low energy"—it may be Spleen Qi deficiency. Your anxiety isn't just stress—it may be Liver Qi stagnation. We give you the framework to understand <em>why</em>.</p>
                    <p className="text-sm text-emerald-700 mt-4 bg-emerald-50 p-2 rounded-lg inline-block border border-emerald-100">
                      * WHO: ~80% of the world relies on traditional medicine.
                    </p>
                  </div>
                </div>
             </div>
          </div>

          {/* LAB VALIDATION - NOW SECOND */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
             <div className="order-2 md:order-1 space-y-10 lg:pr-4">
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="text-emerald-700 h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Validated by Data</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">160+ biomarkers across 20 body systems confirm or refine pattern hypotheses. Labs don't replace pattern intelligence—they validate it.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-emerald-900/5 border border-emerald-900/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="text-emerald-700 h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif text-primary mb-3">Longitudinal Tracking</h4>
                    <p className="text-muted-foreground leading-relaxed text-lg">Retest every 6 months (80+ biomarker mid-year panel) to track improvements. Watch your patterns shift as your protocols take effect.</p>
                  </div>
                </div>
             </div>
             
             <div className="order-1 md:order-2 relative rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/10 aspect-[5/6] md:aspect-[4/3] group card-hover border border-white/50">
                <img src={precisionVialsImg} alt="Lab Validation" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex items-end p-6 md:p-10">
                  <div className="text-white">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block text-sm font-medium mb-2 md:mb-3 border border-white/30">Validated by Data</div>
                    <h3 className="text-2xl md:text-3xl font-serif mb-2 md:mb-3">160+ Biomarkers</h3>
                    <p className="text-white/90 leading-relaxed font-light text-sm md:text-base">Comprehensive labs confirm pattern diagnoses. Hormones, nutrients, metabolic health, toxins—we leave nothing to guesswork.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Ancient Formulas. Modern Context. */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="w-full lg:w-1/2">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square border border-white/50 group">
                   <img src={formulaImg} alt="Ancient Formulas" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-10">
                      <div className="text-white">
                        <h3 className="text-3xl font-serif mb-2">Formula Intelligence</h3>
                        <p className="text-white/80 font-light">Not just pills. Precision interventions.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="w-full lg:w-1/2 space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">Formula Intelligence & <br/>Botanical Fulfillment (Premium)</h2>
                  <p className="text-xl text-muted-foreground font-light leading-relaxed">
                    Two layers of support:
                  </p>
                  <ul className="space-y-4 mt-4 text-muted-foreground">
                    <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">1</div>
                      <p><span className="font-bold text-primary">Educational Overlay (All Tiers):</span> Map lab patterns to classical formulas to see how ancient remedies align with modern findings.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">2</div>
                      <p><span className="font-bold text-primary">Practitioner-Guided Fulfillment (Complete+):</span> Optional monthly herbal formulations executed only after diagnosis.</p>
                    </li>
                  </ul>
                  
                  <div className="pt-6">
                    <Link href="/pricing">
                      <Button className="rounded-full px-8 shadow-md">Upgrade for Personalized Support</Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="p-6 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="font-serif text-xl text-primary mb-2">Xiao Yao San</h4>
                      <p className="text-sm text-muted-foreground mb-3 italic">"Free and Easy Wanderer"</p>
                      <p className="text-foreground/80 leading-relaxed border-l-2 border-emerald-500 pl-4">
                        Traditionally associated with stress-related digestive patterns. In a modern lens, we discuss this when cortisol dysregulation appears alongside hepatic stress markers.
                      </p>
                   </div>
                   
                   <div className="p-6 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow opacity-70 hover:opacity-100 transition-opacity">
                      <h4 className="font-serif text-xl text-primary mb-2">Si Wu Tang</h4>
                      <p className="text-sm text-muted-foreground mb-3 italic">"Four Substance Decoction"</p>
                      <p className="text-foreground/80 leading-relaxed border-l-2 border-[hsl(2,35%,54%)] pl-4">
                        The classical blood tonic. Often relevant when Ferritin levels are suboptimal despite normal hemoglobin ranges.
                      </p>
                   </div>
                   
                   <div className="p-6 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow opacity-70 hover:opacity-100 transition-opacity">
                      <h4 className="font-serif text-xl text-primary mb-2">Ba Zhen Tang</h4>
                      <p className="text-sm text-muted-foreground mb-3 italic">"Eight Treasure Decoction"</p>
                      <p className="text-foreground/80 leading-relaxed border-l-2 border-amber-500 pl-4">
                        Combines Qi and Blood tonics. Discussed when fatigue presents with both dizziness (Blood deficiency) and poor appetite (Qi deficiency).
                      </p>
                   </div>
                </div>
                
                <div className="pt-4 space-y-4">
                   <Link href="/formula-library">
                     <Button variant="link" className="text-primary p-0 h-auto text-lg font-serif decoration-primary/30 hover:decoration-primary underline-offset-4">
                       Explore our educational library <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                   </Link>
                   <p className="text-xs text-muted-foreground italic border-l-2 border-amber-400/50 pl-3">
                     For educational purposes only. Formulas are provided under practitioner guidance after pattern diagnosis and are not sold directly to the public.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-primary mb-6">Plans & Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the level of guidance that fits your journey.
            </p>
            <p className="text-sm text-emerald-700 mt-4 bg-emerald-50 px-4 py-2 rounded-full inline-block border border-emerald-100">
              HSA/FSA Eligible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Core */}
            <Card className="border border-border shadow-sm hover:shadow-lg transition-all rounded-[2rem] overflow-hidden">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-serif text-primary mb-2">Core</h3>
                <div className="text-3xl font-bold text-primary mb-6">$499<span className="text-lg text-muted-foreground font-normal">/year</span></div>
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-bold text-primary">Includes:</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 2 Comprehensive Lab Panels</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> TCM Pattern Analysis</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Dashboard Access</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Formula Educational Overlay</li>
                  </ul>
                </div>
                <Button className="w-full mt-8 rounded-full" variant="outline">Select Core</Button>
              </CardContent>
            </Card>

            {/* Complete */}
            <Card className="border-2 border-primary/20 shadow-xl bg-primary/5 rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 bg-primary text-white text-center text-xs font-bold py-1 uppercase tracking-wider">Most Popular</div>
              <CardContent className="p-8 pt-10 flex flex-col h-full">
                <h3 className="text-2xl font-serif text-primary mb-2">Complete</h3>
                <div className="text-3xl font-bold text-primary mb-6">$799<span className="text-lg text-muted-foreground font-normal">/year</span></div>
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-bold text-primary">Everything in Core, plus:</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Botanical Fulfillment Access</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 2 Practitioner Consults</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Seasonal Protocol Adjustments</li>
                  </ul>
                </div>
                <Button className="w-full mt-8 rounded-full">Select Complete</Button>
              </CardContent>
            </Card>

            {/* Concierge */}
            <Card className="border border-border shadow-sm hover:shadow-lg transition-all rounded-[2rem] overflow-hidden">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-serif text-primary mb-2">Concierge</h3>
                <div className="text-3xl font-bold text-primary mb-6">$1,499<span className="text-lg text-muted-foreground font-normal">/year</span></div>
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-bold text-primary">Everything in Complete, plus:</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Quarterly Testing (4x/yr)</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Dedicated Health Manager</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Priority Support</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> 10% off Formulas</li>
                  </ul>
                </div>
                <Button className="w-full mt-8 rounded-full" variant="outline">Select Concierge</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison / Why LifeRX */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-primary mb-6">Why Choose LifeRX?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer the best of both worlds. See how we compare to standard care.
            </p>
          </div>

          <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-border">
             <div className="overflow-x-auto">
               <div className="min-w-[800px]">
                 <div className="grid grid-cols-6 bg-primary/5 p-6 border-b border-border text-primary font-bold font-serif text-lg">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center text-base">Standard GP</div>
                    <div className="col-span-1 text-center text-base">Function Health</div>
                    <div className="col-span-1 text-center text-base">Empirical Health</div>
                    <div className="col-span-1 text-center text-base">Balanced Thistle</div>
                    <div className="col-span-1 text-center text-emerald-700 bg-white rounded-lg py-1 shadow-sm text-base">LifeRX</div>
                 </div>
                 
                 <div className="divide-y divide-border/50">
                   {[
                     { label: "Biomarkers", gp: "~20-40", fh: "100+", eh: "Broad", bt: "Varies", lrx: "160+" },
                     { label: "TCM Diagnostics", gp: false, fh: false, eh: false, bt: true, lrx: true },
                     { label: "Interpretation", gp: "Basic", fh: "Labs Only", eh: "Medical", bt: "TCM Only", lrx: "Integrated" },
                     { label: "Retesting Cadence", gp: "Annual", fh: "3-6 mo", eh: "Varies", bt: "Varies", lrx: "6 mo" },
                     { label: "Botanical Fulfillment", gp: false, fh: false, eh: false, bt: true, lrx: "Premium" },
                     { label: "Scalable Platform", gp: true, fh: true, eh: true, bt: false, lrx: true },
                   ].map((row, i) => (
                     <div key={i} className="grid grid-cols-6 p-6 items-center hover:bg-secondary/5 transition-colors">
                        <div className="col-span-1 font-medium text-foreground text-sm">{row.label}</div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                          {row.gp === false ? <span className="text-red-300">✕</span> : row.gp === true ? <Check className="text-primary" /> : <span className="text-sm font-medium">{row.gp}</span>}
                        </div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                           {row.fh === false ? <span className="text-red-300">✕</span> : row.fh === true ? <Check className="text-primary" /> : <span className="text-sm font-medium">{row.fh}</span>}
                        </div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                           {row.eh === false ? <span className="text-red-300">✕</span> : row.eh === true ? <Check className="text-primary" /> : <span className="text-sm font-medium">{row.eh}</span>}
                        </div>
                        <div className="col-span-1 flex justify-center text-muted-foreground">
                           {row.bt === false ? <span className="text-red-300">✕</span> : row.bt === true ? <Check className="text-primary" /> : <span className="text-sm font-medium">{row.bt}</span>}
                        </div>
                        <div className="col-span-1 flex justify-center relative">
                           <div className="absolute inset-y-0 bg-primary/5 w-full -z-10" />
                           {row.lrx === true ? <Check className="text-emerald-700 stroke-[3px]" /> : <span className="text-sm font-bold text-emerald-700">{row.lrx}</span>}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
             
             {/* Research Strip */}
             <div className="bg-primary/5 p-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <p>• "Function Health runs 100+ lab tests..."</p>
                <p>• "Balanced Thistle integrates acupuncture..."</p>
                <p>• "Empirical Health delivers blood panels..."</p>
                <p>• "WHO: 80% of the world uses traditional medicine."</p>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-24 bg-white/50 backdrop-blur-sm border-y border-border/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif text-primary text-center mb-16">Stories of Renewal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Jenkins",
                location: "Portland, OR",
                quote: "The lab tests showed low iron, but LifeRX's pattern diagnosis revealed Spleen Qi Deficiency as the root cause. The Si Wu Tang formula they prescribed addressed both—my ferritin is up and my energy is back.",
                stars: 5,
                initial: "S"
              },
              {
                name: "Michael Chen",
                location: "Austin, TX",
                quote: "Creams didn't help my eczema. LifeRX identified a Damp-Heat pattern, confirmed by elevated liver enzymes. Their herbal protocol plus diet shifts cleared my skin in 3 months—and my labs improved too.",
                stars: 5,
                initial: "M"
              },
              {
                name: "Elena Rodriguez",
                location: "New York, NY",
                quote: "High cortisol, Liver Qi stagnation, and a demanding job. LifeRX's pattern-first approach gave me a framework to understand my stress. The adaptogen protocol and lifestyle shifts finally made it manageable.",
                stars: 5,
                initial: "E"
              }
            ].map((story, i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-md rounded-2xl p-2 group">
                <CardContent className="pt-8 px-6 pb-6">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(story.stars)].map((_, star) => (
                      <Star key={star} className="w-4 h-4 fill-[hsl(35,60%,60%)] text-[hsl(35,60%,60%)]" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-8 italic text-lg font-serif leading-relaxed">
                    "{story.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-lg">{story.initial}</div>
                    <div>
                      <p className="font-serif font-bold text-primary">{story.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">{story.location}</p>
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
