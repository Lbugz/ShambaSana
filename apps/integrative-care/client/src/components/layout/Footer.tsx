import { Link } from "wouter";
import { Brand } from "../Brand";
import { useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";

function FooterGroup({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <section className="border-b border-primary/15 min-[640px]:border-0">
    <h2 className="text-sm font-semibold font-sans min-[640px]:mb-4">
      <span className="hidden min-[640px]:inline">{title}</span>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center justify-between text-left min-[640px]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        {title}{open ? <Minus aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
      </button>
    </h2>
    <div id={id} className={`${open ? "block" : "hidden"} pb-4 min-[640px]:block min-[640px]:pb-0`}>{children}</div>
  </section>;
}

export function Footer() {
  const linkStyle = "inline-flex items-center min-h-11 min-[640px]:min-h-0 hover:text-primary hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
  return (
    <footer className="bg-[#eeeee5] border-t border-primary/15 mt-auto text-primary">
      <div className="mx-auto max-w-[1280px] px-6 pt-12 pb-6">
        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-[1.5fr_1fr_1fr_1fr] min-[640px]:gap-10">
          <div className="mb-6 min-[640px]:mb-0">
            <Brand homeUrl="https://www.shambasana.com/" subtitle="ANCIENT WISDOM · MODERN WELLNESS" />
            <p className="mt-4 max-w-[280px] text-sm leading-6 text-primary/75">Learning, integrative care and community wellbeing.</p>
          </div>
          <FooterGroup title="Explore" id="care-footer-explore">
            <ul className="space-y-3 text-sm text-primary/75">
              <li><a className={linkStyle} href="https://www.shambasana.com/">Shamba Sana</a></li>
              <li><a className={linkStyle} href="https://institute.shambasana.com/">Institute</a></li>
              <li><Link className={linkStyle} href="/">Integrative Care</Link></li>
            </ul>
          </FooterGroup>
          <FooterGroup title="Your care" id="care-footer-your-care">
            <ul className="space-y-3 text-sm text-primary/75">
              <li><Link className={linkStyle} href="/how-it-works">How it works</Link></li>
              <li><Link className={linkStyle} href="/what-we-test">Lab guide</Link></li>
              <li><Link className={linkStyle} href="/pricing">Pricing</Link></li>
              <li><Link className={linkStyle} href="/auth">Member login</Link></li>
            </ul>
          </FooterGroup>
          <FooterGroup title="Information" id="care-footer-information">
            <ul className="space-y-3 text-sm text-primary/75">
              <li><Link className={linkStyle} href="/privacy">Care privacy policy</Link></li>
              <li><Link className={linkStyle} href="/terms">Care terms of service</Link></li>
              <li><Link className={linkStyle} href="/admin">Staff portal</Link></li>
            </ul>
            <p className="mt-4 text-xs text-primary/75">Integrative Care pilot</p>
          </FooterGroup>
        </div>
        <div className="mt-10 pt-6 border-t border-primary/15 text-xs text-primary/75 flex flex-col min-[601px]:flex-row justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} Shamba Sana</p>
          <p>Ancient wisdom. Modern wellness.</p>
        </div>
      </div>
    </footer>
  );
}
