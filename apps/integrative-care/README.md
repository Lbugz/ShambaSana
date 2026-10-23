# Shamba Sana Integrative Care pilot

A connected pilot for one integrative care episode: account and enrollment, saved TCM intake, private lab documents, practitioner verification, editable assessment, and a released customer report.

The Gateway app is the primary service. The separate Medical I Ching repository supplies questionnaire concepts only; it is not a dependency and its patient queue is not imported.

## Run and verify

```sh
npm ci
npm run dev
```

Development serves the frontend and API together on port 5000. Without `DATABASE_URL`, synthetic development records persist in the ignored `.data/care.json` file. This single-process file store is for development only. The server automatically uses PostgreSQL when `DATABASE_URL` is supplied and requires it in production.

```sh
npm run check
npm test
npm run build
```

The integration suite covers authentication and role enforcement, ownership of private documents, complete intake persistence, lab verification, consent, schema-validated AI responses, private drafts, report approval and version preservation, concurrent saves, signed payment webhooks and refunds. It makes no real AI requests or charges. Set `SHAMBA_TEST_DATABASE_URL` to a disposable PostgreSQL database to run the same suite against PostgreSQL. Do not point tests at the care database.

## Railway and shared billing

This app is now maintained inside the Shamba Sana repository at `apps/integrative-care/`. Follow the root README for the Railway service, private PostgreSQL database, shared Institute payment flow and production opening flags. The code import includes the original history, not the disposable Replit test records. The Replit instructions below are retained as historical deployment context.

The backend uses one Stripe configuration and a durable purchase ledger for care episodes and semester tuition. Staff access `/#/admin/billing`; students receive private `/#/course-payment` invitations after cohort/policy review. Production checkout requires `BILLING_ENABLED=true` and matching `BILLING_MODE` / Stripe key type. Foundations live semesters and Semester 1 self-paced catch-up cost $2,000 each; each semester needs separate confirmation and one-time payment. Other-course prices remain pending, so new invitations are blocked for those offerings. Existing orders retain their recorded amounts. No automatic renewal or installment billing is implemented. Register `/api/billing/webhook` in Stripe; `/api/stripe/webhook` is an alias. Preserve this service's secrets separately from the public website service. See [Institute payment and Google onboarding](INSTITUTE-ONBOARDING.md) for Gmail/Classroom setup, sandbox previews, staff prerequisite review, delivery status and retries. This integration is disabled by default.

The real database schema is versioned in `server/migrations.ts` and applied transactionally on startup. The previous template `db:push` script has been removed; `shared/schema.ts` and `server/storage.ts` are unused legacy templates, not the active care persistence layer.

## Historical Replit deployment

This app requires a running Node server. `.replit` starts `npm run dev` in the workspace. For publishing it selects Autoscale using Replit's `deploymentTarget = "cloudrun"`, builds with `npm run build`, and runs `npm run start`. Static hosting cannot run private care APIs or use server secrets.

For an app previously published as Static, open **Publishing → Adjust settings** and select **Autoscale**. Confirm the build command is `npm run build`, the run command is `npm run start`, and the server port is 5000. Pull the latest Git changes before republishing. Verify the production database and the deployment secrets below are present in the published environment. Changing `.replit` alone may not change an existing publishing configuration. See [Replit deployment types](https://docs.replit.com/features/publishing/deployment-types) and [app configuration](https://docs.replit.com/features/project-setup/configuration).

Configure these in Replit Secrets or its server environment, never in Git:

| Variable                | Purpose                                                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Durable PostgreSQL care records, sessions and private document contents. Required in production.                                                                             |
| `APP_BASE_URL`          | Public HTTPS origin, such as `https://newhealth.replit.app`. Required in production; used for origin checks and checkout return URLs.                                        |
| `PRACTITIONER_EMAIL`    | Reserves and seeds the first practitioner identity.                                                                                                                          |
| `PRACTITIONER_PASSWORD` | At least 12 characters. Used to create the practitioner account on its first startup, then stored as a salted hash. Changing this secret does not reset an existing account. |
| `PRACTITIONER_NAME`     | Practitioner name displayed on approved reports.                                                                                                                             |
| `OPENAI_API_KEY`        | Existing server-side OpenAI key. Never read by frontend code.                                                                                                                |
| `OPENAI_MODEL`          | Optional; defaults to `gpt-4.1-mini`. Must support Responses, structured outputs, PDFs and image input.                                                                      |
| `PILOT_MODE`            | Set `true` for an explicitly unpaid pilot route. Production defaults to paid enrollment only.                                                                                |
| `PILOT_PRICE_CENTS`     | Canonical price for a care episode; defaults to `49900` ($499). New lab tests and treatments are separate. This pilot price needs commercial validation.                     |
| `STRIPE_SECRET_KEY`     | Optional hosted checkout integration. Use Stripe test mode during the pilot.                                                                                                 |
| `STRIPE_WEBHOOK_SECRET` | Required with Stripe checkout to confirm payment.                                                                                                                            |

Replit's `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` are also recognized when a direct OpenAI key is absent. The configured provider must implement `/responses`; a Chat Completions-only gateway needs an adapter. Key presence in `/api/config` is not a successful AI request. Provider errors leave the care record unchanged and manual review remains available.

Create a Stripe webhook for `/api/stripe/webhook` with `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `subscription_schedule.canceled`, `subscription_schedule.completed` and `subscription_schedule.aborted`. Payment stays pending until a correctly signed webhook matches the order, amount, currency and checkout session. A checkout return URL does not mark payment successful. Repeated checkout requests reuse an open session; full refunds block further care actions. Partial refund decisions remain operational.

### Institute semester payments — production preparation, live collection OFF

Foundations Semester 1 registrations with explicit payment consent can proceed directly to sandbox Checkout. Later semesters still require staff verification; Course II/III remain price-blocked. The website forwards the chosen `full` or `monthly` plan, `paymentConsent` and `paymentTermsVersion=sandbox-semester-4x500-v1` through the authenticated registration service. The server sets prices; browser-supplied amounts are never accepted. Existing registrations and Care billing retain their earlier flow.

- Full: one $2,000 payment.
- Monthly: $500 collected in Checkout with card saving for the agreed off-session installments. After the signed payment event, a subscription schedule is created for exactly three remaining $500 monthly invoices, with `end_behavior=cancel` at creation. No next-semester order is created. The first scheduled date is one calendar month after the initial PaymentIntent creation, clamped to month end. Late-start payments can extend beyond class dates; this is disclosed in registration and Checkout.
- Orders record actual collected/refunded amounts separately from total tuition. A successful first installment enables the simulated welcome flow; it is never described as full tuition paid. Invoice and schedule events reconcile the remaining balance and failed/stopped plans. A recorded refund stops future scheduled collections and flags the plan for staff review.
- Institute mode and credentials are independent from Care, which remains sandbox-only. Live checkout requires dedicated live credentials, approved/versioned terms, actual course/access information, website approval and an explicit enable flag. Live email/Classroom delivery has independent enable and Google production-readiness gates. All activation flags remain off during preparation. See [production configuration](INSTITUTE-ONBOARDING.md#production-preparation--collection-and-delivery-remain-off) for the canonical variables and dedicated live webhook route. Test clocks and test records cannot be converted to live payments or delivery.

Before a sandbox payment rehearsal, ensure the webhook subscribes to all events above. Verify full payment, all four installments using Stripe test clocks, declines/retries, cancelled checkout, duplicate/out-of-order webhooks, and refunds. These rehearsals are separate from compilation and visual review. Before live launch, confirm installment dates/count, late-start rules, collection/cancellation/refund terms and support procedures, then implement and review live activation. Do not migrate the draft automatically to live billing.

The app creates its own `shamba_records` table and owner index on startup, without changing the original Drizzle `users` table. Back up the PostgreSQL database using the hosting provider's supported process. Uploaded documents are stored as private records and downloaded through authenticated case routes; there is no public uploads directory.

After deployment, `/api/config` should return JSON, anonymous `/api/cases` should return a JSON 401, and the homepage should say Shamba Sana. HTML or a 404 page at `/api/config` indicates that the care server is not serving the published app. Sign in to `/#/admin` using the configured practitioner account. Confirm a synthetic customer journey before uploading real pilot records.

## Pilot journey

1. Create a customer account through `/#/auth?signup=true&plan=remote-pilot`.
2. Accept the pilot scope and information practices. Enroll through configured checkout, or the explicit unpaid pilot path.
3. Complete and submit the six-step intake. Medical history, medications, allergies, pregnancy information and symptom ratings are required. Optional observations are unanswered by default; there is no automatic element score or diagnosis.
4. Upload existing lab reports (PDF, JPEG, PNG, WebP, text or CSV; 5 MB per document, 12 documents per case). Optional tongue photos are stored for practitioner review, without automated tongue diagnosis. Customers can remove mistaken uploads before a report is released.
5. If needed, request new labs. The practitioner orders tests in an external laboratory/ordering system and records the actual order and reference. Recording the request or filling a form does not place an order.
6. The practitioner downloads originals, optionally extracts lab facts with AI after customer consent, corrects results and confirms identity, collection date and source verification. Every lab document must be verified before a combined report can be drafted.
7. The practitioner saves review notes, requests missing information if necessary, and writes or edits all eight report sections. AI produces a schema-validated draft only. Verified lab facts and TCM hypotheses are distinguished; the draft prompt excludes automatic supplement/herb dosing and medication changes.
8. The practitioner explicitly approves and releases the saved current draft. It appears in the customer dashboard, which polls for updates. Print/save to PDF is available. Released versions are preserved; later source information needs a new case.

AI permission is optional and can be withdrawn for future processing. Unverified extracted values, private practitioner notes, activity history and report drafts are excluded from customer API responses. Source or consent changes invalidate an unapproved draft. Concurrent edits use revision checks instead of silently overwriting another review.

## Operational work still needed

The build supplies a functional pilot workflow, not a claim of clinical validation or regulatory compliance. Before public paid enrollment, the operating team must finalize practitioner responsibility and availability, privacy contact and retention/deletion procedures, service and refund terms, and appropriate arrangements for processing health information with its chosen vendors. The on-site pilot information pages describe the implemented data flow and identify those unfinished operating details.

Lab ordering is a practitioner-managed external process; automatic lab vendor ordering/results delivery and email notifications are not implemented. Supplements and appointments are recommendations in the report, not fulfilled purchases or bookings. Self-service password recovery, multiple practitioner administration/assignment and full audit export are follow-up work for a broader release.

The first real test case still needs the customer's source lab files and prior example assessments, which have not been supplied. Use them to evaluate extraction accuracy, review effort and report quality before designing the investor financial model. Business-plan revision and investor financials remain separate work after pilot evidence and operating costs are established.

AI implementation references: [OpenAI file inputs](https://developers.openai.com/api/docs/guides/file-inputs) and [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
