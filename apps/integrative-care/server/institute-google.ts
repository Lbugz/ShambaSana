import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { CareStore } from "./care-store";

export const instituteEmail = "onlineclass@liferx.us";
export const googleScopes = ["openid", "email", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/classroom.rosters"];
const key = () => {
  if (!process.env.INSTITUTE_SERVICE_TOKEN || process.env.INSTITUTE_SERVICE_TOKEN.length < 32) throw new Error("Institute encryption is not configured.");
  return createHash("sha256").update("institute-google-v1:").update(process.env.INSTITUTE_SERVICE_TOKEN).digest();
};
export function seal(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const bytes = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), bytes].map(b => b.toString("base64url")).join(".");
}
export function unseal<T>(value: string): T {
  const [iv, tag, bytes] = value.split(".").map(v => Buffer.from(v, "base64url"));
  const cipher = createDecipheriv("aes-256-gcm", key(), iv);
  cipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([cipher.update(bytes), cipher.final()]).toString("utf8"));
}
export type GoogleConnection = { revision: number; email: string; connectedAt: string; encryptedRefreshToken: string };
export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_BASE_URL);
export const googleRedirect = () => new URL("/api/institute/google/callback", process.env.APP_BASE_URL).href;
export class GoogleFailure extends Error {
  constructor(public status: number, public uncertain = false) { super(`Google request failed (${status}).`); }
}
export class InstituteGoogle {
  constructor(private store: CareStore) {}
  async token() {
    const connection = await this.store.get<GoogleConnection>("institute-google", "sender");
    if (!connection || !googleConfigured()) throw new GoogleFailure(401);
    const refresh = unseal<string>(connection.encryptedRefreshToken);
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({
      grant_type: "refresh_token", refresh_token: refresh, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new GoogleFailure(response.status);
    const data = await response.json();
    if (typeof data.access_token !== "string") throw new GoogleFailure(502);
    return data.access_token as string;
  }
  async send(payload: { to: string; subject: string; text: string }, messageId: string) {
    const token = await this.token();
    // Encode subject/body and validate all address headers to prevent header injection.
    if (![payload.to, instituteEmail].every(email => /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))) throw new GoogleFailure(400);
    const raw = Buffer.from([
      `From: Shamba Sana Institute <${instituteEmail}>`, `To: ${payload.to}`, `Reply-To: ${instituteEmail}`,
      `Subject: =?UTF-8?B?${Buffer.from(payload.subject).toString("base64")}?=`,
      `Message-ID: <${messageId}@institute.shambasana.com>`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64", "", Buffer.from(payload.text).toString("base64").match(/.{1,76}/g)!.join("\r\n"),
    ].join("\r\n")).toString("base64url");
    let response: Response;
    try { response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ raw }), signal: AbortSignal.timeout(20000) }); }
    catch { throw new GoogleFailure(0, true); }
    // Gmail has no send-idempotency key. Ambiguous outcomes require staff review.
    if (!response.ok) throw new GoogleFailure(response.status, response.status >= 500);
    try { const data = await response.json(); if (!data.id) throw new Error(); return String(data.id); }
    catch { throw new GoogleFailure(502, true); }
  }
  async invite(courseId: string, email: string) {
    const token = await this.token();
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    // Reconcile a previous invitation or membership before creating another.
    const member = await fetch(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/students/${encodeURIComponent(email)}`, { headers, signal: AbortSignal.timeout(15000) });
    if (member.ok) return "already-enrolled";
    if (member.status !== 404) throw new GoogleFailure(member.status);
    const list = await fetch(`https://classroom.googleapis.com/v1/invitations?${new URLSearchParams({ courseId, userId: email })}`, { headers, signal: AbortSignal.timeout(15000) });
    if (!list.ok) throw new GoogleFailure(list.status);
    const invitations = await list.json();
    const existing = invitations.invitations?.find((i: { role: string }) => i.role === "STUDENT");
    if (existing?.id) return String(existing.id);
    const response = await fetch("https://classroom.googleapis.com/v1/invitations", { method: "POST", headers, body: JSON.stringify({ courseId, userId: email, role: "STUDENT" }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new GoogleFailure(response.status);
    const data = await response.json();
    if (!data.id) throw new GoogleFailure(502);
    return String(data.id);
  }
}
