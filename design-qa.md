# Shamba Sana public-page design QA

final result: passed

Reviewed on 9 October 2026. This revision restores the earlier site's visual character while describing the implemented remote care episode. It is an adaptation of the original design, with the approved Shamba Sana name and the requested removal of the header tagline.

## Source and rendered evidence

- Source visual truth: the Gateway at commit `2fb657a`, rendered from its original code and assets. Captures are in `/workspace/shamba-design/02-original-journey.png`, `04-original-labs.png`, and `05-original-home.png`.
- The simplified public pages were captured directly from `https://newhealth.replit.app/` as `01-live-journey.png` and `03-live-labs.png` in the same evidence directory.
- Implementation: local Node app on port 5000, branch `codex/restore-shamba-story`. Captures are `06-restored-home.png`, `07-restored-journey.png`, and `09-restored-labs.png` in the same directory.
- Desktop CSS viewport: 1440 × 1000, device scale factor 1. Source and implementation viewport screenshots are 1440 × 1000 pixels. Full-page heights differ because the revised copy and sections describe the current care episode.
- Additional implementation CSS viewports: 375 × 812 and 768 × 1024, device scale factor 1. No page width exceeded its viewport.
- State: anonymous visitor, top of each public page, default lab filter and empty search. Additional captures cover selected journey stages, lab search, empty results and mobile navigation.
- Full-view comparison inputs: `comparison-home.png`, `comparison-journey.png`, and `comparison-labs.png`. Each browser-rendered comparison displays the source and revised captures together at equal widths. Comparison canvas is 2000 pixels wide; both sides use the same scale.
- Focused comparison inputs: `comparison-journey-detail.png` and `comparison-labs-detail.png`, showing the first timeline stage and heart marker group. Section heights differ intentionally with revised content. These inputs were inspected together rather than judged from paths or memory.
- Full review with numbered findings and screenshots: `/workspace/shamba-design/review.html`.

## Required fidelity surfaces

1. **Fonts and typography:** computed styles confirm Lora at 60px, weight 500 for the desktop journey and lab page headings in both versions. Body font remains Plus Jakarta Sans. The homepage restores the large pattern-led opening and uses a serif supporting line. Heading wraps, body spacing and report section labels were inspected at all three widths.
2. **Spacing and layout rhythm:** large alternating artwork and text sections, the connected five-stage timeline, lab category groups and illustrated sidebar are restored. Left-aligned timeline copy improves reading flow; the top stage bar replaces the original floating side rail. The enrollment introduction and report contents are intentional additions. Mobile stacks each section; category and stage bars scroll within their own containers.
3. **Colors and tokens:** the original jade, cream, sage, rose and gold palette is retained. Both original and revised body styles report `rgb(13, 68, 51)` foreground and `rgb(245, 241, 234)` background. The paper texture also appears on the two detail-page heroes to connect them to the homepage. Selected controls use jade and white; focus outlines and selection semantics were checked. This is not a full WCAG contrast audit.
4. **Image quality and asset fidelity:** the original raster artwork is reused: botanical paper and abstract flow; three homepage still lifes; all five journey images; the body-system mandala. Images were loaded, decoded and inspected before accepting the final screenshots. There are no new placeholder illustrations or approximations of the original artwork. The existing Shamba Sana mark is retained with a single-line wordmark.
5. **Copy and content:** the lab guide has nine areas and 31 representative test examples with individual explanations. The journey explains intake, source verification, practitioner interpretation, approved guidance and next steps. Lab measurements and TCM interpretation remain distinct. The report contents use the actual eight labels from the shared report schema. The pages describe existing lab review and separate fees for new tests and treatments.

## Findings and comparison history

- **Resolved P1 — loss of image-led storytelling:** the published simplified pages replaced the original artwork and interactive exploration with generic cards. Restored the original artwork, alternating feature sections, numbered timeline, detailed test groups, search, filters and sidebar. Post-fix evidence: the three full-view comparisons and both focused comparisons.
- **Resolved P2 — page navigation retained a prior scroll position:** browser navigation from a long page could open the next page midway through its content. The router now resets the scroll position when the route changes. Post-fix evidence: package-to-signup browser check verifies the pricing page opens at scroll position 0 and the signup plan is preserved.
- **Resolved P2 — stage selection stayed stale when returning to the hero:** the first capture showed a later stage selected at the top of the journey after a scroll. Replaced intersection-only selection with a frame-throttled scroll update that defaults to the first stage above the timeline. Post-fix evidence: the final browser run verifies stage 01 at the top and stage 04 after stage navigation.
- **Capture correction:** an early full-page capture was taken before below-the-fold lazy images loaded. It was rejected. Final captures scroll to and decode every image, return to the top, and then capture. This was an evidence issue, not a missing asset in the app.
- No actionable P0/P1/P2 issues remain in the scoped public-page review.

## Interaction and implementation checks

- `npm run check`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Replit TOML parses and selects `cloudrun`, build `npm run build`, run `npm run start`.
- Browser public-flow verification: 15 checks passed, with zero JavaScript page errors.
- Search returns the specific ferritin result; all nine category filters show the expected group; reset, clear and empty states work; filters activate by keyboard.
- Journey navigation moves to the requested heading, preserves visible space beneath sticky controls, transfers focus and updates the active stage.
- The pricing-to-signup route preserves `signup=true&plan=remote-pilot` and displays the registration form.
- Mobile menu closes after selecting a page. Stage targets are at least 44px tall. Desktop, mobile and tablet pages have no horizontal body overflow.
- Reduced-motion stage navigation reaches and focuses the selected heading.
- Local `/api/config` responds with JSON. Production API readiness remains unverified because the user confirmed the published deployment uses Static hosting.

## Implementation checklist

- [x] Restore the original visual references and detailed public content.
- [x] Remove the header tagline.
- [x] Inspect desktop, mobile, tablet and focused comparison evidence.
- [x] Verify the primary public-page interactions and browser console.
- [x] Correct and document the Node publishing configuration.
- [ ] In Replit, switch the existing publishing type from Static to Autoscale and republish the merged changes; then verify the live care API.

## Follow-up polish and limits

The original PNG artwork is large (roughly 1–2.3 MB per asset); below-the-fold content images use lazy loading. A later asset optimization pass could reduce download weight while preserving this selected artwork. This review does not evaluate clinical correctness of an actual patient report, a real OpenAI request, a Stripe payment, production secrets, or full accessibility compliance.
