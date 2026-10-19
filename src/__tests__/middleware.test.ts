// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { canonicalRedirect } from "@/middleware";

const req = (url: string) => new NextRequest(url, { headers: { host: new URL(url).host } });

describe("canonical address", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends Vercel alias addresses to the main one on the live site", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXTAUTH_URL", "https://surf-signals.vercel.app");
    const r = canonicalRedirect(req("https://surf-signals-team-abc123.vercel.app/login?x=1"));
    expect(r?.status).toBe(308);
    expect(r?.headers.get("location")).toBe("https://surf-signals.vercel.app/login?x=1");
  });

  it("leaves the main address, custom domains and previews alone", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXTAUTH_URL", "https://surf-signals.vercel.app");
    expect(canonicalRedirect(req("https://surf-signals.vercel.app/test"))).toBeNull();
    expect(canonicalRedirect(req("https://surfsignals.com.au/test"))).toBeNull();
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(canonicalRedirect(req("https://surf-signals-git-x.vercel.app/"))).toBeNull();
  });
});
