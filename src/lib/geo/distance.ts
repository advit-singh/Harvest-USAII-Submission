/** Haversine distance in kilometers between two lat/lng points. */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export function parseCoordinate(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function distanceKm(
  from: GeoPoint | null,
  to: GeoPoint | null,
  fallbackKm = 5,
): number {
  if (!from || !to) return fallbackKm;
  return Math.round(haversineKm(from, to) * 10) / 10;
}
