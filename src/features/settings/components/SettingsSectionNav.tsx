"use client";

import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS } from "@/features/settings/config/settings-sections";
import type { SettingsSectionId } from "@/types/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSectionNavProps {
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId) => void;
}

export function SettingsSectionNav({
  activeSection,
  onSectionChange,
}: SettingsSectionNavProps) {
  return (
    <>
      <nav
        className="hidden w-56 shrink-0 lg:block"
        aria-label="Settings sections"
      >
        <ul className="space-y-1">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeSection;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <span className="block font-medium">{section.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="lg:hidden">
        <Select
          value={activeSection}
          onValueChange={(value) =>
            onSectionChange(value as SettingsSectionId)
          }
        >
          <SelectTrigger aria-label="Settings section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SETTINGS_SECTIONS.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
