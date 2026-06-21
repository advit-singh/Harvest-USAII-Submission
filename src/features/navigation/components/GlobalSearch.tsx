"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import {
  flattenSearchResults,
  useGlobalSearch,
} from "@/features/navigation/hooks/useGlobalSearch";

export function GlobalSearch() {
  const router = useRouter();
  const { activeOrgId } = useOrganizations();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchQuery = useGlobalSearch(activeOrgId, query);
  const results = flattenSearchResults(searchQuery.data);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder="Search inventory, forecasts, donations, rescue..."
        className="pl-9"
        aria-label="Global search"
        aria-expanded={open}
        aria-controls="global-search-results"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.trim().length >= 2 && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {searchQuery.isLoading && (
            <p className="px-3 py-2 text-sm text-muted-foreground">Searching…</p>
          )}
          {searchQuery.isError && (
            <p className="px-3 py-2 text-sm text-destructive">Search failed</p>
          )}
          {!searchQuery.isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
          )}
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              role="option"
              className="flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                router.push(item.href);
                setOpen(false);
                setQuery("");
              }}
            >
              <span className="font-medium">{item.title}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
