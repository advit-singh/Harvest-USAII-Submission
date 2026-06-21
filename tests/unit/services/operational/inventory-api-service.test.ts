import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectChain } from "../../../helpers/db-mock";
import { DEMO_ORG_ID, DEMO_SITE_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    query: {
      inventory_items: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      inventory_categories: { findFirst: vi.fn().mockResolvedValue({ name: "Dairy" }) },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: "item-1",
              organization_id: DEMO_ORG_ID,
              site_id: DEMO_SITE_ID,
              category_id: "cat-1",
              name: "Milk",
              description: null,
              unit_type: "gal",
              default_cost: "3.50",
            },
          ]),
        })),
      })),
    })),
  },
}));

import {
  getInventoryItemById,
  listInventoryItems,
  listInventoryLots,
} from "@/services/operational/inventory-api-service";

describe("inventory-api-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let call = 0;
    mockSelect.mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return {
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([
            {
              item: {
                id: "item-1",
                organization_id: DEMO_ORG_ID,
                site_id: DEMO_SITE_ID,
                category_id: "cat-1",
                name: "Milk",
                description: null,
                unit_type: "gal",
                default_cost: "3.50",
              },
              categoryName: "Dairy",
            },
          ]),
        };
      }
      return createSelectChain([
        {
          inventory_item_id: "item-1",
          remaining_quantity: "10",
          quantity: "12",
          expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      ]);
    });
    mockFindFirst.mockResolvedValue({
      id: "item-1",
      organization_id: DEMO_ORG_ID,
      site_id: DEMO_SITE_ID,
      category_id: "cat-1",
      name: "Milk",
      description: null,
      unit_type: "gal",
      default_cost: "3.50",
    });
  });

  it("listInventoryItems aggregates lot quantities", async () => {
    const items = await listInventoryItems({ organizationId: DEMO_ORG_ID });

    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe("Milk");
    expect(items[0]?.categoryName).toBe("Dairy");
    expect(items[0]?.totalQuantity).toBe("10");
    expect(items[0]?.expiringLots).toBe(1);
  });

  it("listInventoryItems returns empty list when no items match", async () => {
    mockSelect.mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
    }));

    const items = await listInventoryItems({ organizationId: DEMO_ORG_ID });
    expect(items).toEqual([]);
  });

  it("getInventoryItemById returns null when item is missing", async () => {
    mockFindFirst.mockResolvedValue(null);
    const item = await getInventoryItemById("missing", DEMO_ORG_ID);
    expect(item).toBeNull();
  });

  it("listInventoryLots maps lots for organization items", async () => {
    let call = 0;
    mockSelect.mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return createSelectChain([
          {
            id: "item-1",
            organization_id: DEMO_ORG_ID,
            name: "Milk",
          },
        ]);
      }
      return createSelectChain([
        {
          id: "lot-1",
          inventory_item_id: "item-1",
          site_id: DEMO_SITE_ID,
          quantity: "12",
          remaining_quantity: "10",
          unit: "gal",
          expiration_date: new Date("2025-07-01"),
          storage_location: "Walk-in",
        },
      ]);
    });

    const lots = await listInventoryLots({ organizationId: DEMO_ORG_ID });
    expect(lots).toHaveLength(1);
    expect(lots[0]?.itemName).toBe("Milk");
    expect(lots[0]?.remainingQuantity).toBe("10");
  });
});
