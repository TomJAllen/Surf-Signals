import { describe, it, expect, vi } from "vitest";
import { checkAccount, forgetAccount, SESSION_CHECK_TTL_MS } from "@/lib/sessionCheck";

const acct = (sv: number) => ({ role: "user", termsVersion: null, sessionVersion: sv, name: null, email: "a@b.c" });

describe("checkAccount", () => {
  it("shares one lookup for a few seconds, then looks again", async () => {
    const load = vi.fn().mockResolvedValue(acct(0));
    await checkAccount("u1", load, { now: 1000 });
    await checkAccount("u1", load, { now: 1000 + SESSION_CHECK_TTL_MS - 1 });
    expect(load).toHaveBeenCalledTimes(1);
    await checkAccount("u1", load, { now: 1000 + SESSION_CHECK_TTL_MS });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("reads fresh when asked or after forgetAccount", async () => {
    const load = vi.fn().mockResolvedValueOnce(acct(0)).mockResolvedValueOnce(acct(1)).mockResolvedValueOnce(acct(2));
    await checkAccount("u2", load, { now: 0 });
    expect((await checkAccount("u2", load, { now: 1, fresh: true }))?.sessionVersion).toBe(1);
    forgetAccount("u2");
    expect((await checkAccount("u2", load, { now: 2 }))?.sessionVersion).toBe(2);
  });

  it("remembers a deleted account as missing", async () => {
    const load = vi.fn().mockResolvedValue(null);
    expect(await checkAccount("gone", load, { now: 0 })).toBeNull();
    expect(await checkAccount("gone", load, { now: 1 })).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
