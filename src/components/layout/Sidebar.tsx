"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/features/navigation/config/nav-items";
import { useUiStore } from "@/store/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUiStore();

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-r bg-[var(--sidebar)] text-[var(--sidebar-foreground)] md:flex",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="text-lg">Project Harvest</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/dashboard" className="mx-auto font-bold" aria-label="Project Harvest">
            PH
          </Link>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--sidebar-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                isActive && "bg-[var(--sidebar-accent)] font-medium",
                sidebarCollapsed && "justify-center px-2",
              )}
              title={sidebarCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!sidebarCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
