import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  RefreshCw,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { ConsultForm } from "@/components/home/ConsultForm";
import { Container, Eyebrow, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getMyConsultationsFn } from "@/lib/server-functions/consultations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Appointments | Prime Care" },
      {
        name: "description",
        content: "Log in to check the status of your consultation and surgery appointments.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const statusMeta: Record<
  string,
  { label: string; description: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    description: "Request received. A care coordinator will call you shortly.",
    icon: Clock,
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  contacted: {
    label: "Confirmed",
    description: "Our coordinator has contacted you and your consultation is being scheduled.",
    icon: PhoneCall,
    className: "bg-sky-100 text-sky-800 border-sky-200",
  },
  scheduled: {
    label: "Scheduled",
    description: "Your appointment has been scheduled with a specialist.",
    icon: CalendarClock,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  completed: {
    label: "Completed",
    description: "This consultation has been completed.",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    description: "This request was cancelled.",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const fallbackStatus = statusMeta["pending"]!;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AccountPage() {
  const { user, isLoading, logout } = useCurrentUser();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Patient account</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              {user ? `Hello, ${user.name.split(" ")[0]}` : "My Appointments"}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Track the status of every consultation you've booked with us.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : user ? (
              <div className="grid gap-10 lg:grid-cols-[0.7fr_1.6fr]">
                <aside className="space-y-4">
                  <div className="rounded-xl border border-border bg-cream p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Your details
                    </p>
                    <p className="mt-2 text-lg font-bold text-navy">{user.name}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-ink/80">
                      <Mail className="h-4 w-4 text-brand-orange" /> {user.email}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink/80">
                      <Phone className="h-4 w-4 text-brand-orange" /> {user.phone}
                    </p>
                  </div>
                  <a href="#book-surgery" className="block">
                    <OrangeButton className="w-full">Register for a Surgery</OrangeButton>
                  </a>
                  <OutlineButton className="w-full" onClick={logout}>
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Log Out
                    </span>
                  </OutlineButton>
                </aside>
                <div className="space-y-10">
                  <div id="book-surgery" className="scroll-mt-24">
                    <Eyebrow>Book a surgery</Eyebrow>
                    <h2 className="mt-1 text-xl font-bold text-navy">Register for a Surgery</h2>
                    <p className="mt-1 mb-4 text-sm text-muted-foreground">
                      Pick a category and the specific procedure — we'll match you with a
                      specialist and confirm your appointment slot here.
                    </p>
                    <ConsultForm className="max-w-xl" hideAccountBar />
                  </div>
                  <AppointmentList />
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-md">
                <h2 className="text-xl font-bold text-navy">Log in to see your appointments</h2>
                <p className="mb-5 mt-1 text-sm text-muted-foreground">
                  Appointments booked while logged in appear here with their live status.
                </p>
                <AuthPanel />
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AppointmentList() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["my-consultations"],
    queryFn: () => getMyConsultationsFn(),
  });

  const consultations = data?.consultations ?? [];

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <Eyebrow>Appointment status</Eyebrow>
          <h2 className="mt-1 text-xl font-bold text-navy">
            Your Appointments{consultations.length ? ` (${consultations.length})` : ""}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand-orange disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : data && !data.success && "error" in data ? (
        <p className="rounded-xl border border-border bg-cream p-6 text-sm text-destructive">
          Couldn't load your appointments right now. Please try again.
        </p>
      ) : consultations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <CalendarCheck className="mx-auto h-8 w-8 text-brand-orange" />
          <p className="mt-3 font-semibold text-navy">No appointments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Book a free consultation while logged in and it will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {consultations.map((c) => {
            const meta = statusMeta[c.status] ?? fallbackStatus;
            return (
              <li
                key={c.id}
                className="rounded-xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-navy">{c.treatment}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {c.city}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                      meta.className,
                    )}
                  >
                    <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink/80">{meta.description}</p>
                {c.assignedDoctorName ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg bg-cream px-3 py-2 text-xs text-navy">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Stethoscope className="h-3.5 w-3.5 text-brand-orange" /> {c.assignedDoctorName}
                    </span>
                    {c.scheduledDate && c.scheduledTime ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-brand-orange" /> {c.scheduledDate} at{" "}
                        {c.scheduledTime}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {c.message ? (
                  <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-xs text-ink/70">
                    “{c.message}”
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  <span>Booked {formatDate(c.createdAt)}</span>
                  {c.updatedAt !== c.createdAt ? (
                    <span>Last updated {formatDate(c.updatedAt)}</span>
                  ) : null}
                  <span>Ref #{c.id.slice(-6).toUpperCase()}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
