import { Link } from "wouter";
import { Brand } from "../Brand";

export function Footer() {
  const linkStyle = "hover:text-primary hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
  return (
    <footer className="bg-[#eeeee5] border-t border-primary/15 mt-auto text-primary">
      <div className="mx-auto max-w-[1280px] px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <Brand homeUrl="https://www.shambasana.com/" subtitle="ANCIENT WISDOM · MODERN WELLNESS" />
            <p className="mt-4 max-w-[280px] text-sm leading-6 text-primary/75">Learning, integrative care and community wellbeing.</p>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold font-sans">Explore</h2>
            <ul className="space-y-3 text-sm text-primary/75">
              <li><a className={linkStyle} href="https://www.shambasana.com/">Shamba Sana</a></li>
              <li><a className={linkStyle} href="https://institute.shambasana.com/">Institute</a></li>
              <li><Link className={linkStyle} href="/">Integrative Care</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold font-sans">Your care</h2>
            <ul className="space-y-3 text-sm text-primary/75">
              <li><Link className={linkStyle} href="/how-it-works">How it works</Link></li>
              <li><Link className={linkStyle} href="/what-we-test">What we test</Link></li>
              <li><Link className={linkStyle} href="/pricing">Pricing</Link></li>
              <li><Link className={linkStyle} href="/auth">Member login</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm font-semibold font-sans">Information</h2>
            <ul className="space-y-3 text-sm text-primary/75">
              <li><Link className={linkStyle} href="/privacy">Care privacy policy</Link></li>
              <li><Link className={linkStyle} href="/terms">Care terms of service</Link></li>
              <li><Link className={linkStyle} href="/admin">Staff portal</Link></li>
            </ul>
            <p className="mt-4 text-xs text-primary/75">Integrative Care pilot</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-primary/15 text-xs text-primary/75 flex flex-col min-[601px]:flex-row justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Shamba Sana</p>
          <p>Ancient wisdom. Modern wellness.</p>
        </div>
      </div>
    </footer>
  );
}
