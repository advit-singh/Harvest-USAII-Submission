import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES } from "@/lib/auth/routes";

describe("protected routes", () => {
  it("defines public auth routes", () => {
    expect(PUBLIC_ROUTES).toContain("/login");
    expect(PUBLIC_ROUTES).toContain("/register");
    expect(PUBLIC_ROUTES).toContain("/reset-password");
  });

  it("does not include dashboard as public", () => {
    expect(PUBLIC_ROUTES).not.toContain("/dashboard");
  });
});
