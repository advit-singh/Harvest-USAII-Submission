import type { ApiResponse } from "@/types/api";
import { isMockApiEnabled as checkMockApiEnabled } from "@/lib/api/api-mode";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function isMockApiEnabled(): boolean {
  return checkMockApiEnabled();
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = `${baseUrl}/api/v1${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success || json.error) {
    throw new ApiClientError(
      json.error?.code ?? "INTERNAL_ERROR",
      json.error?.message ?? "An unexpected error occurred.",
    );
  }

  return json.data as T;
}
