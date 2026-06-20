"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_SETTINGS_SECTION,
  VALID_SETTINGS_SECTIONS,
} from "@/features/settings/config/settings-sections";
import type { SettingsSectionId } from "@/types/settings";

export function useSettingsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSection = useMemo<SettingsSectionId>(() => {
    const param = searchParams.get("section");
    if (param && VALID_SETTINGS_SECTIONS.includes(param as SettingsSectionId)) {
      return param as SettingsSectionId;
    }
    return DEFAULT_SETTINGS_SECTION;
  }, [searchParams]);

  const setActiveSection = useCallback(
    (section: SettingsSectionId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("section", section);
      router.replace(`/settings?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return { activeSection, setActiveSection };
}
