import { AuthGuard } from "@/components/layout/AuthGuard";
import { HarvestLogo } from "@/components/brand/HarvestLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 flex flex-col items-center text-center">
          <HarvestLogo size={40} className="mb-3" />
          <h1 className="text-2xl font-bold text-primary">Harvest</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prevent food waste before it happens
          </p>
        </div>
        {children}
      </div>
    </AuthGuard>
  );
}
