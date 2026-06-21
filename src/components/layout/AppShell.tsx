import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { OverlayCleanup } from "@/components/layout/OverlayCleanup";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <OverlayCleanup />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
