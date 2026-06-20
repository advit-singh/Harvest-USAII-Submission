"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useUiStore } from "@/store/ui-store";

export function ThemeSync() {
  const theme = useUiStore((s) => s.theme);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return null;
}
