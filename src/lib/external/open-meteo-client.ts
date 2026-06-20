/** Open-Meteo — free weather & geocoding, no API key required. https://open-meteo.com */

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  name: string;
}

export interface DailyWeatherSummary {
  rainyDays: number;
  totalPrecipitationMm: number;
  maxTemperatureC: number;
  minTemperatureC: number;
  severeWeatherDays: number;
  daily: Array<{
    date: string;
    precipitationMm: number;
    weatherCode: number;
    tempMaxC: number;
  }>;
}

const RAIN_WEATHER_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
]);

export async function geocodeLocation(query: string): Promise<GeoCoordinates | null> {
  if (!query.trim()) return null;

  const params = new URLSearchParams({
    name: query.trim(),
    count: "1",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params.toString()}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
    }>;
  };

  const result = data.results?.[0];
  if (!result) return null;

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
  };
}

export async function fetchDailyWeatherForecast(
  latitude: number,
  longitude: number,
  forecastDays: number,
): Promise<DailyWeatherSummary | null> {
  const days = Math.min(Math.max(forecastDays, 1), 16);
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "weathercode,precipitation_sum,temperature_2m_max,temperature_2m_min",
    forecast_days: String(days),
    timezone: "auto",
  });

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    daily?: {
      time: string[];
      weathercode: number[];
      precipitation_sum: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };

  const daily = data.daily;
  if (!daily?.time?.length) return null;

  const rows = daily.time.map((date, index) => ({
    date,
    precipitationMm: daily.precipitation_sum[index] ?? 0,
    weatherCode: daily.weathercode[index] ?? 0,
    tempMaxC: daily.temperature_2m_max[index] ?? 0,
  }));

  const rainyDays = rows.filter(
    (row) => row.precipitationMm >= 2 || RAIN_WEATHER_CODES.has(row.weatherCode),
  ).length;
  const severeWeatherDays = rows.filter((row) => row.weatherCode >= 95).length;

  return {
    rainyDays,
    totalPrecipitationMm: rows.reduce((sum, row) => sum + row.precipitationMm, 0),
    maxTemperatureC: Math.max(...rows.map((row) => row.tempMaxC)),
    minTemperatureC: Math.min(...rows.map((row) => row.tempMaxC)),
    severeWeatherDays,
    daily: rows,
  };
}

export function estimateWeatherAttendanceImpact(weather: DailyWeatherSummary): number {
  if (weather.severeWeatherDays > 0) return -0.22;
  if (weather.rainyDays >= 3) return -0.18;
  if (weather.rainyDays >= 1) return -0.1;
  if (weather.maxTemperatureC >= 35) return -0.08;
  if (weather.minTemperatureC <= -10) return -0.12;
  return 0;
}
