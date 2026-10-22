import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ConflictError, type CareStore } from "./care-store";

export type Purchase = {
  id: string; revision: number; offering: "care" | "institute";
  referenceId: string; email: string; description: string; amount: number;
  currency: "usd"; status: "pending" | "paid" | "refunded";
  checkoutId?: string; paymentIntent?: string; generation: number;
  createdAt: string; updatedAt: string;
};
export const billingConfigured = () => (process.env.NODE_ENV !== "production" || process.env.BILLING_ENABLED === "true") && !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.APP_BASE_URL);
const fail = (status: number, message: string): never => { throw Object.assign(new Error(message), { status }); };
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const now = () => new Date().toISOString();
const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

export class Billing {
  constructor(private store: CareStore, private apply: (purchase: Purchase) => Promise<void>) {}
  async order(offering: Purchase["offering"], referenceId: string, email: string, description: string, amount: number) {
    const id = digest(`${offering}:${referenceId}`);
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 1_000_000) fail(400, "Invalid purchase amount.");
    let order = await this.store.get<Purchase>("purchase", id);
    if (!order) {
      order = { id, revision: 0, offering, referenceId, email, description, amount, currency: "usd", status: "pending", generation: 0, createdAt: now(), updatedAt: now() };
      try { await this.store.put("purchase", id, order); }
      catch (error) { if (!(error instanceof ConflictError)) throw error; order = await this.store.get<Purchase>("purchase", id); }
    }
    return order!;
  }
  private async stripe(path: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.stripe.com/v1/${path}`, {
      ...options, headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...options.headers }, signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) fail(502, "The payment service is unavailable. Please try again.");
    return response.json();
  }
  async checkout(id: string, returnPath: string): Promise<{ url: string; order: Purchase }> {
    if (!billingConfigured()) fail(503, "Payment is not configured.");
    let order = await this.store.get<Purchase>("purchase", id);
    if (!order || order.status !== "pending") fail(409, "This purchase does not need a payment.");
    if (order!.checkoutId) {
      const session = await this.stripe(`checkout/sessions/${encodeURIComponent(order!.checkoutId)}`);
      if (session.status === "open" && session.url?.startsWith("https://checkout.stripe.com/")) return { url: session.url, order: order! };
      if (session.status !== "expired") fail(409, "Checkout is complete or awaiting confirmation. Refresh the payment status.");
      const revision = order!.revision;
      order = { ...order!, revision: revision + 1, generation: order!.generation + 1, checkoutId: undefined, updatedAt: now() };
      await this.store.put("purchase", id, order, revision);
    }
    const base = new URL(process.env.APP_BASE_URL!).origin;
    if (!returnPath.startsWith("/#/") || returnPath.startsWith("//")) fail(400, "Invalid payment return path.");
    const body = new URLSearchParams({
      mode: "payment", "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": String(order!.amount),
      "line_items[0][price_data][product_data][name]": order!.description,
      "line_items[0][quantity]": "1", "metadata[orderId]": id,
      "payment_intent_data[metadata][orderId]": id, client_reference_id: id,
      customer_email: order!.email, success_url: `${base}${returnPath}`, cancel_url: `${base}${returnPath}`,
    });
    const session = await this.stripe("checkout/sessions", { method: "POST", body,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `ss-${id}-${order!.generation}` } });
    if (!session.id || !session.url?.startsWith("https://checkout.stripe.com/")) fail(502, "Invalid checkout response.");
    const revision = order!.revision;
    order = { ...order!, revision: revision + 1, checkoutId: session.id, updatedAt: now() };
    try { await this.store.put("purchase", id, order, revision); }
    catch (error) {
      if (!(error instanceof ConflictError)) throw error;
      const latest = await this.store.get<Purchase>("purchase", id);
      if (latest?.checkoutId !== session.id) throw error;
      order = latest;
    }
    return { url: session.url, order: order! };
  }
  registerWebhook(app: Express) {
    app.post(["/api/billing/webhook", "/api/stripe/webhook"], wrap(async (req, res) => {
      if (!process.env.STRIPE_WEBHOOK_SECRET) fail(503, "Payment webhook is not configured.");
      const signature = (req.get("stripe-signature") || "").split(",");
      const timestamp = signature.find(part => part.startsWith("t="))?.slice(2) || "";
      const raw = req.rawBody;
      if (!Buffer.isBuffer(raw)) fail(400, "Missing payment payload.");
      const expected = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!).update(`${timestamp}.`).update(raw as Buffer).digest();
      if (!/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) >= 300 || !signature.filter(part => part.startsWith("v1=")).some(part => {
        const actual = Buffer.from(part.slice(3), "hex");
        return actual.length === expected.length && timingSafeEqual(actual, expected);
      })) fail(400, "Invalid payment signature.");
      const event = z.object({ id: z.string().min(1).max(255), type: z.string(), data: z.object({ object: z.record(z.any()) }) }).parse(req.body);
      const relevant = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "charge.refunded"];
      if (!relevant.includes(event.type)) return res.json({ received: true });
      const object = event.data.object;
      let id = object.metadata?.orderId;
      if (!id && typeof object.metadata?.caseId === "string") id = digest(`care:${object.metadata.caseId}`);
      if (!id && event.type === "charge.refunded" && typeof object.payment_intent === "string") {
        const paymentIntent = await this.stripe(`payment_intents/${encodeURIComponent(object.payment_intent)}`);
        id = paymentIntent.metadata?.orderId;
      }
      if (typeof id !== "string") fail(400, "Payment has no purchase reference.");
      const receipt = await this.store.get<{ orderId: string }>("stripe-event", event.id);
      if (receipt && receipt.orderId !== id) fail(400, "Payment event reference mismatch.");
      for (let attempt = 0; attempt < 5; attempt++) {
        const order = await this.store.get<Purchase>("purchase", id);
        if (!order) fail(409, "Purchase is not ready. Retry this event.");
        let next: Purchase["status"] = order!.status;
        let intent = order!.paymentIntent;
        if (event.type === "charge.refunded") {
          // Charge metadata is not assumed to inherit PaymentIntent metadata.
          if (object.payment_intent !== order!.paymentIntent || object.amount !== order!.amount || object.currency !== order!.currency) fail(409, "Refund needs payment reconciliation.");
          if (object.amount_refunded === object.amount) next = "refunded";
        } else {
          if (object.payment_status !== "paid") return res.json({ received: true });
          if (!order!.checkoutId) fail(409, "Checkout is not ready. Retry this event.");
          if (object.id !== order!.checkoutId || object.amount_total !== order!.amount || object.currency !== order!.currency || typeof object.payment_intent !== "string") fail(400, "Payment does not match the purchase.");
          if (order!.status === "pending") next = "paid";
          intent = object.payment_intent;
        }
        try {
          if (next !== order!.status || intent !== order!.paymentIntent) {
            const updated = { ...order!, status: next, paymentIntent: intent, revision: order!.revision + 1, updatedAt: now() };
            await this.store.put("purchase", id, updated, order!.revision);
          }
          // Reconcile even on duplicates, to recover a crash between billing and fulfillment.
          await this.apply((await this.store.get<Purchase>("purchase", id))!);
          if (!receipt) {
            try { await this.store.put("stripe-event", event.id, { orderId: id, type: event.type, receivedAt: now() }); }
            catch (error) { if (!(error instanceof ConflictError)) throw error; }
          }
          return res.json({ received: true });
        } catch (error) { if (!(error instanceof ConflictError) || attempt === 4) throw error; }
      }
    }));
  }
}

export const courseNames = ["Foundations of Chinese Medicine", "The Psyche in Chinese Medicine", "Advanced Diagnosis & Treatment"] as const;
export type Enrollment = { id: string; revision: number; course: string; name: string; email: string; phone: string; timezone: string; message: string; consent: true; createdAt: string; term?: string; foundationsStatus?: string; psycheStatus?: string; priorCohort?: string; prerequisiteAcknowledgement?: true; prerequisitesReviewedAt?: string; status: "review" | "payment-ready" | "paid" | "refunded"; purchaseId?: string; accessHash?: string; policyUrl?: string; cohort?: string; policyAcceptedAt?: string };
export const coursePrice = 135_000;
export function verifyServiceKey(req: Request) {
  const secret = process.env.INSTITUTE_SERVICE_TOKEN;
  const supplied = (req.get("authorization") || "").replace(/^Bearer /, "");
  if (!secret || secret.length < 32 || !supplied || digest(supplied) !== digest(secret)) fail(403, "Service authentication required.");
}
export const issuePaymentToken = () => randomBytes(32).toString("hex");
export function verifyPaymentToken(token: unknown, enrollment: Enrollment | undefined) {
  if (!enrollment?.accessHash || typeof token !== "string" || digest(token) !== enrollment.accessHash) fail(404, "Payment invitation not found.");
}
export const paymentTokenHash = digest;
