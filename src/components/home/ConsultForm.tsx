import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { OrangeButton } from "./primitives";
import { cn } from "@/lib/utils";

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

const cities = ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Kochi"];

export function ConsultForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-blue-light";

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-background shadow-[0_24px_60px_-24px_oklch(0.245_0.045_233_/_0.55)]", className)}>
      <div className="bg-navy px-5 py-4 text-center">
        <p className="text-base font-bold text-navy-foreground">
          Book <span className="text-brand-orange">FREE</span> Consultation
        </p>
      </div>
      <form
        className="space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Thank you! Our care coordinator will call you shortly.");
          setName("");
          setPhone("");
        }}
      >
        <input
          className={inputClass}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="Phone number"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <select className={inputClass} defaultValue="">
          <option value="" disabled>
            Select treatment
          </option>
          {treatments.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className={inputClass} defaultValue="">
          <option value="" disabled>
            Select city
          </option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <OrangeButton type="submit" className="w-full">
          Book Free Consultation
        </OrangeButton>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Your data is secured. We prioritize your medical privacy.
        </p>
      </form>
    </div>
  );
}
