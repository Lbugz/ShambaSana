import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Brand } from "./Brand";
import { Button } from "./ui/button";
import { api } from "@/lib/care";
import { useState } from "react";

export function ErrorMessage({ error }: { error: unknown }) {
  return error ? (
    <p
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
    >
      {error instanceof Error ? error.message : String(error)}
    </p>
  ) : null;
}
export function CareLayout({
  children,
  practitioner = false,
}: {
  children: ReactNode;
  practitioner?: boolean;
}) {
  const [, navigate] = useLocation();
  const client = useQueryClient();
  const [error, setError] = useState<unknown>();
  const signout = async () => {
    try {
      await api("/auth/logout", "POST", {});
      client.clear();
      navigate(practitioner ? "/admin" : "/auth");
    } catch (e) {
      setError(e);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Brand />
          <div className="flex items-center gap-3">
            <Link
              className="text-sm hover:underline"
              href={practitioner ? "/admin/dashboard" : "/dashboard"}
            >
              {practitioner ? "Care workspace" : "My care"}
            </Link>
            <Button variant="ghost" onClick={signout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <ErrorMessage error={error} />
        {children}
      </main>
      <p className="mx-auto max-w-6xl px-5 py-8 text-xs text-muted-foreground print:hidden">
        Shamba Sana remote care pilot. This service is not monitored for
        emergencies.
      </p>
    </div>
  );
}
