import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-primary">LifeRX Future Co</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Bridging the gap between modern diagnostics and ancient wisdom for a complete picture of your health.
            </p>
            <p className="text-xs text-muted-foreground font-medium pt-2 uppercase tracking-wider">
              Live Platform Preview
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/why-we-fulfill">Why We Fulfill</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/admin" className="text-emerald-700/70 hover:text-emerald-700">Practitioner Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/">Live Platform Preview</Link></li>
              <li><Link href="/what-we-test">What We Test</Link></li>
              <li><Link href="/formula-library">Formula Library</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LifeRX Future Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
