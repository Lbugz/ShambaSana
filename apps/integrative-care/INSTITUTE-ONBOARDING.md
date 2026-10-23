# Institute payment and Google onboarding

## Student journey

1. Registration is saved to PostgreSQL under review. A registration receipt email job is created.
2. Each registration identifies its course, semester and learning format. Staff review prerequisites and supply confirmed cohort details and the published policy URL, including catch-up access/support arrangements where applicable. A private one-time payment invitation for that semester is created and its email is queued. Foundations live semesters and Semester 1 self-paced catch-up are $2,000 each. New other-course and missing-semester invitations are blocked until their pricing/terms are confirmed. Existing orders keep their historical amounts.
3. The student opens their private link, reviews course documents and continues to Stripe Checkout.
4. Only a verified Stripe webhook marks the payment paid. A payment confirmation and welcome checklist is queued. Redirecting back from Checkout is not payment evidence.
5. Staff verify completion of every prerequisite, select the numeric Classroom course ID and approve access. The worker creates a STUDENT invitation through the teaching account, then queues joining instructions. Students accept the invitation themselves. It does not claim automatic enrollment or acceptance.

Full refunds cancel pending payment/access jobs and queue a refund notification. Recorded refunds stop future installment collections. Staff must review/remove any existing Classroom membership separately. Partial refunds do not automatically revoke access. The finite monthly plan collects $500 at Checkout followed by three monthly $500 installments, then cancels. Automatic prerequisite grading and certificate issuance are not implemented.

### Separate semester confirmation

Completing or paying for a semester never creates or charges the next semester. The student submits a fresh semester-specific registration (or uses its preselected share link), staff review it, and the student accepts that semester's details before paying its distinct private Stripe invitation. A monthly plan uses a finite Stripe subscription schedule only for the three remaining installments in that semester. It never renews into another semester or creates a future-semester order. The final policy must define withdrawal and remaining-payment obligations explicitly.

Foundations review intake requires both the website `COURSE_FOUNDATIONS_REVIEW_OPEN=true` and backend `INSTITUTE_FOUNDATIONS_REVIEW_OPEN=true`, in addition to existing registration switches. Semester 1 accepts self-paced catch-up requests only; Semesters 2/3 accept live-online review requests. These flags do not activate payments, establish eligibility, or send live messages. Keep sandbox configuration until the separate production decision. Cohort schedules and prerequisites still require staff review.

## Current sandbox boundary

Keep `INSTITUTE_BILLING_MODE=sandbox`, `INSTITUTE_LIVE_PAYMENTS_ENABLED=false`, `INSTITUTE_LIVE_PAYMENTS_READY=false`, `INSTITUTE_LIVE_ONBOARDING_ENABLED=false` and `INSTITUTE_AUTOMATION_MODE=sandbox` while final details are pending. `BILLING_ENABLED=true` permits configured sandbox checkout. Care is sandbox-only in code; changing Institute mode or the legacy `BILLING_MODE` cannot activate Care live billing.

Sandbox automation marks jobs simulated and exposes previews only in the authenticated staff dashboard. It does not call Gmail send or change Classroom rosters. Orders created with test billing remain marked sandbox even if automation is later changed to live. They cannot trigger real emails or Classroom invitations for payment/access stages. Do not use real student admissions to verify the sandbox flow.

Final production acceptance requires a separate decision after final policies, course arrangements, Google production configuration and remaining failure/refund verification. Use the independent Institute controls below. Sandbox orders cannot become live orders; create a fresh real registration/order. Simulated jobs are never silently replayed as live messages. Live jobs are held while delivery is disabled rather than consumed as simulations.

### Production preparation — collection and delivery remain OFF

The staff billing dashboard shows **Institute production readiness**, with presence checks only; no credential values are returned. This is a preparation checklist, not a completed live acceptance test.

| Backend Railway variable | Purpose / preparation value |
| --- | --- |
| `INSTITUTE_BILLING_MODE` | Keep `sandbox`; later `live` selects dedicated Institute live credentials. |
| `INSTITUTE_STRIPE_TEST_SECRET_KEY`, `INSTITUTE_STRIPE_TEST_WEBHOOK_SECRET` | Optional explicit sandbox credentials; existing test `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` remain fallback values. |
| `INSTITUTE_STRIPE_LIVE_SECRET_KEY` | Live key entered securely by the account owner at the later credential step. Never falls back to Care or test keys. |
| `INSTITUTE_STRIPE_LIVE_WEBHOOK_SECRET` | Secret for the separate live destination: `https://care.shambasana.com/api/institute/billing/webhook/live`. |
| `INSTITUTE_LIVE_PAYMENTS_ENABLED` | Keep `false`. Explicit new-checkout gate; creating credentials alone cannot turn on payments. |
| `INSTITUTE_LIVE_PAYMENTS_READY` | Keep `false` until final commercial terms and launch acceptance are approved. |
| `INSTITUTE_LIVE_TERMS_VERSION` | Approved version identifier, without `sandbox` or `draft`. Recorded with each registration's payment consent. |
| `INSTITUTE_LIVE_WEBSITE_READY` | Keep `false` until final public policy/course copy and mobile/desktop registration are reviewed. |
| `INSTITUTE_FOUNDATIONS_1_CLASSROOM_ID` | Actual catch-up Classroom ID, different from `INSTITUTE_TEST_CLASSROOM_ID`. |
| `INSTITUTE_FOUNDATIONS_1_ORIENTATION_URL` | HTTPS joining/orientation instructions. |
| `INSTITUTE_FOUNDATIONS_1_DETAILS` | Confirmed catch-up materials, access duration, support and completion arrangements displayed in payment and welcome messages. |
| `INSTITUTE_FOUNDATIONS_1_AUTO_ACCESS_APPROVED` | Keep `false` until admission after the first successful payment is approved for Semester 1. Later semesters still require staff prerequisite/access approval. |
| `INSTITUTE_GOOGLE_PRODUCTION_READY` | Keep `false` until OAuth audience/publishing status and Workspace permissions are inspected; reconnect the teaching account as required. |
| `INSTITUTE_LIVE_ONBOARDING_ENABLED` | Keep `false`. Production sending also requires `INSTITUTE_AUTOMATION_MODE=live` and Google production readiness. |

Register the live destination with the same nine event types listed in the app README and pin its Stripe API version to `2024-06-20`, matching the retrieval code. Keep the existing shared sandbox destination unchanged. An optional dedicated test destination is `/api/institute/billing/webhook/test`. Signature, offering and environment validation are enforced separately. Already-authorized live payment webhooks can still reconcile when new checkout is disabled; turning off new collection does not itself cancel existing installment schedules.

The website obtains payment mode and consent version from the backend through its registration status endpoint. It fails closed if those settings cannot be read. Live copy is selected only when the backend reports live checkout open; current sandbox presentation stays unchanged. Public course/student-policy pages still require final content approval before setting the website-ready flag.

Before later activation: confirm Stripe account/payout/statement details; add the dedicated credentials and webhook; verify declines, missed installments, duplicate/delayed events and refund cancellation; inspect Google production configuration; replace pending public policy/course copy; deploy and review. A supervised real payment/refund and actual-course onboarding remain outstanding and need separate authorization. Do not run them as part of preparation.

## Google Cloud setup

Use a Google Cloud project controlled by the Institute / LifeRx organization:

1. Enable Gmail API and Google Classroom API. No student Google sign-in is required for payment.
2. Configure Google Auth Platform branding and audience. For a Workspace organization, an Internal application is suitable if the authorized operator belongs to that organization. Otherwise follow Google's external OAuth verification requirements. An external app left in Testing can have short-lived refresh tokens and is unsuitable for unattended production.
3. Create a Web application OAuth client. Authorized redirect URI must match exactly:
   `https://care.shambasana.com/api/institute/google/callback`
4. Save `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` securely in the backend Railway service and deploy. Never commit client secrets or paste them in chat.
5. Configure the initial staff administrator using `PRACTITIONER_EMAIL`, `PRACTITIONER_NAME`, and a user-entered `PRACTITIONER_PASSWORD` of at least 12 characters. The existing staff role has shared Care and billing access; do not give it to additional course staff without reviewing that access. Password is used only to seed a new account and does not reset an existing account.
6. Sign in at `https://care.shambasana.com/#/admin`, open Billing & enrollments, then Connect teaching mailbox. The human operator authorizes `onlineclass@liferx.us`, which must teach the relevant Classroom courses.

Scopes requested: `openid`, `email`, `gmail.send`, and `classroom.rosters`. Gmail send does not grant inbox-reading scope; Classroom roster access is needed to reconcile invitations/membership before retrying. The app verifies the authorized email using Google userinfo and rejects other accounts. No domain-wide delegation or service account is required. Google Workspace administrator policies and Classroom cross-domain restrictions still apply.

The refresh token is encrypted at rest in PostgreSQL using AES-256-GCM with a key derived from `INSTITUTE_SERVICE_TOKEN`. Outbox payloads, including private payment links, are also encrypted. Preserve this secret securely. Rotating it requires reconnecting Google and reviewing/regenerating outstanding encrypted jobs and payment invitations. Neither token nor encrypted payload is returned in dashboard listings; message previews require staff authentication. Google authorization state is short lived, single use and bound to the signed-in staff account.

## Operations and retries

### Real Google delivery check while Stripe stays sandbox

Set `INSTITUTE_TEST_CLASSROOM_ID` to a dedicated test class owned/taught by the connected mailbox. Keep `BILLING_MODE=sandbox`, `INSTITUTE_AUTOMATION_MODE=sandbox`, and `INSTITUTE_LIVE_PAYMENTS_READY=false`. Sign in as `langa@liferx.us` and use **Google delivery check**. Its recipient is fixed server-side to that address; its class is fixed to the configured ID. Each click sends the next step: receipt email, payment-invitation email, welcome email, actual student invitation, then joining-instructions email. All emails are explicitly TEST ONLY and no payment is requested. This diagnostic creates no registration, purchase or real-course entitlement and does not change the enrollment worker's sandbox safeguards.

Results and Google provider references are durable and revision-locked. Successful steps cannot be replayed for the same test class. Failures stop progression. Uncertain requests require checking Google Sent/the test class before retrying; never assume Gmail deduplicates Message-ID. Verify inbox receipt and accept the test invitation as the recipient separately. Remove the test-class environment variable after verification to disable further checks. Normal automation remains sandbox until a separate production activation decision.

The worker runs every 15 seconds in the backend process. Deterministic job IDs prevent duplicate jobs for registration, payment or access events; revision checks claim work across processes. Stored state is reconciled after restarts and duplicate Stripe deliveries. Legacy registrations are not retroactively emailed unless staff create a new invitation for them.

Gmail has no send idempotency guarantee. A timeout, server error or interrupted sending job is marked uncertain rather than automatically resent. Check Google Sent, then explicitly queue a retry if necessary. The deterministic Message-ID helps identify the message but is not treated as a delivery guarantee. HTTP 429 failures back off automatically with bounded retries. Other authorization/permission failures need staff correction before retrying. Classroom retries first check existing membership and invitations.

Sent means Google accepted the request; it does not prove inbox delivery, email reading or Classroom acceptance. Failed and uncertain jobs remain visible in Onboarding delivery. Monitor this dashboard and the teaching mailbox for bounces. Respect Gmail/Workspace quotas; this is intended for the Institute's transactional course emails, not bulk marketing.

## Verification still required before activation

- Create a synthetic registration and inspect the receipt preview.
- Create a sandbox payment invitation with clearly labeled test schedule/documents.
- Complete Stripe Checkout with a Stripe test payment method; verify the signed real Stripe event marks only the matching order paid and queues welcome.
- Verify duplicate payment events do not duplicate welcome jobs; delayed success after full refund cannot restore access.
- Simulate prerequisite approval using a test course ID and inspect Classroom/joining previews. Confirm no real messages or roster changes in sandbox.
- After human Google authorization, use a separately approved test recipient/course to verify Gmail and Classroom before live automation. A successful preview does not prove Google delivery.

Documentation: [Gmail send](https://developers.google.com/workspace/gmail/api/guides/sending), [Google scopes](https://developers.google.com/workspace/gmail/api/auth/scopes), [Classroom invitations](https://developers.google.com/workspace/classroom/guides/manage-invitations), [OAuth web server flow](https://developers.google.com/identity/protocols/oauth2/web-server), [Stripe webhooks](https://docs.stripe.com/webhooks).
