import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdate = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

import { resolveValidationAnomaly } from "@/services/upload/anomaly-service";

describe("anomaly-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: "anom-1", status: "accepted" }]),
        })),
      })),
    });
  });

  it("resolveValidationAnomaly updates anomaly status", async () => {
    const anomaly = await resolveValidationAnomaly("anom-1", "accepted");

    expect(mockUpdate).toHaveBeenCalled();
    expect(anomaly?.id).toBe("anom-1");
    expect(anomaly?.status).toBe("accepted");
  });

  it("resolveValidationAnomaly supports corrected and ignored actions", async () => {
    const returning = vi
      .fn()
      .mockResolvedValueOnce([{ id: "anom-2", status: "corrected" }])
      .mockResolvedValueOnce([{ id: "anom-3", status: "ignored" }]);

    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning,
        })),
      })),
    });

    const corrected = await resolveValidationAnomaly("anom-2", "corrected");
    const ignored = await resolveValidationAnomaly("anom-3", "ignored");

    expect(corrected?.status).toBe("corrected");
    expect(ignored?.status).toBe("ignored");
  });
});
