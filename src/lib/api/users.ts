import { apiClient } from "@/lib/api/client";
import type { UserProfile, UpdateUserProfileInput } from "@/types/user";

let mockUser: UserProfile = {
  id: "user_mock",
  email: "demo@projectharvest.app",
  fullName: "Demo User",
};

export function setMockUser(user: UserProfile): void {
  mockUser = user;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    return mockUser;
  }
  return apiClient<UserProfile>("/users/me");
}

export async function updateCurrentUser(
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    mockUser = { ...mockUser, ...input };
    return mockUser;
  }
  return apiClient<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
