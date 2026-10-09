import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-primary">
              Shamba Sana
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Cultivating wellbeing through remote care, your health story and
              practitioner-reviewed guidance.
            </p>
            <p className="text-xs text-muted-foreground font-medium pt-2 uppercase tracking-wider">
              Remote care pilot
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/how-it-works">Our approach</Link>
              </li>
              <li>
                <Link href="/pricing">Remote care pilot</Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-emerald-700/70 hover:text-emerald-700"
                >
                  Practitioner Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard">My care</Link>
              </li>
              <li>
                <Link href="/what-we-test">What We Test</Link>
              </li>
              <li>
                <Link href="/formula-library">
                  Practitioner recommendations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-primary">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Shamba Sana.
        </div>
      </div>
    </footer>
  );
}
