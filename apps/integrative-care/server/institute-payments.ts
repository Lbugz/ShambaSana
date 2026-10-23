import { Billing, billingConfigured, billingMode, type Enrollment, type Purchase } from "./billing";
import { ConflictError, type CareStore } from "./care-store";
import { semesterPrice, semesterDescription } from "./institute-offerings";
import { stripeKey, stripeWebhookSecret, instituteLaunchDetails, type PaymentMode } from "./payment-config";

export type SemesterPlan = "full" | "monthly";
export const paymentTermsVersion = "sandbox-semester-4x500-v1";
export const currentPaymentTermsVersion = () => billingMode("institute") === "live" ? instituteLaunchDetails().termsVersion : paymentTermsVersion;
const fail = (status: number, message: string): never => { throw Object.assign(new Error(message), { status, expose: true }); };
const stamp = () => new Date().toISOString();
// Preserve the billing day, clamping dates such as January 31 to February's end.
export function followingMonth(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const day = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 1);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return Math.floor(date.getTime() / 1000);
}

// Production support is prepared, but live checkout requires independent
// Institute credentials, approved course details and an explicit collection gate.
export class InstitutePayments {
  constructor(private store: CareStore, private billing: Billing, private apply: (purchase: Purchase) => Promise<void>) {}
  private ready(mode: PaymentMode = billingMode("institute"), collecting = true) {
    if (!stripeKey("institute", mode) || !stripeWebhookSecret("institute", mode) || !process.env.APP_BASE_URL || (collecting && (!billingConfigured("institute") || mode !== billingMode("institute")))) fail(503, "Institute payments are not configured or live collection is disabled.");
  }
  private async stripe(path: string, body?: URLSearchParams, key?: string, mode: PaymentMode = billingMode("institute"), collecting = true) {
    this.ready(mode, collecting);
    const response = await fetch(`https://api.stripe.com/v1/${path}`, {
      method: body ? "POST" : "GET", body,
      headers: { Authorization: `Bearer ${stripeKey("institute", mode)}`, "Stripe-Version": "2024-06-20", ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}), ...(key ? { "Idempotency-Key": key } : {}) },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) fail(502, "Stripe checkout needs attention. Your registration is saved; use your private payment page to retry.");
    const result = await response.json();
    if (typeof result.livemode === "boolean" && result.livemode !== (mode === "live")) fail(502, "A payment response from the wrong environment was rejected.");
    return result;
  }
  async order(e: Enrollment, plan: SemesterPlan) {
    this.ready();
    const total = semesterPrice(e);
    if (total !== 200000) fail(409, "Tuition needs confirmation before checkout.");
    let order = await this.billing.order("institute", e.id, e.email, `Shamba Sana Institute — ${semesterDescription(e)}`, total!);
    if (order.amount !== total || (order.livemode === true) !== (billingMode("institute") === "live")) fail(409, "The payment record needs review; sandbox orders cannot become live orders.");
    if (!order.directCheckout) {
      if (order.checkoutId || order.status !== "pending") fail(409, "An earlier checkout needs review.");
      const revision = order.revision;
      order = { ...order, directCheckout: true, semesterPlan: plan, planState: "pending", paidAmount: 0, refundedAmount: 0, payments: {}, revision: revision + 1, updatedAt: stamp() };
      try { await this.store.put("purchase", order.id, order, revision); }
      catch (error) { if (!(error instanceof ConflictError)) throw error; order = (await this.store.get<Purchase>("purchase", order.id))!; }
    }
    if (order.semesterPlan !== plan) fail(409, "A different payment plan is already attached to this registration. Contact admissions to change it.");
    return order;
  }
  async checkout(id: string, returnPath: string) {
    this.ready();
    let order = await this.store.get<Purchase>("purchase", id);
    if (!order?.directCheckout || order.status !== "pending" || (order.livemode === true) !== (billingMode("institute") === "live")) fail(409, "This payment does not need a new checkout in this environment.");
    if (order!.checkoutId) {
      const old = await this.stripe(`checkout/sessions/${encodeURIComponent(order!.checkoutId)}`);
      if (old.status === "open" && old.url?.startsWith("https://checkout.stripe.com/")) return { url: old.url };
      if (old.status !== "expired") fail(409, "Stripe is confirming this payment. Refresh your payment page.");
      const revision = order!.revision;
      order = { ...order!, revision: revision + 1, generation: order!.generation + 1, checkoutId: undefined, updatedAt: stamp() };
      await this.store.put("purchase", id, order, revision);
    }
    if (!returnPath.startsWith("/#/course-payment?") && !(order!.sandboxClock && returnPath === "/#/admin/billing?clock=returned")) fail(400, "Invalid return page.");
    const monthly = order!.semesterPlan === "monthly";
    const amount = monthly ? 50000 : order!.amount;
    const base = new URL(process.env.APP_BASE_URL!).origin;
    const body = new URLSearchParams({ mode: "payment", customer_creation: "always", customer_email: order!.email,
      "payment_method_types[0]": "card", "line_items[0][price_data][currency]": "usd", "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][price_data][product_data][name]": `${order!.description}${monthly ? " — installment 1 of 4" : " — full semester tuition"}`,
      "line_items[0][quantity]": "1", "metadata[orderId]": id, "payment_intent_data[metadata][orderId]": id,
      client_reference_id: id, success_url: `${base}${returnPath}`, cancel_url: `${base}${returnPath}`,
      "custom_text[submit][message]": monthly ? "SANDBOX PLAN: $500 today, then 3 automatic monthly payments of $500. $2,000 total. Charges stop after those installments. Late-start payments may extend beyond class dates. No next-semester renewal." : "SANDBOX: $2,000 tuition for this semester only. No automatic next-semester charge.",
    });
    if (monthly) body.set("payment_intent_data[setup_future_usage]", "off_session");
    if (order!.livemode) body.set("custom_text[submit][message]", monthly ? "$500 today, then 3 automatic monthly payments of $500. $2,000 total for this semester. Charges stop after those installments. Late-start payments may extend beyond class dates. No next-semester renewal." : "$2,000 tuition for this semester only. No automatic next-semester charge.");
    if (order!.sandboxClock) {
      if (order!.livemode || billingMode("institute") !== "sandbox") fail(409, "Test clocks cannot be used for live payment.");
      const customer = await this.stripe(`customers/${encodeURIComponent(order!.sandboxClock.customer)}`);
      if (customer.test_clock !== order!.sandboxClock.id || customer.email !== "langa@liferx.us") fail(409, "Test clock customer mismatch.");
      body.delete("customer_creation"); body.delete("customer_email");
      body.set("customer", customer.id);
    }
    const session = await this.stripe("checkout/sessions", body, `institute-checkout-${id}-${order!.generation}`);
    if (!session.id || !session.url?.startsWith("https://checkout.stripe.com/")) fail(502, "Invalid Stripe checkout response.");
    const revision = order!.revision;
    const next = { ...order!, checkoutId: session.id, revision: revision + 1, updatedAt: stamp() };
    try { await this.store.put("purchase", id, next, revision); }
    catch (error) { if (!(error instanceof ConflictError) || (await this.store.get<Purchase>("purchase", id))?.checkoutId !== session.id) throw error; }
    return { url: session.url };
  }
  private async schedule(order: Purchase, intent: any) {
    const stripe = (path: string, body?: URLSearchParams, key?: string) => this.stripe(path, body, key, order.livemode ? "live" : "sandbox", false);
    if (order.scheduleId) return order.scheduleId;
    if (typeof intent.customer !== "string" || typeof intent.payment_method !== "string") fail(409, "The saved payment method needs reconciliation.");
    const previous = await stripe(`subscription_schedules?customer=${encodeURIComponent(intent.customer)}&limit=100`);
    const existing = previous.data?.find((item: any) => item.metadata?.orderId === order.id);
    if (existing) {
      if (!["active", "not_started"].includes(existing.status) || existing.end_behavior !== "cancel") fail(409, "An earlier payment schedule needs staff reconciliation.");
      return existing.id as string;
    }
    // The first $500 was collected by Checkout. Create ONLY three more monthly
    // installments, with a cancellation boundary set at creation (never unbounded).
    const body = new URLSearchParams({ customer: intent.customer, start_date: String(followingMonth(intent.created)), end_behavior: "cancel",
      "default_settings[default_payment_method]": intent.payment_method, "metadata[orderId]": order.id,
      "phases[0][items][0][price_data][currency]": "usd", "phases[0][items][0][price_data][unit_amount]": "50000",
      "phases[0][items][0][price_data][recurring][interval]": "month", "phases[0][items][0][quantity]": "1",
      "phases[0][iterations]": "3", "phases[0][proration_behavior]": "none", "phases[0][metadata][orderId]": order.id,
    });
    const product = await stripe("products", new URLSearchParams({ name: `${order.description} — remaining semester installments`, "metadata[orderId]": order.id }), `institute-product-${order.id}`);
    body.set("phases[0][items][0][price_data][product]", product.id);
    const schedule = await stripe("subscription_schedules", body, `institute-schedule-${order.id}`);
    if (!schedule.id || schedule.end_behavior !== "cancel" || schedule.phases?.length !== 1) fail(502, "The finite payment schedule could not be confirmed.");
    return schedule.id as string;
  }
  // Restricted staff rehearsal: real Stripe sandbox objects and normal Checkout /
  // webhook processing. The clock can never be supplied by a public registration.
  async clockStatus() {
    if (billingMode("institute") !== "sandbox") fail(409, "Test clocks require Institute sandbox mode.");
    this.ready();
    const run = await this.store.get<{ id: string; customer: string; orderId: string; enrollmentId: string }>("installment-clock", "v1");
    if (!run) return { enabled: true };
    const order = await this.store.get<Purchase>("purchase", run.orderId);
    const clock = await this.stripe(`test_helpers/test_clocks/${run.id}`);
    const invoices = await this.stripe(`invoices?customer=${run.customer}&limit=100`);
    const charges = await this.stripe(`charges?customer=${run.customer}&limit=100`);
    const subscriptions = await this.stripe(`subscriptions?customer=${run.customer}&status=all&limit=100`);
    const schedule = order?.scheduleId ? await this.stripe(`subscription_schedules/${order.scheduleId}`) : undefined;
    return { enabled: true, run, clock: { status: clock.status, time: clock.frozen_time },
      order: order && { paidAmount: order.paidAmount, planState: order.planState, payments: Object.keys(order.payments || {}).length },
      schedule: schedule && { id: schedule.id, status: schedule.status, endBehavior: schedule.end_behavior, end: schedule.phases?.at(-1)?.end_date },
      invoices: invoices.data.map((i: any) => ({ id: i.id, status: i.status, amount: i.amount_paid, created: i.created })),
      charges: charges.data.map((c: any) => ({ id: c.id, status: c.status, amount: c.amount, created: c.created })),
      subscriptions: subscriptions.data.map((s: any) => ({ id: s.id, status: s.status, canceledAt: s.canceled_at })) };
  }
  async createClock() {
    this.ready();
    const existing = await this.store.get<any>("installment-clock", "v1");
    if (existing) return this.clockStatus();
    const frozen = Math.floor(Date.now() / 1000);
    const clock = await this.stripe("test_helpers/test_clocks", new URLSearchParams({ frozen_time: String(frozen), name: "Institute four-payment stop check" }), "institute-clock-v1");
    const customer = await this.stripe("customers", new URLSearchParams({ test_clock: clock.id, email: "langa@liferx.us", name: "TEST ONLY — Institute installment clock" }), "institute-clock-customer-v1");
    const e: Enrollment = { id: "SS-00000000-0000-4000-8000-000000000004", revision: 0, course: "Foundations of Chinese Medicine", semester: 1, learningFormat: "self-paced", name: "TEST ONLY — Installment clock", email: "langa@liferx.us", phone: "", timezone: "America/New_York", message: "Restricted sandbox clock rehearsal", consent: true, createdAt: stamp(), status: "payment-ready", sandboxPayment: true, paymentPlan: "monthly", term: "Fall 2026" };
    let order = await this.order(e, "monthly");
    if (!order.sandboxClock) { const old = order.revision; order = { ...order, revision: old + 1, sandboxClock: { id: clock.id, customer: customer.id } }; await this.store.put("purchase", order.id, order, old); }
    e.purchaseId = order.id; e.tuitionCents = 200000;
    if (!await this.store.get("enrollment", e.id)) await this.store.put("enrollment", e.id, e);
    try { await this.store.put("installment-clock", "v1", { id: clock.id, customer: customer.id, orderId: order.id, enrollmentId: e.id }); }
    catch (error) { if (!(error instanceof ConflictError)) throw error; }
    return this.clockStatus();
  }
  async clockCheckout() {
    const run = await this.store.get<any>("installment-clock", "v1");
    if (!run) fail(409, "Create the test clock first.");
    // Confirmation is read in the staff ledger; no public bearer token is issued.
    return this.checkout(run.orderId, "/#/admin/billing?clock=returned");
  }
  async advanceClock() {
    const state = await this.clockStatus();
    if (!state.run || state.clock?.status !== "ready" || !state.schedule) fail(409, "Wait for checkout and the clock to be ready.");
    const target = followingMonth(state.clock!.time) + 86400 * 2;
    await this.stripe(`test_helpers/test_clocks/${state.run!.id}/advance`, new URLSearchParams({ frozen_time: String(target) }));
    return this.clockStatus();
  }
  async event(event: { id: string; type: string; livemode?: boolean; data: { object: Record<string, any> } }): Promise<boolean> {
    const mode: PaymentMode = event.livemode === true ? "live" : "sandbox";
    const stripe = (path: string, body?: URLSearchParams, key?: string) => this.stripe(path, body, key, mode, false);
    const types = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "charge.refunded", "invoice.paid", "invoice.payment_failed", "customer.subscription.deleted", "subscription_schedule.canceled", "subscription_schedule.completed", "subscription_schedule.aborted"];
    if (!types.includes(event.type)) return false;
    let object = event.data.object;
    let id = object.metadata?.orderId;
    if (!id && event.type.startsWith("invoice.")) {
      const subscriptionId = object.subscription || object.parent?.subscription_details?.subscription;
      if (typeof subscriptionId !== "string") return false;
      const sub = await stripe(`subscriptions/${encodeURIComponent(subscriptionId)}`);
      id = sub.metadata?.orderId;
    }
    if (!id && event.type === "charge.refunded" && typeof object.payment_intent === "string") id = (await stripe(`payment_intents/${encodeURIComponent(object.payment_intent)}`)).metadata?.orderId;
    if (typeof id !== "string") return false;
    const original = await this.store.get<Purchase>("purchase", id);
    if (!original?.directCheckout) return false;
    this.ready(mode, false);
    if ((original.livemode === true) !== (mode === "live") || (typeof object.livemode === "boolean" && object.livemode !== (mode === "live"))) fail(400, "Payment environment mismatch.");
    let intent: any; let scheduleId = original.scheduleId;
    if (event.type.startsWith("checkout.")) {
      object = await stripe(`checkout/sessions/${encodeURIComponent(object.id)}`);
      if (object.payment_status !== "paid") return true;
      const expected = original.semesterPlan === "monthly" ? 50000 : original.amount;
      if (object.id !== original.checkoutId || object.amount_total !== expected || object.currency !== "usd" || typeof object.payment_intent !== "string") fail(400, "Checkout does not match the semester order.");
      intent = await stripe(`payment_intents/${encodeURIComponent(object.payment_intent)}?expand[]=latest_charge`);
      if (intent.status !== "succeeded" || intent.amount_received !== expected || intent.metadata?.orderId !== id) fail(409, "Payment confirmation needs reconciliation.");
      intent.refundedAmount = typeof intent.latest_charge === "object" ? intent.latest_charge.amount_refunded || 0 : 0;
      if (original.semesterPlan === "monthly" && original.status !== "refunded" && !intent.refundedAmount) scheduleId = await this.schedule(original, intent);
    } else if (event.type.startsWith("invoice.")) {
      object = await stripe(`invoices/${encodeURIComponent(object.id)}`);
      if (object.currency !== "usd" || object.total !== 50000 || typeof object.subscription !== "string") fail(409, "Installment invoice needs reconciliation.");
      const sub = await stripe(`subscriptions/${encodeURIComponent(object.subscription)}`);
      let matchesSchedule = sub.schedule === original.scheduleId;
      if (!matchesSchedule && original.scheduleId && sub.schedule === null) {
        const finished = await stripe(`subscription_schedules/${encodeURIComponent(original.scheduleId)}`);
        matchesSchedule = finished.subscription === sub.id && finished.metadata?.orderId === id && ["completed", "canceled"].includes(finished.status);
      }
      if (!matchesSchedule || sub.metadata?.orderId !== id) fail(409, "Installment schedule mismatch.");
    } else if (event.type === "charge.refunded") {
      object = await stripe(`charges/${encodeURIComponent(object.id)}`);
      // Stop future collections as soon as a refund is recorded. Staff decide
      // whether the student continues; a refund never silently creates a new plan.
      if (original.scheduleId && object.amount_refunded > 0) {
        const scheduled = await stripe(`subscription_schedules/${encodeURIComponent(original.scheduleId)}`);
        if (["active", "not_started"].includes(scheduled.status)) await stripe(`subscription_schedules/${encodeURIComponent(original.scheduleId)}/cancel`, new URLSearchParams({ invoice_now: "false", prorate: "false" }), `institute-refund-stop-${original.id}`);
      }
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const old = (await this.store.get<Purchase>("purchase", id))!;
      const next = { ...old, payments: { ...old.payments }, revision: old.revision + 1, updatedAt: stamp(), scheduleId: scheduleId || old.scheduleId };
      if (intent) {
        next.payments[intent.id] ||= { amount: intent.amount_received, refunded: intent.refundedAmount, intent: intent.id };
        if (intent.refundedAmount) next.planState = "cancelled";
        next.paymentIntent = intent.id;
      } else if (event.type === "invoice.paid" && object.status === "paid") {
        if (object.amount_paid !== 50000 || typeof object.payment_intent !== "string") fail(409, "Installment payment needs reconciliation.");
        next.payments[object.payment_intent] ||= { amount: object.amount_paid, refunded: 0, intent: object.payment_intent };
      } else if (event.type === "charge.refunded") {
        const payment = next.payments[object.payment_intent];
        if (!payment || object.currency !== "usd" || object.amount !== payment.amount) fail(409, "Refund needs installment reconciliation.");
        payment.refunded = Math.max(payment.refunded, object.amount_refunded);
        next.planState = "cancelled";
      } else if (event.type === "invoice.payment_failed" && !next.payments[object.payment_intent]) next.planState = "past-due";
      else if (["customer.subscription.deleted", "subscription_schedule.canceled", "subscription_schedule.aborted"].includes(event.type)) next.planState = "cancelled";
      next.paidAmount = Object.values(next.payments).reduce((sum, item) => sum + item.amount, 0);
      next.refundedAmount = Object.values(next.payments).reduce((sum, item) => sum + item.refunded, 0);
      if (next.paidAmount > next.amount || Object.keys(next.payments).length > (next.semesterPlan === "monthly" ? 4 : 1)) fail(409, "Unexpected installment count needs staff reconciliation.");
      if (next.paidAmount > 0) next.status = next.refundedAmount === next.paidAmount ? "refunded" : "paid";
      if (next.paidAmount === next.amount && !next.refundedAmount) next.planState = "complete";
      else if ((intent || event.type === "invoice.paid") && !next.refundedAmount && next.planState !== "cancelled") next.planState = "active";
      else if (event.type === "subscription_schedule.completed" && next.paidAmount < next.amount) next.planState = "past-due";
      try {
        await this.store.put("purchase", id, next, old.revision);
        await this.apply(next);
        return true;
      } catch (error) { if (!(error instanceof ConflictError) || attempt === 4) throw error; }
    }
    return true;
  }
}
