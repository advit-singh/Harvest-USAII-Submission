/** Nager.Date — free public holidays API, no API key. https://date.nager.at */

const BASE_URL = "https://date.nager.at/api/v3";

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  types: string[];
}

export async function fetchUpcomingPublicHolidays(
  countryCode: string,
  withinDays: number,
): Promise<PublicHoliday[]> {
  const code = countryCode.toUpperCase().slice(0, 2);
  if (!code) return [];

  const response = await fetch(`${BASE_URL}/NextPublicHolidays/${code}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return fetchPublicHolidaysForYear(code, new Date().getFullYear(), withinDays);
  }

  const holidays = (await response.json()) as PublicHoliday[];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return holidays.filter((holiday) => new Date(holiday.date) <= cutoff);
}

export async function fetchPublicHolidaysForYear(
  countryCode: string,
  year: number,
  withinDays?: number,
): Promise<PublicHoliday[]> {
  const code = countryCode.toUpperCase().slice(0, 2);
  if (!code) return [];

  const response = await fetch(`${BASE_URL}/PublicHolidays/${year}/${code}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];

  const holidays = (await response.json()) as PublicHoliday[];
  if (withinDays === undefined) return holidays;

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return holidays.filter((holiday) => {
    const date = new Date(holiday.date);
    return date >= now && date <= cutoff;
  });
}

export function estimateHolidayAttendanceImpact(holidays: PublicHoliday[]): number {
  if (holidays.length === 0) return 0;
  const schoolRelevant = holidays.filter((holiday) =>
    holiday.types.some((type) => type === "Public" || type === "School"),
  );
  if (schoolRelevant.length >= 2) return -0.15;
  if (schoolRelevant.length === 1) return -0.08;
  return -0.05 * holidays.length;
}
