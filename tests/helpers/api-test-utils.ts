import { expect } from "vitest";
import { DEMO_ORG_ID, mockAuthUser } from "./service-fixtures";

/** Use in route integration tests instead of importing AuthError from the mocked auth module. */
export class TestAuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function buildRequest(
  url: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Request {
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: options.headers,
  };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
    init.headers = { "Content-Type": "application/json", ...init.headers };
  }
  return new Request(url, init);
}

export async function parseJsonResponse(response: Response) {
  return response.json() as Promise<{
    success: boolean;
    data?: unknown;
    error?: { code: string; message: string };
  }>;
}

export async function expectSuccessEnvelope(response: Response, status = 200) {
  expect(response.status).toBe(status);
  const body = await parseJsonResponse(response);
  expect(body.success).toBe(true);
  expect(body.data).toBeDefined();
  return body;
}

export async function expectErrorEnvelope(
  response: Response,
  code: string,
  status: number,
) {
  expect(response.status).toBe(status);
  const body = await parseJsonResponse(response);
  expect(body.success).toBe(false);
  expect(body.error?.code).toBe(code);
  return body;
}

export function mockAuthSuccess() {
  return {
    requireAuthenticatedUser: async () => mockAuthUser,
    requireOrgMembership: async () => ({ organization_id: DEMO_ORG_ID, user_id: mockAuthUser.id }),
    AuthError: TestAuthError,
  };
}

export function mockAuthUnauthorized() {
  return {
    requireAuthenticatedUser: async () => {
      throw new TestAuthError("UNAUTHORIZED", "Authentication required.");
    },
    requireOrgMembership: async () => {
      throw new TestAuthError("FORBIDDEN", "User is not a member of this organization.");
    },
    AuthError: TestAuthError,
  };
}

export function orgQueryUrl(path: string, organizationId = DEMO_ORG_ID): string {
  const separator = path.includes("?") ? "&" : "?";
  return `http://localhost:3000${path}${separator}organizationId=${organizationId}`;
}
