import { Link } from "wouter";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Shamba Sana home"
      className={`inline-flex items-center gap-3 ${light ? "text-white" : "text-primary"}`}
    >
      <img
        src="/shamba-logo-transparent.png"
        alt=""
        width="46"
        height="50"
        className="h-[50px] w-[46px] shrink-0 object-contain"
      />
      <span className="font-sans text-sm font-semibold tracking-[.16em] sm:text-base">
        SHAMBA SANA
        <span className="mt-1 block text-[9px] font-normal tracking-[.18em]">
          INTEGRATIVE CARE
        </span>
      </span>
    </Link>
  );
}
