import { Link } from "wouter";
export function Brand({ light = false, subtitle = "INTEGRATIVE CARE", homeUrl }: { light?: boolean; subtitle?: string; homeUrl?: string }) {
  const className = `inline-flex items-center gap-3 ${light ? "text-white" : "text-primary"}`;
  const content = <>
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
          {subtitle}
        </span>
      </span>
  </>;
  return homeUrl
    ? <a href={homeUrl} aria-label="Shamba Sana home" className={className}>{content}</a>
    : <Link href="/" aria-label="Shamba Sana Integrative Care home" className={className}>{content}</Link>;
}
