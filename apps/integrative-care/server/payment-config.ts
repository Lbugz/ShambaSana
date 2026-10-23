export type Offering = "care" | "institute";
export type PaymentMode = "sandbox" | "live";

// Care remains a sandbox pilot. A global BILLING_MODE must never activate it
// when Institute tuition is later enabled independently.
export const paymentMode = (offering: Offering = "care"): PaymentMode =>
  offering === "institute" && process.env.INSTITUTE_BILLING_MODE === "live" ? "live" : "sandbox";

export function stripeKey(offering: Offering, mode = paymentMode(offering)) {
  if (offering === "care" && mode === "live") return undefined;
  const candidate = offering === "institute"
    ? mode === "live" ? process.env.INSTITUTE_STRIPE_LIVE_SECRET_KEY : process.env.INSTITUTE_STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY
    : process.env.CARE_STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  return candidate?.startsWith(mode === "live" ? "sk_live_" : "sk_test_") ? candidate : undefined;
}
export function stripeWebhookSecret(offering: Offering, mode = paymentMode(offering)) {
  if (offering === "care" && mode === "live") return undefined;
  return offering === "institute"
    ? mode === "live" ? process.env.INSTITUTE_STRIPE_LIVE_WEBHOOK_SECRET : process.env.INSTITUTE_STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET;
}
export function instituteLaunchDetails() {
  const classroom = process.env.INSTITUTE_FOUNDATIONS_1_CLASSROOM_ID || "";
  const orientation = process.env.INSTITUTE_FOUNDATIONS_1_ORIENTATION_URL || "";
  const cohort = process.env.INSTITUTE_FOUNDATIONS_1_DETAILS || "";
  const termsVersion = process.env.INSTITUTE_LIVE_TERMS_VERSION || "";
  let validOrientation = false;
  try { validOrientation = new URL(orientation).protocol === "https:"; } catch { /* Missing details block activation. */ }
  const ready = /^\d+$/.test(classroom) && classroom !== process.env.INSTITUTE_TEST_CLASSROOM_ID
    && validOrientation && cohort.length >= 20 && !!termsVersion && !/sandbox|draft/i.test(termsVersion)
    && process.env.INSTITUTE_LIVE_PAYMENTS_READY === "true" && process.env.INSTITUTE_LIVE_WEBSITE_READY === "true";
  return { classroom, orientation, cohort, termsVersion, ready };
}
export const liveCollectionEnabled = () => process.env.INSTITUTE_LIVE_PAYMENTS_ENABLED === "true" && instituteLaunchDetails().ready;
export function paymentConfigured(offering: Offering = "care") {
  const mode = paymentMode(offering);
  return (process.env.NODE_ENV !== "production" || process.env.BILLING_ENABLED === "true")
    && !!(stripeKey(offering, mode) && stripeWebhookSecret(offering, mode) && process.env.APP_BASE_URL)
    && (mode !== "live" || liveCollectionEnabled());
}
