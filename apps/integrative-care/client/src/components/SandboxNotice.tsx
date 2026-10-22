import { useCareConfig } from "@/lib/care";

export function SandboxNotice({ compact = false }: { compact?: boolean }) {
  const config = useCareConfig();
  if (config.data?.billingMode === "live") return null;
  return (
    <aside aria-label="Sandbox preview" className={`border border-primary/20 bg-primary/5 text-primary ${compact ? "my-5 rounded-xl p-4" : "px-6 py-3 text-center"}`}>
      <p className="text-sm font-semibold">Integrative Care · Sandbox preview</p>
      <p className="mt-1 text-xs leading-5">For demonstration only. Use test information and Stripe test payment details. No real payment is collected.</p>
    </aside>
  );
}
