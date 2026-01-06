import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import formulaImg from "@assets/generated_images/flat_lay_herbal_formulas_on_stone.png";

const formulas = [
  {
    name: "Xiao Yao San",
    english: "Free and Easy Wanderer",
    classicalUse: "Harmonizes the Liver and Spleen, clears heat, and tonifies blood.",
    modernLens: "Often discussed when lab patterns show cortisol dysregulation, elevated liver enzymes, or stress-related digestive issues.",
    safety: "Contraindicated in cases of Yin deficiency."
  },
  {
    name: "Si Wu Tang",
    english: "Four Substance Decoction",
    classicalUse: "Nourishes Blood and regulates the Liver.",
    modernLens: "Relevance for patterns showing low Ferritin, borderline anemia, or hormonal irregularities affecting the cycle.",
    safety: "Use with caution in cases of loose stools or Spleen deficiency."
  },
  {
    name: "Gui Pi Tang",
    english: "Restore the Spleen Decoction",
    classicalUse: "Tonifies Qi and Blood, strengthens Spleen and Heart.",
    modernLens: "Correlates with insomnia, anxiety, and fatigue markers like low Vitamin B12 or D.",
    safety: "Monitor digestion during use."
  },
  {
    name: "Liu Wei Di Huang Wan",
    english: "Six Ingredient Pill with Rehmannia",
    classicalUse: "Nourishes Kidney and Liver Yin.",
    modernLens: "Frequently referenced in aging panels, menopause support, and adrenal recovery contexts.",
    safety: "Avoid during acute illness or colds."
  }
];

export default function FormulaLibrary() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-serif text-primary mb-4">Formula Intelligence</h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              An educational reference for classical formulas. These are not products for sale, but traditional tools for pattern-level intervention.
            </p>
          </header>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 mb-12 flex gap-4 items-start">
            <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-900 mb-1">Educational Context Only</h4>
              <p className="text-sm text-amber-800/80">
                The formulas listed below are for reference and discussion with your practitioner. 
                TCM formulas are precise interventions that require professional diagnosis. 
                Do not self-prescribe based on this information.
              </p>
            </div>
          </div>

          <div className="relative mb-12">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input 
              className="pl-12 h-12 rounded-full border-primary/20 bg-white shadow-sm"
              placeholder="Search formulas by name or symptom..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formulas.map((formula, i) => (
              <Card key={i} className="overflow-hidden border-border/60 hover:shadow-md transition-all">
                <CardHeader className="bg-secondary/10 border-b border-border/40 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-serif text-xl text-primary">{formula.name}</CardTitle>
                      <CardDescription className="italic mt-1 text-primary/60">{formula.english}</CardDescription>
                    </div>
                    <BookOpen className="h-5 w-5 text-primary/30" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Classical Use</h5>
                    <p className="text-sm leading-relaxed text-foreground/90">{formula.classicalUse}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Modern Lens</h5>
                    <p className="text-sm leading-relaxed text-foreground/90 bg-primary/5 p-3 rounded-lg border border-primary/10">
                      {formula.modernLens}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-emerald-700">Safety Note:</span> {formula.safety}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
