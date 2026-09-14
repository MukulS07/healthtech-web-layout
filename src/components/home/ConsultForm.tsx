import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Loader2, Database, UserRound, LogOut } from "lucide-react";
import { toast } from "sonner";
import { OrangeButton } from "./primitives";
import { cn } from "@/lib/utils";
import { submitConsultationFn } from "@/lib/server-functions/consultations";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { useCurrentUser } from "@/hooks/use-current-user";

const treatments = [
  "Piles / Fissure",
  "Hernia",
  "Kidney Stone",
  "Gallstone",
  "Cataract",
  "Knee Replacement",
  "Gynaecology",
  "ENT",
];

const cities = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Kochi",
];

export function ConsultForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [treatment, setTreatment] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading, logout } = useCurrentUser();
  const queryClient = useQueryClient();

  // Prefill contact details from the account once the patient logs in.
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name);
    setPhone((v) => v || user.phone);
  }, [user]);

  const inputClass =
    "w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !treatment || !city) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitConsultationFn({
        data: {
          name,
          phone,
          treatment,
          city,
        },
      });

      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
        toast.success("Consultation booked! Track its status in My Appointments.", {
          action: { label: "View", onClick: () => (window.location.href = "/account") },
        });
        setTreatment("");
        setCity("");
      } else {
        toast.error(res.error || "Failed to submit consultation.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to database. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-navy/10 bg-background shadow-sm",
        className,
      )}
    >
      <div className="border-b border-border bg-brand-orange-soft px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-navy">
            Talk to a <span className="text-primary">care specialist</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your details are sent securely to our care team.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
          <Database className="h-3.5 w-3.5 text-emerald-600" /> Verified Connection
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : !user ? (
        // Booking requires an account so every appointment can be looked up and tracked later.
        <div className="p-5">
          <p className="mb-3 text-sm text-ink">
            <span className="font-semibold text-navy">Log in or create a free account</span> to book
            — this is how we save your appointment and let you check its status anytime.
          </p>
          <AuthPanel />
        </div>
      ) : (
        <>
          <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-cream px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-ink">
              <UserRound className="h-3.5 w-3.5 text-brand-orange" />
              Booking as <span className="font-semibold text-navy">{user.name}</span>
            </span>
            <span className="flex items-center gap-3 font-semibold">
              <a href="/account" className="text-navy hover:text-brand-orange">
                My Appointments
              </a>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-navy"
              >
                <LogOut className="h-3 w-3" /> Log out
              </button>
            </span>
          </div>
          <form className="space-y-3 p-5" onSubmit={handleSubmit}>
            <input
              className={inputClass}
              placeholder="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className={inputClass}
              placeholder="Phone number *"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <select
              className={inputClass}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              required
            >
              <option value="" disabled>
                Select treatment *
              </option>
              {treatments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="" disabled>
                Select city *
              </option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <OrangeButton type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting request...
                </span>
              ) : (
                "Request a free consultation"
              )}
            </OrangeButton>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Your data is encrypted and handled with strict
              medical privacy.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
