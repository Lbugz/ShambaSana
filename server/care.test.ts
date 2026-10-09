import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHmac, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import express from "express";
import { registerRoutes } from "./routes";
import {
  FileStore,
  PostgresStore,
  ConflictError,
  type CareStore,
} from "./care-store";
import {
  blankIntake,
  reportFields,
  type CareCase,
  type Report,
  type Extraction,
} from "../shared/care";

test("Shamba Sana pilot: persisted care, access control, verified labs and report release", async (t) => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  const directory = await mkdtemp(path.join(tmpdir(), "shamba-test-"));
  process.env.NODE_ENV = "test";
  process.env.PRACTITIONER_EMAIL = "practitioner@example.com";
  const password = randomBytes(20).toString("hex");
  process.env.PRACTITIONER_PASSWORD = password;
  process.env.PRACTITIONER_NAME = "Pilot Practitioner";
  for (const key of [
    "OPENAI_API_KEY",
    "AI_INTEGRATIONS_OPENAI_API_KEY",
    "APP_BASE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ])
    delete process.env[key];
  let store: CareStore;
  if (process.env.SHAMBA_TEST_DATABASE_URL) {
    const pg = new PostgresStore(process.env.SHAMBA_TEST_DATABASE_URL);
    await pg.init();
    store = pg;
  } else store = new FileStore(path.join(directory, "care.json"));
  const app = express();
  app.use(
    express.json({
      limit: "8mb",
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  const server = createServer(app);
  await registerRoutes(server, app, store);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  let customer = "",
    other = "",
    practitioner = "",
    c: CareCase;
  async function request(
    url: string,
    method = "GET",
    body?: unknown,
    cookie = customer,
    extra: Record<string, string> = {},
  ) {
    const response = await originalFetch(origin + url, {
      method,
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
        ...extra,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    return { response, data };
  }
  async function change(
    suffix: string,
    body: unknown,
    method = "POST",
    cookie = customer,
  ) {
    const result = await request(
      `/api/cases/${c.id}${suffix}`,
      method,
      { revision: c.revision, ...(body as object) },
      cookie,
    );
    assert.ok(
      result.response.ok,
      `Expected success for ${suffix}; received ${result.response.status}`,
    );
    c = result.data;
    return result;
  }
  const fullIntake = {
    ...blankIntake,
    name: "Pilot Test",
    age: "42",
    concern: "Synthetic test case",
    history: "None",
    medications: "Synthetic medication list",
    allergies: "Synthetic allergy history",
    pregnancy: "no" as const,
    pain: "0",
    energy: "6",
    sleep: "5",
    stress: "4",
    weight: "180",
    weightUnit: "lb" as const,
    height: "70",
    heightUnit: "in" as const,
    symptoms: ["Fatigue or energy crashes"],
    tongueColor: "Pink",
    diet: "Synthetic diet note",
  };
  const lab: Extraction = {
    patientName: "Pilot Test",
    collectionDate: "2026-10-01",
    laboratory: "Synthetic Lab",
    uncertainty: "Synthetic fixture only",
    results: [
      {
        name: "Vitamin D",
        value: "24",
        unit: "ng/mL",
        referenceRange: "30–100",
        flag: "low",
        sourcePage: "1",
      },
    ],
  };
  const report = Object.fromEntries(
    Object.keys(reportFields).map((k) => [
      k,
      `Synthetic reviewed ${k} section.`,
    ]),
  ) as Report;
  try {
    await t.test(
      "anonymous access and unsupported APIs fail closed",
      async () => {
        assert.equal(
          (await request("/api/cases", "GET", undefined, "")).response.status,
          401,
        );
        assert.equal(
          (await request("/api/unknown", "GET", undefined, "")).response.status,
          404,
        );
      },
    );
    await t.test(
      "real authentication, private session cookie, and reserved practitioner identity",
      async () => {
        const registered = await request(
          "/api/auth/register",
          "POST",
          { name: "Pilot Test", email: "pilot@example.com", password },
          "",
        );
        assert.equal(registered.response.status, 201);
        assert.equal(registered.data.user.role, "customer");
        assert.ok(!("passwordHash" in registered.data.user));
        const cookie = registered.response.headers.get("set-cookie")!;
        assert.match(cookie, /HttpOnly/i);
        assert.match(cookie, /SameSite=Lax/i);
        customer = cookie.split(";")[0];
        const second = await request(
          "/api/auth/register",
          "POST",
          { name: "Other Pilot", email: "other@example.com", password },
          "",
        );
        other = second.response.headers.get("set-cookie")!.split(";")[0];
        assert.equal(
          (
            await request(
              "/api/auth/register",
              "POST",
              { name: "Imposter", email: "practitioner@example.com", password },
              "",
            )
          ).response.status,
          403,
        );
        const login = await request(
          "/api/auth/login",
          "POST",
          { email: "practitioner@example.com", password },
          "",
        );
        assert.equal(login.response.status, 200);
        practitioner = login.response.headers.get("set-cookie")!.split(";")[0];
        assert.equal(
          (
            await request(
              "/api/auth/login",
              "POST",
              {
                email: "pilot@example.com",
                password: randomBytes(20).toString("hex"),
              },
              "",
            )
          ).response.status,
          401,
        );
        assert.equal(
          (
            await request(
              "/api/cases",
              "POST",
              { consent: true, pilot: true },
              customer,
              { Origin: "https://untrusted.example" },
            )
          ).response.status,
          403,
        );
      },
    );
    await t.test(
      "consent, case ownership and role authorization are enforced by the server",
      async () => {
        assert.equal(
          (await request("/api/cases", "POST", { consent: false, pilot: true }))
            .response.status,
          400,
        );
        const created = await request("/api/cases", "POST", {
          consent: true,
          pilot: true,
        });
        assert.equal(created.response.status, 201);
        c = created.data;
        assert.equal(c.payment.status, "unpaid-pilot");
        assert.equal(
          (await request(`/api/cases/${c.id}`, "GET", undefined, other))
            .response.status,
          404,
        );
        assert.equal(
          (
            await request(`/api/cases/${c.id}/approve`, "POST", {
              revision: 0,
              confirmation: true,
            })
          ).response.status,
          403,
        );
        assert.equal(
          (
            await request(`/api/cases/${c.id}/intake`, "PUT", {
              revision: 0,
              intake: blankIntake,
              submit: true,
            })
          ).response.status,
          400,
        );
      },
    );
    await t.test(
      "all intake fields persist across a store reopen and submission is validated",
      async () => {
        await change("/intake", { intake: fullIntake, submit: false }, "PUT");
        assert.equal(c.intake.medications, fullIntake.medications);
        assert.equal(c.intake.allergies, fullIntake.allergies);
        assert.equal(c.intake.weightUnit, "lb");
        if (!process.env.SHAMBA_TEST_DATABASE_URL) {
          const reopened = new FileStore(path.join(directory, "care.json"));
          assert.deepEqual(
            (await reopened.get<CareCase>("case", c.id))?.intake,
            fullIntake,
          );
        }
        await change("/intake", { intake: fullIntake, submit: true }, "PUT");
        assert.ok(c.intakeSubmittedAt);
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/draft`,
              "POST",
              { revision: c.revision, content: report },
              practitioner,
            )
          ).response.status,
          409,
        );
      },
    );
    await t.test(
      "files are checked and originals require case authorization",
      async () => {
        assert.equal(
          (
            await request(`/api/cases/${c.id}/documents`, "POST", {
              revision: c.revision,
              name: "bad.png",
              mime: "image/png",
              data: Buffer.from("not an image").toString("base64"),
              purpose: "lab",
            })
          ).response.status,
          400,
        );
        await change("/documents", {
          name: "synthetic-labs.txt",
          mime: "text/plain",
          data: Buffer.from(
            "Synthetic lab fixture; Vitamin D 24 ng/mL; range 30–100; low",
          ).toString("base64"),
          purpose: "lab",
        });
        const url = `/api/cases/${c.id}/documents/${c.documents[0].id}`;
        assert.equal(
          (await request(url, "GET", undefined, other)).response.status,
          404,
        );
        assert.equal(
          (await request(url, "GET", undefined, "")).response.status,
          401,
        );
        const original = await originalFetch(origin + url, {
          headers: { Cookie: customer },
        });
        assert.equal(original.status, 200);
        assert.match(
          original.headers.get("content-disposition")!,
          /^attachment/,
        );
        assert.match(await original.text(), /Synthetic lab fixture/);
      },
    );
    await t.test(
      "a lab request is separate from a recorded issued order",
      async () => {
        await change("/lab-request", {});
        assert.equal(c.labRequest?.status, "requested");
        await change(
          "/lab-order",
          {
            details: "Synthetic test order",
            externalReference: "SYNTHETIC-ORDER-1",
          },
          "POST",
          practitioner,
        );
        assert.equal(c.labRequest?.status, "ordered");
      },
    );
    await t.test(
      "AI needs explicit customer consent and never fabricates a fallback report",
      async () => {
        const url = `/api/cases/${c.id}/labs/${c.documents[0].id}/extract`;
        assert.equal(
          (await request(url, "POST", { revision: c.revision }, practitioner))
            .response.status,
          409,
        );
        await change("/ai-consent", { consent: true });
        assert.equal(
          (await request(url, "POST", { revision: c.revision }, practitioner))
            .response.status,
          503,
        );
        const current = (
          await request(`/api/cases/${c.id}`, "GET", undefined, practitioner)
        ).data;
        assert.ok(!current.draft);
        assert.ok(!current.documents[0].extraction);
      },
    );
    await t.test(
      "structured AI extraction preserves source facts and remains unverified",
      async () => {
        process.env.OPENAI_API_KEY = "synthetic-test-value-never-sent";
        globalThis.fetch = async (input, init) => {
          if (String(input).startsWith(origin))
            return originalFetch(input, init);
          assert.equal(String(input), "https://api.openai.com/v1/responses");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.store, false);
          assert.equal(body.text.format.strict, true);
          assert.match(body.instructions, /untrusted/);
          assert.equal(body.text.format.name, "lab_extraction");
          return new Response(
            JSON.stringify({
              status: "completed",
              output: [
                {
                  content: [{ type: "output_text", text: JSON.stringify(lab) }],
                },
              ],
            }),
            { status: 200 },
          );
        };
        await change(
          `/labs/${c.documents[0].id}/extract`,
          {},
          "POST",
          practitioner,
        );
        assert.deepEqual(c.documents[0].extraction, lab);
        assert.ok(!c.documents[0].verifiedAt);
        const customerCopy = (await request(`/api/cases/${c.id}`)).data;
        assert.ok(!customerCopy.documents[0].extraction);
        globalThis.fetch = originalFetch;
        delete process.env.OPENAI_API_KEY;
      },
    );
    await t.test(
      "identity confirmation and reviewed facts are required for verification",
      async () => {
        const url = `/api/cases/${c.id}/labs/${c.documents[0].id}/verify`;
        assert.equal(
          (
            await request(
              url,
              "PUT",
              {
                revision: c.revision,
                extraction: lab,
                identityConfirmed: false,
                verificationNote: "Checked synthetic source",
              },
              practitioner,
            )
          ).response.status,
          400,
        );
        await change(
          `/labs/${c.documents[0].id}/verify`,
          {
            extraction: lab,
            identityConfirmed: true,
            verificationNote: "Checked synthetic source and identity",
          },
          "PUT",
          practitioner,
        );
        assert.ok(c.documents[0].verifiedAt);
        assert.equal(c.documents[0].extraction?.results[0].unit, "ng/mL");
      },
    );
    await t.test(
      "AI report responses are validated and permission withdrawal invalidates a draft",
      async () => {
        process.env.OPENAI_API_KEY = "synthetic-test-value-never-sent";
        let invalid = true;
        globalThis.fetch = async (input, init) => {
          if (String(input).startsWith(origin))
            return originalFetch(input, init);
          assert.equal(String(input), "https://api.openai.com/v1/responses");
          const body = JSON.parse(String(init?.body));
          assert.equal(body.text.format.name, "care_report");
          assert.equal(body.store, false);
          const facts = JSON.parse(body.input[0].content[0].text);
          assert.equal(facts.labs[0].facts.results[0].unit, "ng/mL");
          assert.match(
            body.instructions,
            /never specify drug\/herb\/supplement dosing/,
          );
          return new Response(
            JSON.stringify({
              status: "completed",
              output: [
                {
                  content: [
                    {
                      type: "output_text",
                      text: JSON.stringify(
                        invalid ? { unexpected: true } : report,
                      ),
                    },
                  ],
                },
              ],
            }),
            { status: 200 },
          );
        };
        const rejected = await request(
          `/api/cases/${c.id}/draft`,
          "POST",
          { revision: c.revision, ai: true },
          practitioner,
        );
        assert.equal(rejected.response.status, 502);
        assert.ok(
          !(await request(`/api/cases/${c.id}`, "GET", undefined, practitioner))
            .data.draft,
        );
        invalid = false;
        await change("/draft", { ai: true }, "POST", practitioner);
        assert.equal(c.draft?.source, "ai");
        assert.deepEqual(c.draft?.content, report);
        assert.ok(!("draft" in (await request(`/api/cases/${c.id}`)).data));
        await change("/ai-consent", { consent: false });
        assert.ok(
          !(await request(`/api/cases/${c.id}`, "GET", undefined, practitioner))
            .data.draft,
        );
        globalThis.fetch = originalFetch;
        delete process.env.OPENAI_API_KEY;
      },
    );
    await t.test(
      "follow-up requests block release, private notes stay private and stale writes conflict",
      async () => {
        const stale = c.revision;
        await change(
          "/review",
          {
            practitionerNotes: "Synthetic private note",
            followupRequest: "Please clarify this synthetic history.",
          },
          "PUT",
          practitioner,
        );
        const copy = (await request(`/api/cases/${c.id}`)).data;
        assert.ok(!("practitionerNotes" in copy));
        assert.ok(!("events" in copy));
        assert.ok(copy.followupRequest);
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/draft`,
              "POST",
              { revision: c.revision, content: report },
              practitioner,
            )
          ).response.status,
          409,
        );
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/review`,
              "PUT",
              {
                revision: stale,
                practitionerNotes: "Stale",
                followupRequest: "",
              },
              practitioner,
            )
          ).response.status,
          409,
        );
        await change(
          "/review",
          { practitionerNotes: "Synthetic private note", followupRequest: "" },
          "PUT",
          practitioner,
        );
      },
    );
    await t.test(
      "drafts stay private and release requires approval of complete current content",
      async () => {
        await change(
          "/draft",
          { content: { ...report, safety: "" }, ai: false },
          "POST",
          practitioner,
        );
        assert.ok(!("draft" in (await request(`/api/cases/${c.id}`)).data));
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/approve`,
              "POST",
              { revision: c.revision, confirmation: true },
              practitioner,
            )
          ).response.status,
          400,
        );
        await change(
          "/draft",
          { content: report, ai: false },
          "POST",
          practitioner,
        );
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/approve`,
              "POST",
              { revision: c.revision, confirmation: false },
              practitioner,
            )
          ).response.status,
          400,
        );
        await change(
          "/review",
          { practitionerNotes: "Updated source review", followupRequest: "" },
          "PUT",
          practitioner,
        );
        assert.equal(
          (
            await request(
              `/api/cases/${c.id}/approve`,
              "POST",
              { revision: c.revision, confirmation: true },
              practitioner,
            )
          ).response.status,
          409,
        );
        await change(
          "/draft",
          { content: report, ai: false },
          "POST",
          practitioner,
        );
        await change("/approve", { confirmation: true }, "POST", practitioner);
        const copy = (await request(`/api/cases/${c.id}`)).data;
        assert.equal(copy.reports.length, 1);
        assert.deepEqual(copy.reports[0].content, report);
        assert.equal(copy.reports[0].author, "Pilot Practitioner");
        assert.ok(!copy.draft);
        assert.equal(
          (
            await request(`/api/cases/${c.id}/intake`, "PUT", {
              revision: c.revision,
              intake: fullIntake,
              submit: true,
            })
          ).response.status,
          409,
        );
        const first = c.reports[0];
        await change(
          "/draft",
          {
            content: { ...report, overview: "Updated synthetic report" },
            ai: false,
          },
          "POST",
          practitioner,
        );
        await change("/approve", { confirmation: true }, "POST", practitioner);
        assert.equal(c.reports.length, 2);
        assert.deepEqual(c.reports[0], first);
      },
    );
    await t.test(
      "hosted checkout does not mark a case paid; verified webhooks do",
      async () => {
        process.env.STRIPE_SECRET_KEY = "synthetic-stripe-value";
        process.env.STRIPE_WEBHOOK_SECRET = randomBytes(20).toString("hex");
        process.env.APP_BASE_URL = origin;
        c = (
          await request("/api/cases", "POST", { consent: true, pilot: false })
        ).data;
        assert.equal(c.payment.status, "pending");
        assert.equal(
          (
            await request(`/api/cases/${c.id}/intake`, "PUT", {
              revision: c.revision,
              intake: fullIntake,
              submit: true,
            })
          ).response.status,
          409,
        );
        globalThis.fetch = async (input, init) => {
          if (String(input).startsWith(origin))
            return originalFetch(input, init);
          assert.equal(
            String(input),
            "https://api.stripe.com/v1/checkout/sessions",
          );
          return new Response(
            JSON.stringify({
              id: "cs_synthetic",
              url: "https://checkout.stripe.com/c/pay/synthetic",
            }),
            { status: 200 },
          );
        };
        const checkout = await request(`/api/cases/${c.id}/checkout`, "POST", {
          revision: c.revision,
        });
        assert.equal(checkout.response.status, 200);
        globalThis.fetch = originalFetch;
        c = (await request(`/api/cases/${c.id}`)).data;
        assert.equal(c.payment.status, "pending");
        const webhook = async (
          object: unknown,
          type = "checkout.session.completed",
          valid = true,
        ) => {
          const data = { id: "evt_synthetic", type, data: { object } };
          const raw = JSON.stringify(data);
          const timestamp = String(Math.floor(Date.now() / 1000));
          const signature = createHmac(
            "sha256",
            process.env.STRIPE_WEBHOOK_SECRET!,
          )
            .update(`${timestamp}.${raw}`)
            .digest("hex");
          return request("/api/stripe/webhook", "POST", data, "", {
            "stripe-signature": `t=${timestamp},v1=${valid ? signature : "bad"}`,
          });
        };
        const session = {
          id: "cs_synthetic",
          metadata: { caseId: c.id },
          payment_status: "paid",
          amount_total: c.payment.amount,
          currency: "usd",
          payment_intent: "pi_synthetic",
        };
        assert.equal(
          (await webhook(session, "checkout.session.completed", false)).response
            .status,
          400,
        );
        assert.equal(
          (await webhook({ ...session, amount_total: 1 })).response.status,
          400,
        );
        assert.equal((await webhook(session)).response.status, 200);
        c = (await request(`/api/cases/${c.id}`)).data;
        assert.equal(c.payment.status, "paid");
        const rev = c.revision;
        assert.equal((await webhook(session)).response.status, 200);
        assert.equal((await request(`/api/cases/${c.id}`)).data.revision, rev);
        const refund = {
          metadata: { caseId: c.id },
          payment_intent: "pi_synthetic",
          amount: c.payment.amount,
          amount_refunded: c.payment.amount,
          currency: "usd",
        };
        assert.equal(
          (await webhook(refund, "charge.refunded")).response.status,
          200,
        );
        assert.equal(
          (await request(`/api/cases/${c.id}`)).data.payment.status,
          "refunded",
        );
      },
    );
    await t.test("sign-out invalidates the server session", async () => {
      assert.equal(
        (await request("/api/auth/logout", "POST", {})).response.status,
        200,
      );
      assert.equal((await request("/api/cases")).response.status, 401);
    });
  } finally {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await store.close();
    await rm(directory, { recursive: true, force: true });
    for (const key of Object.keys(process.env))
      if (!(key in originalEnv)) delete process.env[key];
    Object.assign(process.env, originalEnv);
  }
});

test("atomic file storage rejects concurrent stale writes", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "shamba-concurrency-"));
  const store = new FileStore(path.join(directory, "store.json"));
  try {
    await store.put("case", "test", { revision: 0 });
    const writes = await Promise.allSettled([
      store.put("case", "test", { revision: 1, value: "first" }, 0),
      store.put("case", "test", { revision: 1, value: "second" }, 0),
    ]);
    assert.equal(writes.filter((r) => r.status === "fulfilled").length, 1);
    assert.ok(
      writes.some(
        (r) => r.status === "rejected" && r.reason instanceof ConflictError,
      ),
    );
    assert.equal(
      (await store.get<{ revision: number }>("case", "test"))?.revision,
      1,
    );
  } finally {
    await store.close();
    await rm(directory, { recursive: true, force: true });
  }
});
