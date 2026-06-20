"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Bot, Search } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/features/assistant/config/suggested-prompts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { navItems } from "@/features/navigation/config/nav-items";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 lg:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-muted-foreground">Search...</span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 text-xs">
          ⌘K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Search workspaces and actions..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty>No results found.</Command.Empty>
              <Command.Group heading="Workspaces">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={item.title}
                      onSelect={() => {
                        router.push(item.href);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <p>{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading="Uploads">
                <Command.Item
                  value="upload data"
                  onSelect={() => {
                    router.push("/uploads?tab=upload");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Upload data</p>
                    <p className="text-xs text-muted-foreground">
                      Add receipts, inventory, and attendance files
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="review pending upload"
                  onSelect={() => {
                    router.push("/uploads?id=upl_001&tab=queue");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Review pending upload</p>
                    <p className="text-xs text-muted-foreground">
                      Human validation for extracted data
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="processing queue"
                  onSelect={() => {
                    router.push("/uploads?tab=queue");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Processing queue</p>
                    <p className="text-xs text-muted-foreground">
                      Monitor in-flight uploads
                    </p>
                  </div>
                </Command.Item>
              </Command.Group>
              <Command.Group heading="AI Assistant">
                <Command.Item
                  value="open ai assistant"
                  onSelect={() => {
                    router.push("/assistant");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <Bot className="h-4 w-4" />
                  <div>
                    <p>Open AI Assistant</p>
                    <p className="text-xs text-muted-foreground">
                      Natural-language operational intelligence
                    </p>
                  </div>
                </Command.Item>
                {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                  <Command.Item
                    key={prompt.id}
                    value={`ask ${prompt.label}`}
                    onSelect={() => {
                      router.push(
                        `/assistant?conversation=conv_demo_001`,
                      );
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                  >
                    <div>
                      <p>{prompt.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Ask the assistant
                      </p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Rescue Network">
                <Command.Item
                  value="donation opportunities"
                  onSelect={() => {
                    router.push("/rescue?tab=opportunities");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Donation opportunities</p>
                    <p className="text-xs text-muted-foreground">
                      Review surplus ready for rescue
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="recipient directory"
                  onSelect={() => {
                    router.push("/rescue?tab=recipients");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Recipient directory</p>
                    <p className="text-xs text-muted-foreground">
                      Browse rescue network partners
                    </p>
                  </div>
                </Command.Item>
              </Command.Group>
              <Command.Group heading="Settings">
                <Command.Item
                  value="organization settings"
                  onSelect={() => {
                    router.push("/settings?section=organization");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Organization settings</p>
                    <p className="text-xs text-muted-foreground">
                      Profile and operational details
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="team members"
                  onSelect={() => {
                    router.push("/settings?section=users");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Team members</p>
                    <p className="text-xs text-muted-foreground">
                      Invite and manage users
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="notification preferences"
                  onSelect={() => {
                    router.push("/settings?section=notifications");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Notification preferences</p>
                    <p className="text-xs text-muted-foreground">
                      Control alert categories
                    </p>
                  </div>
                </Command.Item>
                <Command.Item
                  value="appearance settings"
                  onSelect={() => {
                    router.push("/settings?section=appearance");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <div>
                    <p>Appearance</p>
                    <p className="text-xs text-muted-foreground">
                      Theme, layout, and widgets
                    </p>
                  </div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
