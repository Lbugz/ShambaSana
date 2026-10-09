import { Link } from "wouter";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Shamba Sana home"
      className={`inline-flex items-center gap-3 ${light ? "text-white" : "text-primary"}`}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-10 w-10 shrink-0"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r="18.5"
          fill="none"
          stroke="#b2985f"
          strokeWidth="1.4"
        />
        <path
          d="M20 30V17M20 23C9 23 10 12 10 12c10 0 10 11 10 11ZM20 19c0-9 10-9 10-9s0 9-10 9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <span className="block font-serif text-xl tracking-wide">
          Shamba Sana
        </span>
        <span
          className={`block text-[9px] uppercase tracking-[.22em] ${light ? "text-white/70" : "text-muted-foreground"}`}
        >
          Cultivating wellbeing
        </span>
      </span>
    </Link>
  );
}
