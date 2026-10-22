# Institute payment and Google onboarding

## Student journey

1. Registration is saved to PostgreSQL under review. A registration receipt email job is created.
2. Staff review prerequisites and supply cohort details and the published policy URL. A private $1,350 USD Stripe payment invitation is created and its email is queued.
3. The student opens their private link, reviews course documents and continues to Stripe Checkout.
4. Only a verified Stripe webhook marks the payment paid. A payment confirmation and welcome checklist is queued. Redirecting back from Checkout is not payment evidence.
5. Staff verify completion of every prerequisite, select the numeric Classroom course ID and approve access. The worker creates a STUDENT invitation through the teaching account, then queues joining instructions. Students accept the invitation themselves. It does not claim automatic enrollment or acceptance.

Full refunds cancel pending payment/access jobs and queue a refund notification. Staff must review/remove any existing Classroom membership separately. Partial refunds do not automatically revoke access. This version does not implement installments, automatic prerequisite grading or certificate issuance.

## Current sandbox boundary

Keep `BILLING_MODE=sandbox`, `INSTITUTE_LIVE_PAYMENTS_READY=false` and `INSTITUTE_AUTOMATION_MODE=sandbox` while schedules and final enrollment/refund terms are pending. `BILLING_ENABLED=true` enables test checkout only when a test key is configured. This is a shared billing switch, but public Care intake stays closed with `PILOT_MODE=false`.

Sandbox automation marks jobs simulated and exposes previews only in the authenticated staff dashboard. It does not call Gmail send or change Classroom rosters. Orders created with test billing remain marked sandbox even if automation is later changed to live. They cannot trigger real emails or Classroom invitations for payment/access stages. Do not use real student admissions to verify the sandbox flow.

Final production acceptance requires a separate decision after final policies, dates, Google connection and sandbox verification. Set `BILLING_MODE=live` with new live Stripe credentials/webhook, `INSTITUTE_LIVE_PAYMENTS_READY=true`, and `INSTITUTE_AUTOMATION_MODE=live` only then. Sandbox orders cannot be paid using live keys; create a fresh real registration/order. Simulated jobs are never silently replayed as live messages.

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
