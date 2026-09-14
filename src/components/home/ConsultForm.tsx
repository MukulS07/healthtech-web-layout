import { useState } from "react";
import { Lock, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { OrangeButton } from "./primitives";
import { cn } from "@/lib/utils";
import { submitConsultationFn } from "@/lib/server-functions/consultations";

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
        toast.success(res.message || "Consultation saved to MongoDB successfully!");
        setName("");
        setPhone("");
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
            Share a few details. Saved directly to MongoDB.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
          <Database className="h-3 w-3 text-emerald-600" /> DB Connected
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
              <Loader2 className="h-4 w-4 animate-spin" /> Saving to MongoDB...
            </span>
          ) : (
            "Request a free consultation"
          )}
        </OrangeButton>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Your data is secured in MongoDB. We prioritize medical
          privacy.
        </p>
      </form>
    </div>
  );
}
