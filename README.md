# Shamba Sana

Main sanctuary landing page and Institute course catalog, instructor introduction and standalone registration page. Remote Care links to the existing MVP. Payment and automatic student onboarding are not implemented yet.

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
