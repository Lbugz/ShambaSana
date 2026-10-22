# Shamba Sana

Main sanctuary landing page and Institute course catalog, instructor introduction and standalone registration page. The Integrative Care application and shared billing backend live in `apps/integrative-care/`, with independent deployment and dependencies. The public links continue to use the existing Replit deployment until the new service is configured and approved for cutover.

## Unified backend and Railway migration

The care app was imported with Git history. It includes the care API, PostgreSQL storage, practitioner dashboard, and a shared Stripe ledger for care episodes and Institute course tuition. Institute and care records remain distinct. No Replit test database or customer records were imported.

- Keep the existing website service rooted at `/` with its existing Dockerfile.
- Add a second service sourced from this repository with root directory `/apps/integrative-care`, Dockerfile `Dockerfile`, healthcheck `/health`, and watch paths `/apps/integrative-care/**`.
- Give the backend its own PostgreSQL service and a private `DATABASE_URL` reference. Enable backups and verify restoration before real records are used.
- Configure the backend variables from `apps/integrative-care/.env.example`. Production requires a public HTTPS `APP_BASE_URL` and PostgreSQL. Set the practitioner credentials securely in Railway; do not put them in Git or chat.
- Keep `BILLING_ENABLED=false`, `PILOT_MODE=false`, and `INSTITUTE_REGISTRATION_OPEN=false` until configuration and validation are complete. A Railway temporary domain can be used before buying custom domains.
- Configure one Stripe event destination at `https://BACKEND/api/billing/webhook`, listening to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded`. Both offerings use this destination and Stripe account. Use test-mode Stripe keys first.
- To receive Institute registrations, set the website's `COURSE_REGISTRATION_WEBHOOK_URL` to `https://BACKEND/api/institute/registrations`; set `COURSE_REGISTRATION_SERVICE_TOKEN` to the same secret as backend `INSTITUTE_SERVICE_TOKEN` (at least 32 random characters). Open only finalized courses on both services using their separate open flags and course lists.
- Staff sign in at backend `/#/admin`, then open Billing & enrollments. After reviewing a registration, enter confirmed cohort dates/session times and a published policy URL on the configured Institute origin. Create and privately share a payment invitation. The student explicitly accepts those policies before checkout. Email delivery and Classroom onboarding remain manual.
- Course tuition is fixed server-side at $1,350, paid in full. The earlier three-payment option remains a proposal; installment billing is not implemented. Care episode price remains controlled by `PILOT_PRICE_CENTS` (default $499).
- The backend's versioned startup migrations manage its actual `shamba_records` schema; the obsolete Drizzle `db:push` command has been removed. Initial data may be re-entered using synthetic examples. Do not point this deployment at an unknown legacy database.

The payment ledger and case/enrollment fulfillment use durable revision checks and retryable reconciliation. Ledger event receipts are saved only after fulfillment, so replay can recover interrupted handling. Full refunds are terminal; delayed success events cannot restore paid access. Multi-record uploads still need transactional hardening. Account recovery, email verification, practitioner MFA, expanded staff roles, and durable shared rate limits remain release follow-ups.

Before switching links, validate production startup, private DB connectivity, backups, role permissions, complete synthetic care and Institute journeys, and Stripe duplicate/out-of-order event handling. This migration does not itself enable paid enrollment or assert that the service has been deployed.

## Course registration

Registration is closed by default, including in local file previews. The page checks `GET /api/course-registration/status` before enabling personal details or submission. Courses not explicitly open stay closed.

Registration intake can open for the announced Spring and Summer terms while final schedules and policies are being prepared. Registrations remain under review and do not reserve a place. Finalize schedules, student policies and enrollment terms before accepting payment or confirming admission. Configure the durable submission destination and both services before enabling intake:

- `COURSE_REGISTRATION_WEBHOOK_URL`: HTTPS endpoint that durably stores registration data. It must return HTTP 2xx with JSON `{ "received": true }` after successful storage. Failed or missing acknowledgement does not produce a success confirmation.
- `COURSE_REGISTRATION_OPEN`: set to `true` to open the configured courses; any other value keeps intake closed.
- `COURSE_REGISTRATION_SERVICE_TOKEN`: reference the backend's `INSTITUTE_SERVICE_TOKEN` in Railway as `${{Shamba-Backend.INSTITUTE_SERVICE_TOKEN}}`; do not copy secrets into source or chat.
- `COURSE_REGISTRATION_COURSES`: pipe-separated list of exact course names. Defaults to `The Psyche in Chinese Medicine|Advanced Diagnosis & Treatment` for Spring and Summer 2027. Fall 2026 Foundations is closed and is rejected even if an old environment value includes it. The master open flag and delivery configuration are still required.

### Institute 2026–2027 enrollment update

- Public course availability: Foundations (Fall 2026) closed; Psyche (Spring 2027) and Advanced Diagnosis & Treatment (Summer 2027) open for registration, subject to prerequisite review. Exact dates and hours remain unconfirmed. Tuition stays $1,350 per course.
- Deploy both the website and `apps/integrative-care` changes together. Registration now includes a server-derived `term`, `foundationsStatus`, optional `psycheStatus` (required for Course III), `priorCohort` and `prerequisiteAcknowledgement`. The backend validates and stores these fields, and staff can review them in Billing and course enrollments. Legacy enrollments remain readable.
- Existing Railway allowlists must both be updated to `The Psyche in Chinese Medicine|Advanced Diagnosis & Treatment`: `COURSE_REGISTRATION_COURSES` on the website and `INSTITUTE_OPEN_COURSES` on the backend. Do not assume the new defaults overwrite existing environment variables.
- Online submission still requires the shared service token, durable webhook and both registration flags. The form explains temporary submission unavailability when these are not configured; public term availability alone does not enable data collection or payments.
- Payment invitations require staff prerequisite review, with its timestamp saved. Review may document conditions for a student still completing earlier courses; this is not an automatic academic completion check. Staff must verify completion before final admission/course start.
- `public/institute/student-information.html` is a program summary, not final enrollment terms. Do not use it as the final payment policy document. Confirm schedules, hours, financial policies, administrative contacts and the enrollment agreement before issuing payment invitations. No installment billing or automated classroom/email onboarding is added by this update.

The webhook receives the selected course, name, email, optional phone/time zone/message, contact consent, submission timestamp and a generated registration reference. The app does not store these records locally. The reference is returned to the student only after acknowledgement. Confirmation emails, Stripe checkout, duplicate-submission reconciliation and Classroom onboarding must be handled by a subsequent integration; they are not promised as completed actions by this site.

The registration page opens in a new tab, preselects the chosen course and preserves entered details on submission errors. Directory URLs redirect to a trailing slash so relative links remain valid.

### Registration activation checklist

1. Backend: create `INSTITUTE_SERVICE_TOKEN` securely (at least 32 random characters), set `INSTITUTE_OPEN_COURSES=The Psyche in Chinese Medicine|Advanced Diagnosis & Treatment`, and set `INSTITUTE_REGISTRATION_OPEN=true`. Deploy and confirm `/health` is healthy.
2. Website: set `COURSE_REGISTRATION_WEBHOOK_URL=https://care.shambasana.com/api/institute/registrations`, the shared token reference above, the same course allowlist in `COURSE_REGISTRATION_COURSES`, and `COURSE_REGISTRATION_OPEN=true`. Deploy.
3. Submit a clearly labeled synthetic learner registration through the public form. A receipt reference is returned only after the backend stores the enrollment in PostgreSQL. Check both course selections; Course III asks for Course II status, while Foundations remains unavailable.
4. Configure the practitioner identity securely in Railway before staff use `https://care.shambasana.com/#/admin` → Billing & enrollments. Review registrations there; receipt alone does not send an email or confirm admission. Set an operational admissions contact before inviting public registrations.
5. Keep `BILLING_ENABLED=false` until final schedules, financial policies and enrollment terms are published and the separate Stripe sandbox flow has been verified. Registration intake does not require enabling payments.

Course cards emphasize the open terms and link to the student information page for full outlines. Direct course links expand the relevant outline. Personal details remain disabled until the selected course is available, and the optional message field asks students to avoid health information.

Run with Node 22 or later: `npm start`. The server binds to `0.0.0.0` and honors Railway's `PORT`. Health endpoint: `/health`.

Deploy with Railway using the included Dockerfile and railway.json. Connect the GitHub repository as the service source and generate a Railway domain after deployment.

Artwork comes from the Shamba Sana brand book. Sanctuary renderings are labeled as concepts.
