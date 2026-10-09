import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardList,
  FlaskConical,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { ReportView } from "@/components/ReportView";
import {
  useAuth,
  useCases,
  useCase,
  useCaseAction,
  useCareConfig,
  api,
  money,
  uploadDocument,
} from "@/lib/care";
import { caseStatus, type CareCase } from "@shared/care";

export default function Dashboard() {
  const auth = useAuth("customer");
  const cases = useCases(auth.user?.role === "customer");
  const config = useCareConfig();
  const client = useQueryClient();
  const [selected, setSelected] = useState("");
  const [consent, setConsent] = useState(false);
  const [newCase, setNewCase] = useState(false);
  const enroll = useMutation({
    mutationFn: (pilot: boolean) =>
      api<CareCase>("/cases", "POST", { consent, pilot }),
    onSuccess: (c) => {
      client.invalidateQueries({ queryKey: ["care-cases"] });
      client.setQueryData(["care-case", c.id], c);
      setSelected(c.id);
      setNewCase(false);
    },
  });
  if (auth.isLoading)
    return <p className="p-10">Loading your care workspace…</p>;
  return (
    <CareLayout>
      <ErrorMessage error={auth.error || cases.error || config.error} />
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
            Your Shamba Sana care
          </p>
          <h1 className="text-3xl md:text-4xl">
            Welcome, {auth.user?.name.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your story, labs and next steps—in one place.
          </p>
        </div>
        {!!cases.data?.length && (
          <Button variant="outline" onClick={() => setNewCase(!newCase)}>
            {newCase ? "Return to my case" : "Start another care episode"}
          </Button>
        )}
      </div>
      {cases.isLoading && <p>Loading your care records…</p>}
      {cases.isSuccess && (!cases.data.length || newCase) ? (
        <section className="max-w-2xl rounded-2xl border border-border bg-card p-7">
          <h2 className="text-2xl">Enroll in the remote care pilot</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            A TCM intake, review of existing labs and a practitioner-approved
            report.{" "}
            {config.data && (
              <strong className="text-primary">
                {money(config.data.amount)} for one care episode.
              </strong>
            )}{" "}
            New tests and treatments are separate.
          </p>
          <label className="my-6 flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span>
              I am 18 or older and understand the pilot’s{" "}
              <Link className="underline" href="/terms">
                care scope
              </Link>{" "}
              and{" "}
              <Link className="underline" href="/privacy">
                information practices
              </Link>
              . I agree to provide my intake and labs for practitioner review.
            </span>
          </label>
          <ErrorMessage error={enroll.error} />
          <div className="mt-5 flex flex-wrap gap-3">
            {config.data?.checkout && (
              <Button
                disabled={!consent || enroll.isPending}
                onClick={() => enroll.mutate(false)}
              >
                Enroll and continue to payment
              </Button>
            )}
            {config.data?.pilot && (
              <Button
                variant={config.data.checkout ? "outline" : "default"}
                disabled={!consent || enroll.isPending}
                onClick={() => enroll.mutate(true)}
              >
                Start unpaid pilot
              </Button>
            )}
          </div>
          {!config.data?.checkout && (
            <p className="mt-4 text-xs text-muted-foreground">
              Paid enrollment is not available yet.
            </p>
          )}
          {config.data?.pilot && (
            <p className="mt-4 text-xs text-muted-foreground">
              The unpaid pilot records a care episode without charging you.
            </p>
          )}
        </section>
      ) : (
        !!cases.data?.length && (
          <>
            <div className="mb-6">
              <label
                htmlFor="case-select"
                className="mr-3 text-xs text-muted-foreground"
              >
                Care episode
              </label>
              <select
                id="case-select"
                className="rounded-lg border border-border bg-card p-2 text-sm"
                value={selected || cases.data[0].id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {cases.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {new Date(c.createdAt).toLocaleDateString()} ·{" "}
                    {caseStatus(c)}
                  </option>
                ))}
              </select>
            </div>
            <CustomerCase
              key={selected || cases.data[0].id}
              id={selected || cases.data[0].id}
            />
          </>
        )
      )}
    </CareLayout>
  );
}
function CustomerCase({ id }: { id: string }) {
  const query = useCase(id);
  const action = useCaseAction(id);
  const config = useCareConfig();
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState("");
  const [reportId, setReportId] = useState("");
  const c = query.data;
  const perform = async (path: string, body: unknown) => {
    setError(undefined);
    setNotice("");
    try {
      await action.mutateAsync({ path, body });
      setNotice("Your care record has been updated.");
    } catch (e) {
      setError(e);
    }
  };
  const checkout = async () => {
    if (!c) return;
    setError(undefined);
    try {
      const r = await api<{ url: string }>(`/cases/${c.id}/checkout`, "POST", {
        revision: c.revision,
      });
      window.location.assign(r.url);
    } catch (e) {
      setError(e);
    }
  };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !c) return;
    setError(undefined);
    try {
      await action.mutateAsync({
        path: "/documents",
        body: await uploadDocument(file, "lab", c.revision),
      });
      setNotice("Your lab document was uploaded for review.");
    } catch (e) {
      setError(e);
    }
    e.target.value = "";
  };
  if (!c)
    return (
      <>
        <ErrorMessage error={query.error} />
        <p>Loading your case…</p>
      </>
    );
  const labs = c.documents.filter((d) => d.purpose === "lab");
  const completed = !!c.reports.length;
  const pending = c.payment.status === "pending";
  const milestones = [
    { label: "Enrollment", done: !pending },
    { label: "Your intake", done: !!c.intakeSubmittedAt },
    {
      label: "Labs verified",
      done: !!labs.length && labs.every((d) => d.verifiedAt),
    },
    { label: "Report released", done: completed },
  ];
  const report = c.reports.find((r) => r.id === reportId) || c.reports.at(-1);
  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-primary p-7 text-white">
        <p className="mb-3 text-xs uppercase tracking-[.16em] text-white/65">
          {c.payment.status === "unpaid-pilot"
            ? "Unpaid pilot case"
            : "Remote care case"}
        </p>
        <h2 className="text-2xl text-white">{caseStatus(c)}</h2>
        <ol className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {milestones.map(({ label, done }, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${done ? "border-white/40 bg-white/15" : "border-white/25 text-white/55"}`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </section>
      <ErrorMessage error={error || action.error} />
      {notice && (
        <p role="status" className="text-sm text-primary">
          {notice}
        </p>
      )}
      {c.followupRequest && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h3 className="text-lg">Your practitioner needs more information</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
            {c.followupRequest}
          </p>
        </section>
      )}
      {pending ? (
        <section className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-xl">Complete enrollment</h3>
          <p className="my-4 text-sm text-muted-foreground">
            Your intake opens after payment is confirmed.{" "}
            {money(c.payment.amount)} for this care episode.
          </p>
          <Button
            onClick={checkout}
            disabled={action.isPending || !config.data?.checkout}
          >
            Continue to secure checkout
          </Button>
          <Button
            className="ml-3"
            variant="outline"
            onClick={() => query.refetch()}
          >
            Check payment status
          </Button>
        </section>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-7">
            <ClipboardList className="mb-5 h-7 w-7 text-primary/70" />
            <h3 className="text-xl">Your health and TCM intake</h3>
            <p className="my-4 text-sm leading-7 text-muted-foreground">
              {c.intakeSubmittedAt
                ? "Your questionnaire is saved and submitted. Your practitioner can review your full answers."
                : "Share your medical history, symptoms, routines and TCM-related observations. You can save and return."}
            </p>
            {!completed && (
              <Link href={`/tcm-assessment?case=${c.id}`}>
                <Button variant="outline">
                  {c.intakeSubmittedAt
                    ? "Review or update intake"
                    : "Continue your intake"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </section>
          <section className="rounded-2xl border border-border bg-card p-7">
            <FlaskConical className="mb-5 h-7 w-7 text-primary/70" />
            <h3 className="text-xl">Your lab documents</h3>
            <p className="my-4 text-sm leading-7 text-muted-foreground">
              Upload existing results as PDF, JPG, PNG, WebP, text or CSV. Up to
              5 MB per file.
            </p>
            <ul className="space-y-3">
              {labs.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap justify-between gap-2 rounded-lg bg-secondary/30 p-3 text-sm"
                >
                  <a
                    className="max-w-full break-all underline"
                    href={`/api/cases/${c.id}/documents/${d.id}`}
                  >
                    {d.name}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {d.verifiedAt
                      ? "Verified by practitioner"
                      : "Awaiting verification"}
                  </span>
                  {!completed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={action.isPending}
                      onClick={() =>
                        action.mutate({
                          path: `/documents/${d.id}`,
                          method: "DELETE",
                          body: { revision: c.revision },
                        })
                      }
                    >
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {!completed && (
              <>
                <label
                  className="mt-5 block text-sm font-medium"
                  htmlFor="lab-upload"
                >
                  Add a lab document
                </label>
                <input
                  id="lab-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv"
                  onChange={upload}
                  disabled={action.isPending}
                  className="mt-2 block max-w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2"
                />
                <div className="mt-6 border-t border-border pt-5">
                  {!c.labRequest ? (
                    <Button
                      variant="outline"
                      disabled={action.isPending}
                      onClick={() =>
                        perform("/lab-request", { revision: c.revision })
                      }
                    >
                      Request new lab tests
                    </Button>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        {c.labRequest.status === "ordered"
                          ? "External lab order recorded"
                          : "Lab order request received"}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {c.labRequest.details ||
                          "Your practitioner will determine appropriate testing and arrange the order. Laboratory fees are separate."}
                      </p>
                      {c.labRequest.externalReference && (
                        <p className="mt-2 text-xs">
                          Order reference: {c.labRequest.externalReference}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {!pending && (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-xl">Optional AI assistance</h3>
          <p className="my-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            With your permission, lab document contents and your intake may be
            sent to OpenAI to extract lab facts and draft a report. Your
            practitioner verifies the facts and approves the final report. You
            can continue with manual review and withdraw permission for future
            processing.
          </p>
          <Button
            variant="outline"
            disabled={action.isPending}
            onClick={() =>
              perform("/ai-consent", {
                revision: c.revision,
                consent: !c.aiConsent,
              })
            }
          >
            {c.aiConsent
              ? "Withdraw AI permission"
              : "Allow AI-assisted processing"}
          </Button>
          <span className="ml-3 text-xs text-muted-foreground">
            {c.aiConsent ? "Permission granted" : "Manual review selected"}
          </span>
        </section>
      )}
      {report ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <FileCheck2 className="h-5 w-5" />
            <h2 className="text-2xl">Your approved care report</h2>
            {c.reports.length > 1 && (
              <select
                aria-label="Report version"
                value={report.id}
                onChange={(e) => setReportId(e.target.value)}
                className="rounded-lg border bg-card p-2 text-sm"
              >
                {c.reports.map((r, i) => (
                  <option value={r.id} key={r.id}>
                    Version {i + 1} ·{" "}
                    {new Date(r.approvedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
          </div>
          <ReportView report={report} customerName={c.customerName} />
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-border p-7">
          <h3 className="text-xl">Your report will appear here</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            After your intake and labs are reviewed, your practitioner will
            release your personal report. Unapproved drafts are kept in the
            practitioner workspace.
          </p>
        </section>
      )}
    </div>
  );
}
