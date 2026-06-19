"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { navItems } from "@/features/navigation/config/nav-items";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentNav = navItems.find((item) => item.href === `/${segments[0]}`);

  if (!segments.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="hover:text-foreground">
            Home
          </Link>
        </li>
        {currentNav && (
          <>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <li className="font-medium text-foreground">{currentNav.title}</li>
          </>
        )}
      </ol>
    </nav>
  );
}
