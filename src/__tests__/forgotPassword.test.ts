// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetEmail, sendEmail } from "@/lib/email";

const pending: (() => Promise<void>)[] = [];
const findFirst = vi.fn();
const allow = { allowed: true, remaining: 1, retryAfterSeconds: 0 };
const rateLimit = vi.fn(async () => allow);

vi.mock("next/server", async (orig) => ({ ...(await orig<typeof import("next/server")>()), after: (fn: () => Promise<void>) => pending.push(fn) }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findFirst: (...a: unknown[]) => findFirst(...a) } } }));
vi.mock("@/lib/rateLimit", async (orig) => ({ ...(await orig<typeof import("@/lib/rateLimit")>()), rateLimit: (...a: unknown[]) => rateLimit(...(a as [])) }));

const post = async (body: unknown) => {
  const { POST } = await import("@/app/api/account/forgot-password/route");
  const res = await POST(new Request("http://x/api/account/forgot-password", { method: "POST", body: JSON.stringify(body) }));
  for (const fn of pending.splice(0)) await fn();
  return res;
};

describe("forgot password", () => {
  const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("NEXTAUTH_SECRET", "secret");
    vi.stubEnv("NEXTAUTH_URL", "https://www.patrolready.au");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
    findFirst.mockReset();
    rateLimit.mockImplementation(async () => allow);
  });

  it("emails a reset link when the account exists", async () => {
    findFirst.mockResolvedValue({ id: "clx0abcdefghijklmnop", email: "a@b.co", passwordHash: "$2b$12$x" });
    const res = await post({ email: " A@B.co " });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(sent.to).toBe("a@b.co");
    expect(sent.text).toContain("https://www.patrolready.au/reset-password#clx0abcdefghijklmnop.");
  });

  it("gives the same answer and sends nothing when there's no account", async () => {
    findFirst.mockResolvedValue(null);
    const res = await post({ email: "nobody@b.co" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops emailing an address that's asked too often", async () => {
    findFirst.mockResolvedValue({ id: "clx0abcdefghijklmnop", email: "a@b.co", passwordHash: "$2b$12$x" });
    rateLimit.mockImplementation(async (key?: unknown) =>
      String(key).startsWith("forgot:email:") ? { allowed: false, remaining: 0, retryAfterSeconds: 60 } : allow
    );
    expect((await post({ email: "a@b.co" })).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects bad input, and is off without an email key", async () => {
    expect((await post({ email: "not-an-email" })).status).toBe(400);
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await post({ email: "a@b.co" })).status).toBe(503);
  });
});

describe("reset email", () => {
  it("includes the link and escapes it in the HTML", () => {
    const e = resetEmail("a@b.co", 'https://x/reset-password#a"b', 60);
    expect(e.text).toContain('https://x/reset-password#a"b');
    expect(e.html).not.toContain('#a"b');
    expect(e.html).toContain("60 minutes");
  });

  it("does nothing without an API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const f = vi.fn();
    expect(await sendEmail(resetEmail("a@b.co", "https://x", 60), f as unknown as typeof fetch)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
});
