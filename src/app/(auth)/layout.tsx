import { AuthGuard } from "@/components/layout/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">Project Harvest</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prevent food waste before it happens
          </p>
        </div>
        {children}
      </div>
    </AuthGuard>
  );
}
