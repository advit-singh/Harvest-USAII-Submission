"use client";

import Link from "next/link";
import { Bot, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { GlobalSearch } from "@/features/navigation/components/GlobalSearch";
import { CommandPalette } from "@/features/navigation/components/CommandPalette";
import { useUiStore } from "@/store/ui-store";

export function Header() {
  const { toggleSidebar } = useUiStore();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
      <MobileNav />
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <OrgSwitcher />
      <div className="flex flex-1 justify-center px-4">
        <GlobalSearch />
      </div>
      <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
        <Link href="/assistant" aria-label="Open AI Assistant">
          <Bot className="h-5 w-5" />
        </Link>
      </Button>
      <CommandPalette />
      <UserMenu />
    </header>
  );
}
