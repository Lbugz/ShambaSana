import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CareLayout, ErrorMessage } from "@/components/CareLayout";
import { ReportView } from "@/components/ReportView";
import {
  useAuth,
  useCases,
  useCase,
  useCaseAction,
  useCareConfig,
} from "@/lib/care";
import {
  blankReport,
  caseStatus,
  reportFields,
  type CareCase,
  type Document,
  type Extraction,
  type Report,
  type LabRow,
} from "@shared/care";

export default function AdminDashboard() {
  const auth = useAuth("practitioner");
  const cases = useCases(auth.user?.role === "practitioner");
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  if (auth.isLoading)
    return <p className="p-10">Loading the practitioner workspace…</p>;
  const filtered = cases.data?.filter((c) =>
    `${c.customerName} ${c.customerEmail} ${caseStatus(c)}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <CareLayout practitioner>
      <header className="mb-8">
        <p className="mb-3 text-xs uppercase tracking-[.2em] text-muted-foreground">
          Shamba Sana · Practitioner workspace
        </p>
        <h1 className="text-3xl md:text-4xl">Care, connected.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Verify the source, review the whole person, and release clear
          guidance.
        </p>
      </header>
      <ErrorMessage error={auth.error || cases.error} />
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside>
          <Label htmlFor="case-search">Find a care case</Label>
          <Input
            className="my-3"
            id="case-search"
            placeholder="Name, email or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            className="mb-5 w-full"
            variant="outline"
            onClick={() => cases.refetch()}
          >
            Refresh cases
          </Button>
          {cases.isLoading && <p className="text-sm">Loading cases…</p>}
          {cases.isSuccess && !filtered?.length && (
            <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              No cases to show.
            </p>
          )}
          <ul className="space-y-3">
            {filtered?.map((c) => (
              <li key={c.id}>
                <button
                  aria-pressed={selected === c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full rounded-xl border p-4 text-left ${selected === c.id ? "border-primary bg-secondary/50" : "border-border bg-card"}`}
                >
                  <span className="block text-sm font-semibold">
                    {c.customerName}
                  </span>
                  <span className="mt-1 block break-all text-xs text-muted-foreground">
                    {c.customerEmail}
                  </span>
                  <span className="mt-3 block text-xs text-primary">
                    {caseStatus(c)}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0">
          {selected ? (
            <PractitionerCase key={selected} id={selected} />
          ) : (
            <section className="rounded-2xl border border-dashed border-border p-10">
              <h2 className="text-2xl">Select a care case</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Submitted intake answers, original lab documents, verification
                and report editing are available here. AI assistance is optional
                and requires customer permission.
              </p>
            </section>
          )}
        </div>
      </div>
    </CareLayout>
  );
}
function PractitionerCase({ id }: { id: string }) {
  const query = useCase(id);
  const action = useCaseAction(id);
  const config = useCareConfig();
  const c = query.data;
  const [error, setError] = useState<unknown>();
  const [notice, setNotice] = useState("");
  const perform = async (path: string, body: unknown, method = "POST") => {
    setError(undefined);
    setNotice("");
    try {
      const result = await action.mutateAsync({ path, body, method });
      setNotice("Saved to the care record.");
      return result;
    } catch (e) {
      setError(e);
      return undefined;
    }
  };
  if (!c)
    return (
      <>
        <ErrorMessage error={query.error} />
        <p>Loading case…</p>
      </>
    );
  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-primary p-6">
        <p className="mb-3 text-xs uppercase tracking-[.15em] text-white/65">
          {c.payment.status === "unpaid-pilot" ? "Unpaid pilot" : "Integrative Care"}{" "}
          · Revision {c.revision}
        </p>
        <h2 className="text-2xl text-white">{c.customerName}</h2>
        <p className="mt-3 text-sm text-white/75">{caseStatus(c)}</p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => query.refetch()}
        >
          Refresh case
        </Button>
      </header>
      <ErrorMessage error={error || action.error} />
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      <details className="rounded-2xl border border-border bg-card p-6" open>
        <summary className="cursor-pointer font-serif text-xl">
          Health history and TCM intake
        </summary>
        <p className="mt-3 text-xs text-muted-foreground">
          {c.intakeSubmittedAt
            ? `Submitted ${new Date(c.intakeSubmittedAt).toLocaleString()}`
            : "Intake is still a draft. Reports cannot be released until it is submitted."}
        </p>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {Object.entries(c.intake)
            .filter(([key]) => key !== "schemaVersion")
            .map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs capitalize text-muted-foreground">
                  {key.replace(/([A-Z])/g, " $1")}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                  {Array.isArray(value)
                    ? value.join(", ") || "Not answered"
                    : String(value) || "Not answered"}
                </dd>
              </div>
            ))}
        </dl>
        {c.documents
          .filter((d) => d.purpose === "tongue")
          .map((d) => (
            <p key={d.id} className="mt-5 text-sm">
              <a
                className="underline"
                href={`/api/cases/${id}/documents/${d.id}`}
              >
                Download tongue photo: {d.name}
              </a>
            </p>
          ))}
        <p className="mt-5 text-xs leading-6 text-muted-foreground">
          Tongue observations are self-reported. The remote questionnaire does
          not include a measured pulse examination.
        </p>
      </details>
      {c.labRequest && (
        <LabOrder c={c} busy={action.isPending} perform={perform} />
      )}
      <section className="space-y-4">
        <h3 className="text-2xl">Lab source and verification</h3>
        {!c.documents.some((d) => d.purpose === "lab") && (
          <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            No lab documents uploaded yet.
          </p>
        )}
        {c.documents
          .filter((d) => d.purpose === "lab")
          .map((d) => (
            <LabEditor
              key={d.id}
              c={c}
              document={d}
              busy={action.isPending}
              aiAvailable={!!config.data?.ai && !!c.aiConsent}
              perform={perform}
            />
          ))}
      </section>
      <ReviewNotes c={c} busy={action.isPending} perform={perform} />
      <ReportEditor
        c={c}
        busy={action.isPending}
        aiAvailable={!!config.data?.ai && !!c.aiConsent}
        perform={perform}
      />
      {!!c.reports.length && (
        <details className="rounded-2xl border border-border bg-card p-6">
          <summary className="cursor-pointer font-serif text-xl">
            Released reports ({c.reports.length})
          </summary>
          <div className="mt-6 space-y-6">
            {c.reports.map((r) => (
              <ReportView
                key={r.id}
                report={r}
                customerName={c.customerName}
                printable={false}
              />
            ))}
          </div>
        </details>
      )}
      <details className="rounded-xl border border-border p-5">
        <summary className="cursor-pointer text-sm">Case activity</summary>
        <ol className="mt-4 space-y-3 text-xs text-muted-foreground">
          {c.events
            .slice()
            .reverse()
            .map((e, i) => (
              <li key={i}>
                {new Date(e.at).toLocaleString()} ·{" "}
                {e.action.replace(/-/g, " ")}
              </li>
            ))}
        </ol>
      </details>
    </div>
  );
}
type Perform = (
  path: string,
  body: unknown,
  method?: string,
) => Promise<CareCase | undefined>;
type PanelProps = { c: CareCase; busy: boolean; perform: Perform };
function LabOrder({ c, busy, perform }: PanelProps) {
  const [details, setDetails] = useState(c.labRequest?.details || "");
  const [reference, setReference] = useState(
    c.labRequest?.externalReference || "",
  );
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-xl">Lab order request</h3>
      <p className="my-4 text-sm leading-7 text-muted-foreground">
        Arrange testing through your laboratory or ordering system, then record
        the issued order here. Saving this form does not place an order with a
        lab.
      </p>
      <Label htmlFor="order-details">
        Ordered tests and customer instructions
      </Label>
      <Textarea
        id="order-details"
        className="my-2"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <Label htmlFor="order-reference">External order reference</Label>
      <Input
        id="order-reference"
        className="my-2"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      <Button
        className="mt-4"
        disabled={
          busy ||
          details.trim().length < 3 ||
          reference.trim().length < 2 ||
          !!c.reports.length
        }
        onClick={() =>
          perform("/lab-order", {
            revision: c.revision,
            details,
            externalReference: reference,
          })
        }
      >
        Record issued lab order
      </Button>
    </section>
  );
}
function LabEditor({
  c,
  document: d,
  busy,
  aiAvailable,
  perform,
}: PanelProps & { document: Document; aiAvailable: boolean }) {
  const empty: Extraction = {
    patientName: "",
    collectionDate: "",
    laboratory: "",
    uncertainty: "",
    results: [],
  };
  const [extraction, setExtraction] = useState<Extraction>(
    d.extraction || empty,
  );
  const [identity, setIdentity] = useState(false);
  const [note, setNote] = useState(d.verificationNote || "");
  useEffect(() => {
    setExtraction(d.extraction || empty);
    setIdentity(false);
  }, [d.extraction]);
  const changeRow = (i: number, key: keyof LabRow, value: string) =>
    setExtraction({
      ...extraction,
      results: extraction.results.map((row, j) =>
        j === i ? { ...row, [key]: value } : row,
      ),
    });
  return (
    <details open className="rounded-2xl border border-border bg-card p-6">
      <summary className="cursor-pointer break-all font-serif text-lg">
        {d.name} · {d.verifiedAt ? "Verified" : "Needs verification"}
      </summary>
      <div className="my-5 flex flex-wrap gap-3">
        <a
          className="rounded-lg border border-border px-4 py-2 text-sm underline"
          href={`/api/cases/${c.id}/documents/${d.id}`}
        >
          Download original
        </a>
        <Button
          variant="outline"
          disabled={busy || !aiAvailable || !!c.reports.length}
          onClick={() =>
            perform(`/labs/${d.id}/extract`, { revision: c.revision })
          }
        >
          {busy ? "Processing…" : "Extract lab facts with AI"}
        </Button>
      </div>
      {!aiAvailable && (
        <p className="mb-5 text-xs leading-6 text-muted-foreground">
          AI extraction needs server configuration and the customer’s AI
          permission. You can enter values from the original document below.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {(["patientName", "collectionDate", "laboratory"] as const).map(
          (key) => (
            <div key={key}>
              <Label htmlFor={`${d.id}-${key}`}>
                {key === "patientName"
                  ? "Patient name on document"
                  : key === "collectionDate"
                    ? "Collection date on document"
                    : "Laboratory"}
              </Label>
              <Input
                id={`${d.id}-${key}`}
                className="mt-2"
                value={extraction[key]}
                onChange={(e) =>
                  setExtraction({ ...extraction, [key]: e.target.value })
                }
              />
            </div>
          ),
        )}
      </div>
      <p className="my-5 text-xs leading-6 text-muted-foreground">
        Copy the original result, unit and laboratory reference interval. Do not
        substitute an “optimal” range or infer a flag that is absent from the
        source. Flag critical results for prompt clinical review.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr>
              {[
                "Marker",
                "Result",
                "Unit",
                "Reference range",
                "Source flag",
                "Page",
                "",
              ].map((t) => (
                <th className="p-2 font-medium" key={t}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {extraction.results.map((row, i) => (
              <tr key={i}>
                {(["name", "value", "unit", "referenceRange"] as const).map(
                  (key) => (
                    <td key={key} className="p-1">
                      <Input
                        aria-label={`${key} for result ${i + 1}`}
                        className="min-w-20 px-2 text-xs"
                        value={row[key]}
                        onChange={(e) => changeRow(i, key, e.target.value)}
                      />
                    </td>
                  ),
                )}
                <td className="p-1">
                  <select
                    aria-label={`Flag for result ${i + 1}`}
                    className="rounded-lg border bg-background p-2"
                    value={row.flag}
                    onChange={(e) => changeRow(i, "flag", e.target.value)}
                  >
                    {["unknown", "normal", "high", "low", "critical"].map(
                      (o) => (
                        <option key={o}>{o}</option>
                      ),
                    )}
                  </select>
                </td>
                <td className="p-1">
                  <Input
                    aria-label={`Source page for result ${i + 1}`}
                    value={row.sourcePage}
                    className="w-16 px-2 text-xs"
                    onChange={(e) => changeRow(i, "sourcePage", e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    aria-label={`Remove result ${i + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExtraction({
                        ...extraction,
                        results: extraction.results.filter((_, j) => j !== i),
                      })
                    }
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="my-4"
        onClick={() =>
          setExtraction({
            ...extraction,
            results: [
              ...extraction.results,
              {
                name: "",
                value: "",
                unit: "",
                referenceRange: "",
                flag: "unknown",
                sourcePage: "",
              },
            ],
          })
        }
      >
        Add lab result
      </Button>
      <div>
        <Label htmlFor={`${d.id}-uncertainty`}>
          Extraction uncertainties or missing information
        </Label>
        <Textarea
          id={`${d.id}-uncertainty`}
          className="mt-2"
          value={extraction.uncertainty}
          onChange={(e) =>
            setExtraction({ ...extraction, uncertainty: e.target.value })
          }
        />
      </div>
      <label className="my-5 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          checked={identity}
          onChange={(e) => setIdentity(e.target.checked)}
        />
        I checked the document’s patient identity and collection date against
        this customer, and reviewed every result against the original.
      </label>
      <Label htmlFor={`${d.id}-verification`}>Verification note</Label>
      <Textarea
        id={`${d.id}-verification`}
        className="mt-2"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Record corrections and any limitations."
      />
      <Button
        className="mt-5"
        disabled={
          busy ||
          !identity ||
          note.trim().length < 3 ||
          !extraction.results.length ||
          !!c.reports.length
        }
        onClick={() =>
          perform(
            `/labs/${d.id}/verify`,
            {
              revision: c.revision,
              extraction,
              identityConfirmed: identity,
              verificationNote: note,
            },
            "PUT",
          )
        }
      >
        Save verified lab facts
      </Button>
    </details>
  );
}
function ReviewNotes({ c, busy, perform }: PanelProps) {
  const [notes, setNotes] = useState(c.practitionerNotes);
  const [followup, setFollowup] = useState(c.followupRequest);
  useEffect(() => {
    setNotes(c.practitionerNotes);
    setFollowup(c.followupRequest);
  }, [c.practitionerNotes, c.followupRequest]);
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-5 text-xl">Practitioner review</h3>
      <Label htmlFor="practitioner-notes">Private clinical notes</Label>
      <Textarea
        id="practitioner-notes"
        className="my-2 min-h-28"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <p className="mb-5 text-xs leading-6 text-muted-foreground">
        These notes are kept out of the customer dashboard. They may be used for
        report drafting if the customer allows AI processing.
      </p>
      <Label htmlFor="followup-request">
        Information requested from the customer
      </Label>
      <Textarea
        id="followup-request"
        className="my-2"
        value={followup}
        onChange={(e) => setFollowup(e.target.value)}
      />
      <p className="mb-4 text-xs text-muted-foreground">
        This message appears in the customer dashboard. Clear it once the
        question is resolved.
      </p>
      <Button
        disabled={busy}
        onClick={() =>
          perform(
            "/review",
            {
              revision: c.revision,
              practitionerNotes: notes,
              followupRequest: followup,
            },
            "PUT",
          )
        }
      >
        Save review notes
      </Button>
    </section>
  );
}
function ReportEditor({
  c,
  busy,
  aiAvailable,
  perform,
}: PanelProps & { aiAvailable: boolean }) {
  const [content, setContent] = useState<Report>(
    c.draft?.content || blankReport,
  );
  const [approve, setApprove] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setContent(c.draft?.content || blankReport);
    setDirty(false);
    setApprove(false);
  }, [c.draft]);
  const ready =
    !!c.intakeSubmittedAt &&
    !c.followupRequest &&
    c.documents.some((d) => d.purpose === "lab") &&
    c.documents.filter((d) => d.purpose === "lab").every((d) => d.verifiedAt);
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <p className="mb-3 text-xs uppercase tracking-[.15em] text-muted-foreground">
        Practitioner-only draft
      </p>
      <h3 className="text-2xl">The combined care report</h3>
      <p className="my-4 text-sm leading-7 text-muted-foreground">
        Write in everyday language. Keep lab evidence and TCM hypotheses
        distinct. Review proposed supplements, vitamins and TCM services against
        medications, allergies and other contraindications before release.
      </p>
      {!ready && (
        <p className="mb-5 rounded-lg bg-secondary/50 p-4 text-xs leading-6">
          Submit the intake, verify every lab document and resolve follow-up
          requests to enable drafting and release.
        </p>
      )}
      <Button
        variant="outline"
        className="mb-6"
        disabled={busy || !ready || !aiAvailable}
        onClick={() => perform("/draft", { revision: c.revision, ai: true })}
      >
        {busy ? "Working…" : "Create AI-assisted draft"}
      </Button>
      {!aiAvailable && (
        <p className="mb-5 text-xs text-muted-foreground">
          Manual report editing is available. AI drafting requires customer
          permission and a configured server key.
        </p>
      )}
      <div className="space-y-6">
        {Object.entries(reportFields).map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={`report-${key}`}>{label}</Label>
            <Textarea
              className="mt-2 min-h-28"
              id={`report-${key}`}
              value={content[key as keyof Report]}
              onChange={(e) => {
                setContent({ ...content, [key]: e.target.value });
                setDirty(true);
                setApprove(false);
              }}
            />
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-6"
        disabled={busy || !ready}
        onClick={() =>
          perform("/draft", { revision: c.revision, content, ai: false })
        }
      >
        Save report draft
      </Button>
      <label className="my-6 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          checked={approve}
          onChange={(e) => setApprove(e.target.checked)}
        />
        I reviewed the verified lab source and intake, checked the
        recommendations and safety considerations, and approve this report for
        the customer.
      </label>
      <Button
        disabled={
          busy ||
          !ready ||
          !approve ||
          !c.draft ||
          dirty ||
          Object.values(content).some((v) => !v.trim())
        }
        onClick={() =>
          perform("/approve", { revision: c.revision, confirmation: true })
        }
      >
        Approve and release report
      </Button>
      {dirty && (
        <p className="mt-3 text-xs text-muted-foreground">
          Save your edits before releasing the report.
        </p>
      )}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        Release creates a saved report version in the customer’s dashboard.
        Email delivery is not configured.
      </p>
    </section>
  );
}
