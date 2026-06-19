import { AppShell } from "@/components/layout/AppShell";
import { AppGuard } from "@/components/layout/AppGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGuard>
      <AppShell>{children}</AppShell>
    </AppGuard>
  );
}
