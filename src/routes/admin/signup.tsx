import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/home/primitives";
import { AdminSignup } from "@/components/auth/AdminSignup";

export const Route = createFileRoute("/admin/signup")({
  head: () => ({
    meta: [
      { title: "Admin Signup | Go Surgery" },
      { name: "description", content: "Register a new Administrator account for Go Surgery" },
    ],
  }),
  component: AdminSignupRoute,
});

function AdminSignupRoute() {
  return (
    <main className="py-12 bg-cream min-h-screen">
      <Container className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <AdminSignup />
        </div>
      </Container>
    </main>
  );
}
