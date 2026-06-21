import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_USER_ID } from "../../../helpers/service-fixtures";

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    query: {
      users: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/services/user/user-service";

describe("user-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({
      id: DEMO_USER_ID,
      email: "demo@harvest.local",
      first_name: "Demo",
      last_name: "User",
      avatar_url: "https://example.com/avatar.png",
      is_active: true,
    });
    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: DEMO_USER_ID,
              email: "demo@harvest.local",
              first_name: "Updated",
              last_name: "Name",
              avatar_url: null,
            },
          ]),
        })),
      })),
    });
  });

  it("getCurrentUserProfile maps user row to profile", async () => {
    const profile = await getCurrentUserProfile(DEMO_USER_ID);

    expect(profile).toEqual({
      id: DEMO_USER_ID,
      email: "demo@harvest.local",
      fullName: "Demo User",
      avatarUrl: "https://example.com/avatar.png",
    });
  });

  it("getCurrentUserProfile returns null when user is missing", async () => {
    mockFindFirst.mockResolvedValue(null);

    const profile = await getCurrentUserProfile("missing-user");
    expect(profile).toBeNull();
  });

  it("updateCurrentUserProfile splits full name and returns profile", async () => {
    const profile = await updateCurrentUserProfile(DEMO_USER_ID, {
      fullName: "Updated Name",
    });

    expect(mockUpdate).toHaveBeenCalled();
    expect(profile.fullName).toBe("Updated Name");
    expect(profile.email).toBe("demo@harvest.local");
  });

  it("updateCurrentUserProfile throws when user is not found", async () => {
    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
    });

    await expect(
      updateCurrentUserProfile("missing-user", { fullName: "Nobody" }),
    ).rejects.toThrow("USER_NOT_FOUND");
  });
});
