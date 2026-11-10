// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { records } from "./records";
import { handleMockRequest, type IncomingMockRequest } from "./router";
import { DEMO_ACCOUNT } from "./demoAccount";
import { seedIfEmpty } from "./seed";
import { createMemoryStore, type MockStore } from "./store";

const NOW = new Date("2026-11-10T12:00:00Z");
let store: MockStore;

// Sends a request the way mockBaseQuery does: the session comes from the store.
async function call(method: string, url: string, extra: Omit<IncomingMockRequest, "method" | "url"> = {}) {
  const db = records(store);
  return handleMockRequest({ method, url, ...extra }, { db, store, userId: await db.session.userId(), now: () => NOW });
}

const signInDemo = () => call("POST", "/auth/login", { body: DEMO_ACCOUNT });

beforeEach(async () => {
  store = createMemoryStore();
  await seedIfEmpty(store, NOW);
});

describe("mock auth", () => {
  it("signs the demo account in and out", async () => {
    expect((await call("GET", "/auth/session")).status).toBe(401);

    expect((await signInDemo()).status).toBe(204);
    expect(await call("GET", "/auth/session")).toEqual({
      status: 200,
      data: { userId: "user_demo_ada", firstName: "Ada", lastName: "Okafor", email: DEMO_ACCOUNT.email },
    });

    await call("POST", "/auth/logout");
    expect((await call("GET", "/auth/session")).status).toBe(401);
  });

  it("gives one answer for a wrong password and an unknown email", async () => {
    const wrongPassword = await call("POST", "/auth/login", { body: { email: DEMO_ACCOUNT.email, password: "nope-nope" } });
    const unknownEmail = await call("POST", "/auth/login", { body: { email: "nobody@example.com", password: "password123" } });
    expect(wrongPassword).toEqual({ status: 401, data: { error: "invalid_credentials" } });
    expect(unknownEmail).toEqual(wrongPassword);
  });

  it("matches the email case-insensitively", async () => {
    expect((await call("POST", "/auth/login", { body: { ...DEMO_ACCOUNT, email: " ADA.Okafor@Example.com " } })).status).toBe(204);
  });

  it("registers a new account, signs it in, and refuses the same email twice", async () => {
    const body = { firstName: "Tunde", lastName: "Bello", email: "tunde@example.com", password: "long-enough", termsAccepted: true };

    expect((await call("POST", "/auth/register", { body })).status).toBe(201);
    expect((await call("GET", "/auth/session")).data).toMatchObject({ firstName: "Tunde", email: "tunde@example.com" });
    expect((await call("POST", "/auth/register", { body: { ...body, email: "TUNDE@example.com" } })).status).toBe(409);

    await call("POST", "/auth/logout");
    expect((await call("POST", "/auth/login", { body: { email: "tunde@example.com", password: "long-enough" } })).status).toBe(204);
  });

  it("never stores the password itself", async () => {
    const [user] = await records(store).users.all();
    expect(JSON.stringify(user)).not.toContain(DEMO_ACCOUNT.password);
  });

  it("accepts any password-reset request, so it can't be used to find accounts", async () => {
    expect((await call("POST", "/auth/password/forgot", { body: { email: "nobody@example.com" } })).status).toBe(202);
  });
});

describe("mock library and history", () => {
  it("keeps per-user data from guests", async () => {
    for (const [method, url] of [["GET", "/library/sermons"], ["GET", "/history"], ["PUT", "/library/sermons/living-by-faith"], ["GET", "/me/settings"]]) {
      expect((await call(method, url)).status).toBe(401);
    }
  });

  it("lists the demo account's saved sermons newest first, and saves and unsaves", async () => {
    await signInDemo();
    const ids = async () => ((await call("GET", "/library/sermons")).data as { sermon: { id: string } }[]).map((s) => s.sermon.id);

    expect((await ids())[0]).toBe("living-by-faith");
    await call("PUT", "/library/sermons/a-heart-of-worship");
    expect((await ids())[0]).toBe("a-heart-of-worship");
    await call("PUT", "/library/sermons/a-heart-of-worship");
    expect((await ids()).filter((id) => id === "a-heart-of-worship")).toHaveLength(1);
    await call("DELETE", "/library/sermons/a-heart-of-worship");
    expect(await ids()).not.toContain("a-heart-of-worship");
    expect((await call("PUT", "/library/sermons/no-such-sermon")).status).toBe(404);
  });

  it("records progress, marks the end as finished, and clears", async () => {
    await signInDemo();
    const history = async () => (await call("GET", "/history")).data as { sermon: { id: string }; positionSeconds: number; finished: boolean }[];

    await call("PUT", "/history/a-heart-of-worship", { body: { positionSeconds: 90.4 } });
    expect((await history())[0]).toMatchObject({ sermon: { id: "a-heart-of-worship" }, positionSeconds: 90, finished: false });

    // 36 minutes long: 5 seconds before the end counts as finished, and positions past the end are clamped.
    await call("PUT", "/history/a-heart-of-worship", { body: { positionSeconds: 36 * 60 - 5 } });
    expect((await history())[0]).toMatchObject({ finished: true });
    await call("PUT", "/history/a-heart-of-worship", { body: { positionSeconds: 99_999 } });
    expect((await history())[0].positionSeconds).toBe(36 * 60);

    expect((await call("PUT", "/history/a-heart-of-worship", { body: { positionSeconds: -1 } })).status).toBe(400);

    await call("DELETE", "/history/a-heart-of-worship");
    expect((await history()).map((entry) => entry.sermon.id)).not.toContain("a-heart-of-worship");
    await call("DELETE", "/history");
    expect(await history()).toEqual([]);
  });
});

describe("mock notes, settings and export", () => {
  it("adds notes in time order and validates them", async () => {
    await signInDemo();
    await call("POST", "/notes", { body: { sermonId: "arise-and-shine", atSeconds: 60, text: "  Early thought  " } });
    const notes = (await call("GET", "/notes", { params: { sermonId: "arise-and-shine" } })).data as { atSeconds: number; text: string }[];
    expect(notes.map((note) => [note.atSeconds, note.text])).toEqual([
      [60, "Early thought"],
      [380, "I want to make more room for Scripture and prayer in my mornings."],
    ]);
    expect((await call("POST", "/notes", { body: { sermonId: "arise-and-shine", atSeconds: 5, text: "   " } })).status).toBe(400);
  });

  it("updates analytics consent", async () => {
    await signInDemo();
    expect((await call("GET", "/me/settings")).data).toEqual({ allowAnalytics: false });
    expect((await call("PATCH", "/me/settings", { body: { allowAnalytics: true } })).data).toEqual({ allowAnalytics: true });
    expect((await call("PATCH", "/me/settings", { body: { allowAnalytics: "yes" } })).status).toBe(400);
  });

  it("exports the user's data without the password hash", async () => {
    await signInDemo();
    const { data } = await call("GET", "/me/export");
    expect(data).toMatchObject({ profile: { email: DEMO_ACCOUNT.email }, savedSermons: expect.any(Array), notes: expect.any(Array) });
    expect(JSON.stringify(data)).not.toMatch(/passwordHash|fnv1a/);
  });
});

describe("mock sermons and Bible", () => {
  it("serves the catalogue with filters, search and single sermons", async () => {
    expect((await call("GET", "/sermons", { params: { topic: "faith" } })).data).toMatchObject({ total: 3 });
    expect((await call("GET", "/sermons/search?q=hebrews&in=scripture")).data).toMatchObject({ total: 2 });
    expect((await call("GET", "/sermons/arise-and-shine")).data).toMatchObject({ title: "Arise and Shine" });
    expect((await call("GET", "/sermons/nope")).status).toBe(404);
  });

  it("serves KJV passages and 404s for anything else", async () => {
    expect((await call("GET", "/bible/passage", { params: { ref: "Isaiah 60:1", version: "KJV" } })).data).toEqual({
      reference: "Isaiah 60:1",
      version: "KJV",
      text: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    });
    expect((await call("GET", "/bible/passage", { params: { ref: "Isaiah 60:1", version: "NIV" } })).status).toBe(404);
    expect((await call("GET", "/bible/passage", { params: { ref: "Obadiah 1:1" } })).status).toBe(404);
  });

  it("answers 404 for unknown routes", async () => {
    expect((await call("GET", "/nowhere")).status).toBe(404);
  });
});

describe("mock reports", () => {
  it("takes a report from a guest, about a sermon or in general", async () => {
    const aboutSermon = await call("POST", "/reports", { body: { sermonId: "arise-and-shine", reason: "rights_concern", details: "", email: "" } });
    expect(aboutSermon.status).toBe(201);
    expect((await call("POST", "/reports", { body: { reason: "other", details: "The app is great", email: "a@b.co" } })).status).toBe(201);
    expect(await store.get<unknown[]>("reports")).toHaveLength(2);
  });

  it("rejects incomplete or invalid reports", async () => {
    expect((await call("POST", "/reports", { body: { reason: "spam" } })).status).toBe(400);
    expect((await call("POST", "/reports", { body: { reason: "other", details: "  " } })).status).toBe(400);
    expect((await call("POST", "/reports", { body: { reason: "other", details: "x", email: "nope" } })).status).toBe(400);
    expect((await call("POST", "/reports", { body: { reason: "other", details: "x", sermonId: "missing" } })).status).toBe(404);
  });
});
