const STORAGE_KEYS = {
  organizations: "harvest-mock-orgs",
  sites: "harvest-mock-sites",
  settings: "harvest-mock-settings",
  orgMeta: "harvest-mock-org-meta",
} as const;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadPersistedJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersistedJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export interface OrgMeta {
  operationalFocus?: string;
  webhookUrl?: string;
}

export function loadMockOrganizations<T>(): T[] {
  return loadPersistedJson(STORAGE_KEYS.organizations, [] as T[]);
}

export function saveMockOrganizations<T>(orgs: T[]): void {
  savePersistedJson(STORAGE_KEYS.organizations, orgs);
}

export function loadMockSites<T>(): T[] {
  return loadPersistedJson(STORAGE_KEYS.sites, [] as T[]);
}

export function saveMockSites<T>(sites: T[]): void {
  savePersistedJson(STORAGE_KEYS.sites, sites);
}

export function loadMockSettingsMap(): Record<string, unknown> {
  return loadPersistedJson(STORAGE_KEYS.settings, {});
}

export function saveMockSettingsMap(map: Record<string, unknown>): void {
  savePersistedJson(STORAGE_KEYS.settings, map);
}

export function loadOrgMetaMap(): Record<string, OrgMeta> {
  return loadPersistedJson(STORAGE_KEYS.orgMeta, {});
}

export function saveOrgMetaMap(map: Record<string, OrgMeta>): void {
  savePersistedJson(STORAGE_KEYS.orgMeta, map);
}

export function setOrgMeta(orgId: string, meta: Partial<OrgMeta>): void {
  const map = loadOrgMetaMap();
  map[orgId] = { ...map[orgId], ...meta };
  saveOrgMetaMap(map);
}

export function getOrgMeta(orgId: string): OrgMeta {
  return loadOrgMetaMap()[orgId] ?? {};
}
