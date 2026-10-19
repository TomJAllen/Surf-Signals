import { describe, it, expect, vi } from "vitest";

// admin.ts imports the auth config and Prisma; stub them so the pure helpers load
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { decide, clientIp } from "@/lib/rateLimit";
import { isAllowedAdmin, parseAdminEmails } from "@/lib/admin";
import { stripSslParams, decodeCa, pgSslConfig } from "@/lib/dbSsl";
import { needsToAcceptTerms, TERMS_VERSION } from "@/content/legal";

describe("rate limiting", () => {
  const rule = { limit: 3, windowSeconds: 60 };
  const t0 = new Date("2026-10-19T00:00:00Z");
  const at = (s: number) => new Date(t0.getTime() + s * 1000);

  it("allows up to the limit, then blocks with a retry time", () => {
    let stored: { count: number; windowStart: Date } | null = null;
    const results = [];
    for (let i = 0; i < 4; i++) {
      const d = decide(stored, rule, at(i));
      stored = { count: d.count, windowStart: d.windowStart };
      results.push(d.result);
    }
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3].retryAfterSeconds).toBe(57);
  });

  it("starts a fresh window once the old one has passed", () => {
    const d = decide({ count: 99, windowStart: t0 }, rule, at(61));
    expect(d.result.allowed).toBe(true);
    expect(d.count).toBe(1);
  });

  it("reads the first forwarded IP", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp({ "x-real-ip": "5.6.7.8" })).toBe("5.6.7.8");
    expect(clientIp({})).toBe("unknown");
  });
});

describe("admin access", () => {
  const admin = { email: "Tom@Example.com", role: "admin" };

  it("needs the admin role AND an allow-listed email in production", () => {
    expect(isAllowedAdmin(admin, "tom@example.com", true)).toBe(true);
    expect(isAllowedAdmin(admin, " other@x.com , TOM@example.com ", true)).toBe(true);
    expect(isAllowedAdmin({ ...admin, role: "user" }, "tom@example.com", true)).toBe(false);
    expect(isAllowedAdmin({ email: "eve@example.com", role: "admin" }, "tom@example.com", true)).toBe(false);
  });

  it("fails closed in production when no allowlist is set", () => {
    expect(isAllowedAdmin(admin, undefined, true)).toBe(false);
    expect(isAllowedAdmin(admin, "", true)).toBe(false);
  });

  it("allows role-only admins in development for convenience", () => {
    expect(isAllowedAdmin(admin, undefined, false)).toBe(true);
    expect(isAllowedAdmin(null, undefined, false)).toBe(false);
  });

  it("parses the allowlist", () => {
    expect([...parseAdminEmails("A@b.com,, c@d.com ")]).toEqual(["a@b.com", "c@d.com"]);
  });
});

describe("database TLS", () => {
  it("removes ssl settings from the URL so they can't override the code's TLS config", () => {
    expect(stripSslParams("postgresql://u:p@h:6543/db?pgbouncer=true&sslmode=require")).toBe(
      "postgresql://u:p@h:6543/db?pgbouncer=true"
    );
    expect(stripSslParams("postgresql://u:p@h/db?sslmode=require")).toBe("postgresql://u:p@h/db");
    expect(stripSslParams("postgresql://u:p@h/db")).toBe("postgresql://u:p@h/db");
  });

  it("accepts the CA as PEM, PEM with escaped newlines, or base64", () => {
    const pem = "-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----";
    expect(decodeCa(pem)).toBe(pem);
    expect(decodeCa(pem.replace(/\n/g, "\\n"))).toBe(pem);
    expect(decodeCa(Buffer.from(pem).toString("base64"))).toBe(pem);
    expect(decodeCa("")).toBeUndefined();
  });

  it("verifies against the CA when one is configured", () => {
    vi.stubEnv("DATABASE_CA_CERT", "-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----");
    expect(pgSslConfig("postgresql://u:p@h/db")).toMatchObject({ rejectUnauthorized: true });
    vi.unstubAllEnvs();
    expect(pgSslConfig("postgresql://u:p@h/db?sslmode=disable")).toBe(false);
  });
});

describe("terms acceptance", () => {
  it("asks users without the current version to accept", () => {
    expect(needsToAcceptTerms(null)).toBe(true);
    expect(needsToAcceptTerms("2020-01-01")).toBe(true);
    expect(needsToAcceptTerms(TERMS_VERSION)).toBe(false);
  });
});
