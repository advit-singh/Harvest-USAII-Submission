"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { NotificationList } from "@/features/notifications/components/NotificationList";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/notifications/hooks/useMarkNotificationRead";
import { countUnreadNotifications } from "@/lib/api/notifications";
import { useNotificationStore } from "@/store/notification-store";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { activeOrgId } = useOrganizations();
  const notificationsQuery = useNotifications(activeOrgId);
  const markReadMutation = useMarkNotificationRead(activeOrgId);
  const markAllMutation = useMarkAllNotificationsRead(activeOrgId);
  const { unreadCount, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (notificationsQuery.data) {
      setUnreadCount(countUnreadNotifications(notificationsQuery.data));
    }
  }, [notificationsQuery.data, setUnreadCount]);

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const badgeLabel =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "No unread notifications";

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={badgeLabel}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <DrawerTitle>Notifications</DrawerTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings?section=notifications" onClick={() => setOpen(false)}>
                Preferences
              </Link>
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4">
          {!activeOrgId ? (
            <p className="text-sm text-muted-foreground">
              Select an organization to view notifications.
            </p>
          ) : notificationsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notificationsQuery.isError ? (
            <ErrorState
              message="Couldn't load notifications."
              onRetry={() => notificationsQuery.refetch()}
            />
          ) : (
            <NotificationList
              notifications={notificationsQuery.data ?? []}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
