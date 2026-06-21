"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Resets stale overlay pointer locks after SPA navigation. */
export function OverlayCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");

    const vaulWrappers = document.querySelectorAll("[data-vaul-drawer-wrapper]");
    vaulWrappers.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.pointerEvents = "";
      }
    });
  }, [pathname]);

  return null;
}
