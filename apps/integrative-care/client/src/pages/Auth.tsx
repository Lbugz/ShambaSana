import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/Brand";
import { ErrorMessage } from "@/components/CareLayout";
import { api, hashParams } from "@/lib/care";
import type { PublicUser } from "@shared/care";
import { SandboxNotice } from "@/components/SandboxNotice";
export default function Auth({
  practitioner = false,
}: {
  practitioner?: boolean;
}) {
  const [, navigate] = useLocation();
  const client = useQueryClient();
  const signup = !practitioner && hashParams().get("signup") === "true";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const form = new FormData(e.currentTarget);
    try {
      const data = await api<{ user: PublicUser }>(
        signup ? "/auth/register" : "/auth/login",
        "POST",
        {
          email: form.get("email"),
          password: form.get("password"),
          ...(signup ? { name: form.get("name") } : {}),
        },
      );
      client.setQueryData(["care-auth"], data);
      client.invalidateQueries({ queryKey: ["care-cases"] });
      navigate(
        data.user.role === "practitioner" ? "/admin/dashboard" : "/dashboard",
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-md md:p-10">
        <Brand />
        {!practitioner && <SandboxNotice compact />}
        <h1 className="mt-8 text-3xl">
          {practitioner
            ? "Practitioner sign-in"
            : signup
              ? "Begin your care journey"
              : "Welcome back"}
        </h1>
        <p className="my-4 text-sm leading-6 text-muted-foreground">
          {practitioner
            ? "Review intake, verify labs and release personal care reports."
            : signup
              ? "Create an account to enroll in the Shamba Sana pilot."
              : "Return to your saved intake and personal care report."}
        </p>
        <ErrorMessage error={error} />
        <form
          key={signup ? "signup" : "login"}
          onSubmit={submit}
          className="mt-6 space-y-5"
        >
          {signup && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                minLength={2}
                required
                className="mt-2"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={12}
              maxLength={128}
              required
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              At least 12 characters.
            </p>
          </div>
          <Button className="h-12 w-full rounded-full" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </Button>
        </form>
        {!practitioner && <p className="mt-5 text-xs leading-6 text-muted-foreground">Read our <Link href="/privacy" className="underline">privacy policy</Link> and <Link href="/terms" className="underline">care terms</Link> before creating an account or sharing information.</p>}
        {!practitioner && (
          <p className="mt-6 text-sm text-muted-foreground">
            {signup ? "Already have an account?" : "New to Shamba Sana?"}{" "}
            <Link
              className="font-medium text-primary underline"
              href={signup ? "/auth" : "/auth?signup=true&plan=remote-pilot"}
            >
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        )}
        <Link
          href="/"
          className="mt-6 block text-xs text-muted-foreground underline"
        >
          Back to Integrative Care
        </Link>
      </section>
    </main>
  );
}
