# Institute semester refinement — October 22, 2026

## Decisions incorporated

- Foundations: three semesters, $2,000 per live semester; Semester 1 self-paced catch-up also $2,000, explicitly confirmed by owner.
- Semester 1 ends December 11, 2026, following the written syllabus. Wednesday/Friday live classes continue across semesters; use Eastern Time (`America/New_York`, EST/EDT) with times TBD. Teaching hours and later semester dates remain pending.
- Each semester is a separate registration decision and one-time payment. No automatic charge, subscription, off-session payment or next-semester order is created on completion. Use a new semester-specific registration and private invitation.
- Self-paced catch-up is currently scoped to Foundations Semester 1. Materials, support, completion deadline and access arrangements still require staff confirmation before payment/access.
- Refund principles approved by owner: full tuition refund before the relevant semester begins; unused instruction refund after withdrawal; cancellation/refund and unmet prerequisite protections described in student information. Final calculation, dates and self-paced treatment must be included before payment. No live payment activation in this change.

## Catalog reconciliation

The supplied catalog contains both Psyche two semesters at $1,000 ($2,000 total) and three semesters at $1,000 ($3,000 total). Advanced has two semesters at $2,000 ($4,000 total) and three at $1,000 ($3,000 total). The Classroom Psyche syllabus also lists 11 weeks/22 sessions/44 hours. These are unresolved conflicts, not missing catalog fields. New invitations for those courses are blocked pending final pricing/structure. Existing purchases retain their original amounts and remain usable in their original payment environment.

## Workstreams prepared

1. Institute registration: course/semester/format selection, preselected share links, smaller introductory copy and mobile touch/field sizing. Public prices corrected; sourced learning resources and working refund principles incorporated.
2. Main/Institute header: growing green underline for hover, focus and active section. Founder grid prepared for total four profiles. Naima/Langa/Don cards remain in unpublished templates until approved full names, roles, headshots and short biographies arrive. Dumisani's existing profile/logo/imagery preserved.
3. Care migration audit: application, API, PostgreSQL and shared billing already reside in this repository. Replace stale Replit navigation with care.shambasana.com and correct Care footer cross-links. Separate Railway services remain intentional. Provider links (Google, Stripe) remain external by design.

## Rollout order

1. Merge/deploy backend and website. Keep Stripe/automation sandbox and `INSTITUTE_LIVE_PAYMENTS_READY=false`.
2. Enable `INSTITUTE_FOUNDATIONS_REVIEW_OPEN=true` on Shamba-Backend and `COURSE_FOUNDATIONS_REVIEW_OPEN=true` on website when ready to receive review requests. Existing general registration switches/service connection remain required. Defaults stay closed. Confirm both services deployed before sharing the route.
3. Share the actual Institute domain registration URL with course/semester preselected, e.g. `/registration.html?course=Foundations%20of%20Chinese%20Medicine&semester=1`. The form selects self-paced catch-up automatically for that choice; Semester 2/3 select live-online.
4. Review the deployed flow on phone widths and in messaging-app browsers: initial link, selection, contact/preparation fields, durable receipt, private semester invitation and Stripe return. No automated suite was added/run. Local browser preview was unavailable (localhost timeout; file URLs blocked by browser policy), so this visual/journey review remains outstanding.
5. Confirm catch-up materials/support, final schedules/hours and remaining course pricing. Add founder profiles when supplied. Finalize complete enrollment agreement and self-paced refund calculation before live payments.

## Verification completed

TypeScript check, production build, JavaScript syntax checks and Git whitespace check passed. Existing bundle size warning remains. Independent agent reviewed field mappings, price isolation and preservation of legacy purchase amounts. No production changes or Railway variable changes were made in this refinement turn.

## Separate Care readiness work

Code migration is complete; this audit did not establish database backup/restore readiness, account recovery/MFA readiness, or a full deployed Care journey review. Those remain operational checks, not additional Replit code imports.
