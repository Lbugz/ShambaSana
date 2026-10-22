import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Brand } from "../Brand";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuToggle.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/what-we-test", label: "What We Test" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav
      aria-label="Integrative Care navigation"
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-background border-b border-border/50",
      )}
    >
      <div className="mx-auto max-w-[1280px] px-6 h-20 flex items-center justify-between min-[1200px]:grid min-[1200px]:grid-cols-[1fr_auto_1fr] gap-6">
        {/* Logo */}
        <Brand />

        {/* Desktop Nav */}
        <div className="hidden min-[1200px]:flex items-center justify-self-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all hover:text-primary relative group",
                location === link.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
              aria-current={location === link.href ? "page" : undefined}
            >
              {link.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-focus-visible:w-full",
                  location === link.href ? "w-full" : "",
                )}
              />
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden min-[1200px]:flex items-center justify-self-end gap-2">
            <Button
              asChild
              variant="outline"
              className="h-11 text-sm font-medium border-primary/20 bg-transparent hover:bg-primary/5 hover:text-primary rounded-full px-[22px]"
            >
              <Link href="/auth">Member Login</Link>
            </Button>
            <Button asChild className="h-11 font-sans rounded-full px-[22px] shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white">
              <Link href="/auth?signup=true">Get Started</Link>
            </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          ref={menuToggle}
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          aria-controls="care-mobile-navigation"
          className="min-[1200px]:hidden h-11 w-11 inline-flex items-center justify-center text-foreground hover:bg-black/5 rounded-full transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="care-mobile-navigation" className="min-[1200px]:hidden absolute top-20 left-0 w-full max-h-[calc(100dvh-80px)] overflow-y-auto bg-background/95 backdrop-blur-xl border-b border-border p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium py-3 text-foreground hover:text-primary transition-colors border-b border-border/50"
              aria-current={location === link.href ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
              <Button
                asChild
                variant="outline"
                className="w-full justify-center h-12 text-sm rounded-full border-primary/20 hover:bg-primary/5"
              >
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Member Login</Link>
              </Button>
              <Button asChild className="w-full justify-center h-12 text-sm rounded-full shadow-md">
                <Link href="/auth?signup=true" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
