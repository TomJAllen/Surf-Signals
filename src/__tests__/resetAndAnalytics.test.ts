import { describe, it, expect } from "vitest";
import { createResetToken, isResetTokenValid, parseResetToken, RESET_LINK_TTL_SECONDS } from "@/lib/passwordReset";
import { scrubEvent, isPrivatePath } from "@/lib/analyticsPrivacy";

describe("password reset links", () => {
  const secret = "test-secret";
  const userId = "clx0abcdefghijklmnop";
  const hash = "$2b$12$somebcrypthashvalue";
  const now = 1_800_000_000;

  const make = () => parseResetToken(createResetToken(userId, hash, secret, now))!;

  it("accepts a fresh link", () => {
    const parsed = make();
    expect(parsed.userId).toBe(userId);
    expect(isResetTokenValid(parsed, hash, secret, now + 60)).toBe(true);
  });

  it("expires after an hour", () => {
    expect(isResetTokenValid(make(), hash, secret, now + RESET_LINK_TTL_SECONDS + 1)).toBe(false);
  });

  it("stops working once the password has changed (single use)", () => {
    expect(isResetTokenValid(make(), "$2b$12$anewhash", secret, now)).toBe(false);
  });

  it("rejects a different secret, a tampered expiry or another user", () => {
    const parsed = make();
    expect(isResetTokenValid(parsed, hash, "other-secret", now)).toBe(false);
    expect(isResetTokenValid({ ...parsed, exp: parsed.exp + 3600 }, hash, secret, now)).toBe(false);
    expect(isResetTokenValid({ ...parsed, userId: "clx0zzzzzzzzzzzzzzzz" }, hash, secret, now)).toBe(false);
    expect(isResetTokenValid(parsed, hash, "", now)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    for (const t of [undefined, "", "a.b", "a.b.c.d", "x".repeat(400), `${userId}.soon.${"a".repeat(43)}`]) {
      expect(parseResetToken(t)).toBeNull();
    }
  });
});

describe("analytics privacy", () => {
  const ev = (props: Record<string, unknown>) => ({ event: "$autocapture", properties: props });

  it("drops everything on admin, account and reset pages", () => {
    expect(isPrivatePath("/admin/users")).toBe(true);
    expect(isPrivatePath("/account")).toBe(true);
    expect(isPrivatePath("/accounting")).toBe(false);
    expect(scrubEvent(ev({ $current_url: "https://a.app/admin/users" }))).toBeNull();
    expect(scrubEvent(ev({ $current_url: "https://a.app/account" }))).toBeNull();
    expect(scrubEvent(ev({}), "/reset-password")).toBeNull();
    expect(scrubEvent(ev({ $current_url: "https://a.app/learn" }))).not.toBeNull();
  });

  it("removes URL fragments and email-like text", () => {
    const out = scrubEvent(
      ev({
        $current_url: "https://a.app/learn#secret",
        $referrer: "https://a.app/x#t",
        $el_text: "tom@example.com",
        $elements: [{ tag_name: "p", $el_text: "eve@x.com" }, { tag_name: "a", $el_text: "Learn" }],
        $elements_chain: 'p:text="eve@x.com"nth-child="1"',
      })
    )!.properties!;
    expect(out.$current_url).toBe("https://a.app/learn");
    expect(out.$referrer).toBe("https://a.app/x");
    expect(out.$el_text).toBeUndefined();
    expect(out.$elements).toEqual([{ tag_name: "p" }, { tag_name: "a", $el_text: "Learn" }]);
    expect(String(out.$elements_chain)).not.toContain("@");
  });

  it("keeps ordinary button text", () => {
    expect(scrubEvent(ev({ $current_url: "https://a.app/", $el_text: "Agree and continue" }))!.properties!.$el_text).toBe(
      "Agree and continue"
    );
  });
});
