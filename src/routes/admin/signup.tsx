import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { Container } from "@/components/home/primitives";
import { AdminSignup } from "@/components/auth/AdminSignup";
import { useCurrentUser } from "@/hooks/use-current-user";
import { A } from "@/components/common/A";

export const Route = createFileRoute("/admin/signup")({
  head: () => ({
    meta: [
      { title: "Invite Admin | Go Surgery" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSignupRoute,
});

/**
 * Invite-only: an existing 2FA-verified admin creates the new admin account here, and the new
 * admin scans the QR code to finish setup. The server function enforces this too
 * (requireAdminUser) — this page-level check is only for a sensible UI.
 */
function AdminSignupRoute() {
  const { user, isLoading } = useCurrentUser();

  return (
    <main className="py-12 bg-cream min-h-screen">
      <Container className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : user?.role === "admin" ? (
            <AdminSignup />
          ) : (
            <div className="text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
              <h1 className="mt-3 text-lg font-bold text-navy">Admin accounts are invite-only</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to the admin portal first; only an existing administrator can add another.
              </p>
              <A href="/admin" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                Go to admin sign-in
              </A>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
