export default function Policies({ kind }: { kind: "privacy" | "terms" }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-4 text-xs uppercase tracking-[.2em] text-muted-foreground">
        Shamba Sana · Pilot information
      </p>
      <h1 className="mb-8 text-4xl">
        {kind === "privacy"
          ? "Your information and privacy"
          : "About your pilot care episode"}
      </h1>
      <div className="space-y-7 text-sm leading-7 text-muted-foreground">
        {kind === "privacy" ? (
          <>
            <p>
              Your care record includes account details, questionnaire answers,
              uploaded documents, lab values and practitioner reports. Customers
              can access their own records. Practitioner accounts can access
              care records for review. Passwords are stored as salted hashes;
              the app uses a session cookie to keep you signed in.
            </p>
            <p>
              If you choose optional AI processing, your intake, lab document
              contents and assessment information may be sent to OpenAI to
              extract lab facts and draft a report. The practitioner must verify
              lab facts and approve the report. You can withdraw permission for
              future AI processing in your dashboard. Withdrawal cannot undo
              processing that has already happened.
            </p>
            <p>
              Payment details are entered in Stripe’s hosted checkout when
              payment is enabled. This app stores the payment status and
              checkout reference, rather than your card details.
            </p>
            <p>
              Downloaded lab documents and printed reports remain your
              responsibility. Discuss any correction, retention or deletion
              request with the care team. The pilot’s operating team must
              provide its privacy contact and retention arrangements before
              opening enrollment to the public.
            </p>
          </>
        ) : (
          <>
            <p>
              The remote care pilot covers one care episode: a health and TCM
              questionnaire, review of existing labs, and a
              practitioner-approved personal report. New laboratory tests,
              supplements and in-person treatments are additional services and
              are not included in this package.
            </p>
            <p>
              The pilot is for adults aged 18 and over. Provide accurate medical
              history, medications, allergies and lab documents. Your
              practitioner may request more information before completing the
              report.
            </p>
            <p>
              This app does not provide emergency monitoring. Contact local
              emergency services for an emergency. TCM hypotheses and biomedical
              findings are presented separately; the questionnaire is not a
              diagnosis.
            </p>
            <p>
              Your practitioner is responsible for reviewing recommendations and
              discussing their suitability. The care team must confirm service
              availability, appointment arrangements, cancellation and refund
              terms before accepting public paid enrollment.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
