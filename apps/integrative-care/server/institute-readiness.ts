import type { CareStore } from "./care-store";
import { googleConfigured, type GoogleConnection } from "./institute-google";
import { instituteLaunchDetails, liveCollectionEnabled, paymentMode, paymentConfigured, stripeKey, stripeWebhookSecret } from "./payment-config";
import { automationMode } from "./institute-onboarding";

// Staff-only output contains presence/status flags, never credential values.
export async function instituteReadiness(store: CareStore) {
  const details = instituteLaunchDetails();
  const connection = await store.get<GoogleConnection>("institute-google", "sender");
  const checks = [
    { id: "live-key", label: "Dedicated Institute live Stripe key", ready: !!stripeKey("institute", "live") },
    { id: "live-webhook", label: "Dedicated Institute live webhook signing secret", ready: !!stripeWebhookSecret("institute", "live") },
    { id: "terms", label: "Final terms approved and version recorded", ready: process.env.INSTITUTE_LIVE_PAYMENTS_READY === "true" && !!details.termsVersion && !/sandbox|draft/i.test(details.termsVersion) },
    { id: "course", label: "Real Semester 1 Classroom, orientation and course details", ready: /^\d+$/.test(details.classroom) && details.classroom !== process.env.INSTITUTE_TEST_CLASSROOM_ID && details.cohort.length >= 20 && details.orientation.startsWith("https://") },
    { id: "website", label: "Live registration disclosures and published policies reviewed", ready: process.env.INSTITUTE_LIVE_WEBSITE_READY === "true" },
    { id: "google", label: "Teaching mailbox connected", ready: googleConfigured() && connection?.email === "onlineclass@liferx.us" },
    { id: "google-production", label: "Google OAuth production configuration confirmed", ready: process.env.INSTITUTE_GOOGLE_PRODUCTION_READY === "true" },
    { id: "auto-access", label: "Semester 1 access after first payment approved", ready: process.env.INSTITUTE_FOUNDATIONS_1_AUTO_ACCESS_APPROVED === "true" },
  ];
  return {
    careMode: paymentMode("care"), instituteMode: paymentMode("institute"), checkoutAvailable: paymentConfigured("institute"),
    livePaymentsEnabled: paymentMode("institute") === "live" && liveCollectionEnabled() && paymentConfigured("institute"),
    liveOnboardingEnabled: automationMode() === "live", checks,
    liveWebhookPath: "/api/institute/billing/webhook/live",
  };
}
