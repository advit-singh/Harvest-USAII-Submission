import { vi } from "vitest";

/** Builds a chainable Drizzle-style select mock that resolves to `rows`. */
export function createSelectChain(rows: unknown[] = []) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown[]) => void) => resolve(rows),
  };
  return chain;
}

/** Minimal db mock with configurable query.findFirst handlers. */
export function createDbMock(options: {
  selectRows?: unknown[];
  findFirstHandlers?: Record<string, unknown | null>;
  insertReturning?: unknown[];
  updateReturning?: unknown[];
  deleteResult?: unknown;
} = {}) {
  const findFirstHandlers = options.findFirstHandlers ?? {};

  const queryProxy = new Proxy(
    {},
    {
      get(_target, table: string) {
        return {
          findFirst: vi.fn().mockImplementation(async () => findFirstHandlers[table] ?? null),
          findMany: vi.fn().mockResolvedValue([]),
        };
      },
    },
  );

  return {
    select: vi.fn(() => createSelectChain(options.selectRows ?? [])),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue(options.insertReturning ?? []),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue(options.updateReturning ?? []),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue(options.deleteResult),
    })),
    query: queryProxy,
  };
}
