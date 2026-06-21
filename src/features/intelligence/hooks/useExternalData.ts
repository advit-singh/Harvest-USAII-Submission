"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDailyWeatherForecast,
  geocodeLocation,
} from "@/lib/external/open-meteo-client";
import { fetchUpcomingPublicHolidays } from "@/lib/external/nager-holidays-client";

export function useExternalWeather(city: string | null | undefined) {
  return useQuery({
    queryKey: ["external-weather", city],
    queryFn: async () => {
      if (!city) return null;
      const geo = await geocodeLocation(city);
      if (!geo) return null;
      return fetchDailyWeatherForecast(geo.latitude, geo.longitude, 7);
    },
    enabled: Boolean(city),
    staleTime: 15 * 60 * 1000,
  });
}

export function useExternalHolidays(countryCode: string | null | undefined) {
  return useQuery({
    queryKey: ["external-holidays", countryCode],
    queryFn: async () => {
      if (!countryCode) return [];
      return fetchUpcomingPublicHolidays(countryCode, 30);
    },
    enabled: Boolean(countryCode),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
