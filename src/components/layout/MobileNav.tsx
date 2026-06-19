"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { navItems } from "@/features/navigation/config/nav-items";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project Harvest</DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-1 p-4 pb-8" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-accent",
                  isActive && "bg-accent font-medium",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
