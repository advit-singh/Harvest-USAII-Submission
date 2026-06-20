import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { organization_settings, organization_sites, organizations } from "@/db/schema";
import {
  estimateWeatherAttendanceImpact,
  fetchDailyWeatherForecast,
  geocodeLocation,
} from "@/lib/external/open-meteo-client";
import {
  estimateHolidayAttendanceImpact,
  fetchUpcomingPublicHolidays,
  type PublicHoliday,
} from "@/lib/external/nager-holidays-client";

export interface ExternalDataContext {
  enabled: boolean;
  locationName: string | null;
  weather: {
    rainyDays: number;
    totalPrecipitationMm: number;
    severeWeatherDays: number;
    attendanceImpact: number;
    summary: string;
  } | null;
  holidays: PublicHoliday[];
  holidayAttendanceImpact: number;
  combinedAttendanceImpact: number;
  sources: string[];
}

const EMPTY_CONTEXT: ExternalDataContext = {
  enabled: false,
  locationName: null,
  weather: null,
  holidays: [],
  holidayAttendanceImpact: 0,
  combinedAttendanceImpact: 0,
  sources: [],
};

export async function loadExternalDataContext(input: {
  organizationId: string;
  siteId: string;
  horizonDays: number;
}): Promise<ExternalDataContext> {
  const enabled = await isExternalDataEnabled(input.organizationId);
  if (!enabled) {
    return { ...EMPTY_CONTEXT };
  }

  const [site, org] = await Promise.all([
    db.query.organization_sites.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, input.siteId),
    }),
    db.query.organizations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, input.organizationId),
    }),
  ]);

  if (!site || !org) {
    return { ...EMPTY_CONTEXT, enabled: true };
  }

  const coords = await resolveCoordinates(site, org);
  if (!coords) {
    return {
      ...EMPTY_CONTEXT,
      enabled: true,
      sources: ["Open-Meteo (geocoding unavailable)"],
    };
  }

  if (!site.latitude || !site.longitude) {
    void persistSiteCoordinates(site.id, coords.latitude, coords.longitude);
  }

  const sources = ["Open-Meteo"];
  const [weather, holidays] = await Promise.all([
    fetchDailyWeatherForecast(coords.latitude, coords.longitude, input.horizonDays),
    fetchUpcomingPublicHolidays(org.country ?? "US", input.horizonDays),
  ]);

  if (holidays.length > 0) {
    sources.push("Nager.Date");
  }

  const weatherImpact = weather ? estimateWeatherAttendanceImpact(weather) : 0;
  const holidayImpact = estimateHolidayAttendanceImpact(holidays);
  const combinedImpact = Math.max(-0.35, weatherImpact + holidayImpact);

  return {
    enabled: true,
    locationName: coords.name,
    weather: weather
      ? {
          rainyDays: weather.rainyDays,
          totalPrecipitationMm: Math.round(weather.totalPrecipitationMm * 10) / 10,
          severeWeatherDays: weather.severeWeatherDays,
          attendanceImpact: weatherImpact,
          summary: buildWeatherSummary(weather, coords.name),
        }
      : null,
    holidays,
    holidayAttendanceImpact: holidayImpact,
    combinedAttendanceImpact: combinedImpact,
    sources,
  };
}

async function isExternalDataEnabled(organizationId: string): Promise<boolean> {
  const settings = await db.query.organization_settings.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
  });
  const json = settings?.settings_json as { forecast?: { externalDataEnabled?: boolean } } | null;
  return json?.forecast?.externalDataEnabled ?? true;
}

async function resolveCoordinates(
  site: typeof organization_sites.$inferSelect,
  org: typeof organizations.$inferSelect,
) {
  const lat = site.latitude ? Number(site.latitude) : NaN;
  const lon = site.longitude ? Number(site.longitude) : NaN;

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { latitude: lat, longitude: lon, name: site.name };
  }

  const query = [site.address, org.city, org.state, org.country].filter(Boolean).join(", ");
  if (!query) {
    return geocodeLocation(org.city ?? "Chicago");
  }

  return geocodeLocation(query);
}

function buildWeatherSummary(
  weather: NonNullable<Awaited<ReturnType<typeof fetchDailyWeatherForecast>>>,
  locationName: string,
): string {
  if (weather.severeWeatherDays > 0) {
    return `Severe weather expected near ${locationName} — historically reduces cafeteria participation`;
  }
  if (weather.rainyDays >= 2) {
    return `${weather.rainyDays} rainy days forecast near ${locationName} (${weather.totalPrecipitationMm.toFixed(1)} mm total precipitation)`;
  }
  if (weather.rainyDays === 1) {
    return `Rain expected near ${locationName} — may reduce lunch participation`;
  }
  return `Mild weather forecast near ${locationName}`;
}

export async function persistSiteCoordinates(
  siteId: string,
  latitude: number,
  longitude: number,
) {
  await db
    .update(organization_sites)
    .set({
      latitude: String(latitude),
      longitude: String(longitude),
      updated_at: new Date(),
    })
    .where(eq(organization_sites.id, siteId));
}
