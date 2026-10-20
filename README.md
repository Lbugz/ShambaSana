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

Before opening enrollment, finalize cohort dates, session times, entry requirements, student policies and the submission destination. Configure these Railway environment variables only after those details are ready:

- `COURSE_REGISTRATION_WEBHOOK_URL`: HTTPS endpoint that durably stores registration data. It must return HTTP 2xx with JSON `{ "received": true }` after successful storage. Failed or missing acknowledgement does not produce a success confirmation.
- `COURSE_REGISTRATION_OPEN`: set to `true` to open the configured courses; any other value keeps intake closed.
- `COURSE_REGISTRATION_COURSES`: optional pipe-separated list of exact course names from the catalog. Defaults to `Foundations of Chinese Medicine`. Planned courses are not enabled automatically.

The webhook receives the selected course, name, email, optional phone/time zone/message, contact consent, submission timestamp and a generated registration reference. The app does not store these records locally. The reference is returned to the student only after acknowledgement. Confirmation emails, Stripe checkout, duplicate-submission reconciliation and Classroom onboarding must be handled by a subsequent integration; they are not promised as completed actions by this site.

The registration page opens in a new tab, preselects the chosen course and preserves entered details on submission errors. Directory URLs redirect to a trailing slash so relative links remain valid.

Run with Node 22 or later: `npm start`. The server binds to `0.0.0.0` and honors Railway's `PORT`. Health endpoint: `/health`.

Deploy with Railway using the included Dockerfile and railway.json. Connect the GitHub repository as the service source and generate a Railway domain after deployment.

Artwork comes from the Shamba Sana brand book. Sanctuary renderings are labeled as concepts.
