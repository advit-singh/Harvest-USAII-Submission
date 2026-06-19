"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search inventory, forecasts, reports..."
        className="pl-9"
        aria-label="Global search"
        readOnly
        onFocus={(e) => {
          e.target.blur();
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true }),
          );
        }}
      />
    </div>
  );
}
