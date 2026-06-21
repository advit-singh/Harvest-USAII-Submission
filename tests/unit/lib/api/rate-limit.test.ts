import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitBuckets } from "@/lib/api/rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimitBuckets();
  });

  it("allows requests within limit", () => {
    const key = "test:user-1";
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    const key = "test:user-2";
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const blocked = checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets buckets independently per key", () => {
    checkRateLimit("a", 1, 60_000);
    checkRateLimit("b", 1, 60_000);
    expect(checkRateLimit("a", 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit("b", 1, 60_000).allowed).toBe(false);
  });

  it("clears all buckets via resetRateLimitBuckets", () => {
    checkRateLimit("reset-test", 1, 60_000);
    resetRateLimitBuckets();
    expect(checkRateLimit("reset-test", 1, 60_000).allowed).toBe(true);
  });
});
