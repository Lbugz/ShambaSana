# Shamba Sana remote care pilot

A connected pilot for one remote care episode: account and enrollment, saved TCM intake, private lab documents, practitioner verification, editable assessment, and a released customer report.

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

## Replit deployment

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

Create a Stripe webhook for `/api/stripe/webhook` with `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `charge.refunded`. Enrollment stays pending until a correctly signed webhook matches the case, amount, currency and checkout session. A checkout return URL does not mark payment successful. Repeated checkout requests reuse an open session; full refunds block further care actions. Partial refund decisions remain operational.

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
