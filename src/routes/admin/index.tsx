import { useState, useEffect, Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Calendar,
  UserCheck,
  Plus,
  Trash2,
  Edit,
  Building2,
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  LogOut,
  Users,
  Database,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Container, OrangeButton, OutlineButton } from "@/components/home/primitives";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { SPECIALITIES, getCondition, getSpeciality, getTreatment } from "@/data/catalog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logoutFn, getRegisteredUsersFn } from "@/lib/server-functions/auth";
import {
  getAllConsultationsFn,
  updateConsultationStatusFn,
  assignConsultationFn,
  claimConsultationFn,
  releaseConsultationFn,
  deleteConsultationFn,
} from "@/lib/server-functions/consultations";
import {
  getDoctorsFn,
  createDoctorFn,
  updateDoctorFn,
  deleteDoctorFn,
  type GetDoctorsParams,
} from "@/lib/server-functions/doctors";
import {
  getHospitalsFn,
  createHospitalFn,
  updateHospitalFn,
  deleteHospitalFn,
} from "@/lib/server-functions/hospitals";
import {
  getTreatmentsFn,
  createTreatmentFn,
  updateTreatmentFn,
  deleteTreatmentFn,
  importSurgeryCatalogFn,
} from "@/lib/server-functions/treatments";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Go Surgery" },
      { name: "description", content: "Go Surgery Admin Management Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

type TabType = "appointments" | "users" | "doctors" | "hospitals" | "treatments" | "reviews";

export function AdminRoute() {
  const { user, setUser, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>("appointments");

  // MongoDB Collection Data states
  const [consultations, setConsultations] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [claimFilter, setClaimFilter] = useState<"all" | "unclaimed" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Form states
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<any>(null);

  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);

  // Booking assignment (doctor + slot) state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignDoctorId, setAssignDoctorId] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [isImportingCatalog, setIsImportingCatalog] = useState(false);

  // Doctor form fields
  const [docName, setDocName] = useState("");
  const [docSpecialty, setDocSpecialty] = useState("");
  const [docCred, setDocCred] = useState("");
  const [docExp, setDocExp] = useState(5);
  const [docCity, setDocCity] = useState("Delhi");
  const [docFees, setDocFees] = useState(500);
  const [docHospital, setDocHospital] = useState("");

  // Hospital form fields
  const [hospName, setHospName] = useState("");
  const [hospCity, setHospCity] = useState("Delhi");
  const [hospBeds, setHospBeds] = useState(150);
  const [hospAddress, setHospAddress] = useState("");

  // Treatment form fields
  const [treatName, setTreatName] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateScope, setCandidateScope] = useState("");
  const [treatCategory, setTreatCategory] = useState("General Surgery");
  const [treatDesc, setTreatDesc] = useState("");
  const [treatRecovery, setTreatRecovery] = useState("1-2 Days");

  /** Speciality slug for a booking: from its catalog reference, else from the category name. */
  const specialityForBooking = (item: { interest?: string; category?: string }) => {
    const ref = item.interest || "";
    if (ref.startsWith("s:")) return getSpeciality(ref.slice(2))?.slug;
    if (ref.startsWith("t:")) return getTreatment(ref.slice(2))?.speciality;
    if (ref.startsWith("c:")) return getCondition(ref.slice(2))?.speciality;
    const category = (item.category || "").toLowerCase();
    return SPECIALITIES.find((sp) => sp.name.toLowerCase() === category)?.slug
      ?? SPECIALITIES.find((sp) => category.includes(sp.name.toLowerCase()))?.slug;
  };

  const loadAllData = async () => {
    setIsFetching(true);
    try {
      const [cRes, uRes, dRes, hRes, tRes] = await Promise.all([
        getAllConsultationsFn(),
        getRegisteredUsersFn(),
        getDoctorsFn({ data: { scope: "all" } }),
        getHospitalsFn({ data: {} }),
        getTreatmentsFn({ data: {} }),
      ]);

      if (cRes.success) setConsultations(cRes.consultations);
      if (uRes.success) setUsersList(uRes.users);
      if (dRes.success) setDoctors(dRes.doctors);
      if (hRes.success) setHospitals(hRes.hospitals);
      if (tRes.success) setTreatments(tRes.treatments);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin dashboard data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAllData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logoutFn();
    setUser(null);
    toast.info("Logged out of Admin Portal");
  };

  // Appointment Status Change
  const handleUpdateStatus = async (
    id: string,
    status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled",
  ) => {
    try {
      const res = await updateConsultationStatusFn({ data: { id, status } });
      if (res.success) {
        toast.success(`Booking status updated to ${status}`);
        setConsultations((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item)),
        );
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  // Shared claim queue: an admin claims a booking to work it exclusively, and can
  // release it back to the pool for anyone (including themselves later) to pick up.
  const handleClaim = async (id: string) => {
    try {
      const res = await claimConsultationFn({ data: { id } });
      if (res.success) {
        toast.success(res.message);
        setConsultations((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, claimedByAdminId: user?.id, claimedByAdminName: user?.name }
              : item,
          ),
        );
      } else {
        toast.error(res.error || "Could not claim this booking.");
        loadAllData();
      }
    } catch {
      toast.error("Error claiming booking.");
    }
  };

  const handleRelease = async (id: string) => {
    try {
      const res = await releaseConsultationFn({ data: { id } });
      if (res.success) {
        toast.success(res.message);
        setConsultations((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, claimedByAdminId: null, claimedByAdminName: null }
              : item,
          ),
        );
      } else {
        toast.error(res.error || "Could not release this booking.");
      }
    } catch {
      toast.error("Error releasing booking.");
    }
  };

  /**
   * Candidates for the assign-doctor dropdown. It used to list the first 24 doctors the dashboard
   * happened to load (out of 227k — hence dentists and physiotherapists in Pune for a liver
   * transplant in Jaipur). Now it asks the database for surgeons in the booking's speciality and
   * city, widening the search only when that finds nobody.
   */
  const loadAssignCandidates = async (item: any, search = "") => {
    setCandidateSearch(search);
    setCandidatesLoading(true);
    const specialitySlug = specialityForBooking(item);
    const base: GetDoctorsParams = {
      ...(specialitySlug ? { specialty: specialitySlug } : {}),
      ...(search.trim() ? { query: search.trim() } : {}),
      limit: 50,
      sort: "Rating: High to Low",
    };
    try {
      const attempts: { params: GetDoctorsParams; scope: string }[] = [
        { params: { ...base, city: item.city }, scope: `${specialitySlug ? "speciality" : "all specialities"} · ${item.city}` },
        { params: base, scope: specialitySlug ? "speciality · all cities" : "all cities" },
        { params: { ...(search.trim() ? { query: search.trim() } : {}), city: item.city, limit: 50 }, scope: `all specialities · ${item.city}` },
      ];
      for (const attempt of attempts) {
        const res = await getDoctorsFn({ data: attempt.params });
        if (res.success && res.doctors.length) {
          setCandidates(res.doctors);
          setCandidateScope(`${res.total.toLocaleString("en-IN")} found — ${attempt.scope}`);
          return;
        }
      }
      setCandidates([]);
      setCandidateScope("No surgeons matched — try searching by name");
    } catch {
      setCandidates([]);
      setCandidateScope("Could not load doctors");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const openAssignPanel = (item: any) => {
    setAssigningId(item.id);
    setAssignDoctorId(item.assignedDoctorId || "");
    setAssignDate(item.scheduledDate || "");
    setAssignTime(item.scheduledTime || "");
    setCandidates([]);
    setCandidateScope("");
    void loadAssignCandidates(item);
  };

  const closeAssignPanel = () => {
    setAssigningId(null);
    setAssignDoctorId("");
    setAssignDate("");
    setAssignTime("");
    setCandidates([]);
    setCandidateSearch("");
    setCandidateScope("");
  };

  const handleConfirmAssign = async () => {
    if (!assigningId || !assignDoctorId || !assignDate || !assignTime) {
      toast.error("Please select a doctor, date, and time.");
      return;
    }
    setIsAssigning(true);
    try {
      const res = await assignConsultationFn({
        data: { id: assigningId, doctorId: assignDoctorId, scheduledDate: assignDate, scheduledTime: assignTime },
      });
      if (res.success) {
        toast.success(res.message || "Booking scheduled!");
        const doctor = candidates.find((d) => d.id === assignDoctorId);
        setConsultations((prev) =>
          prev.map((item) =>
            item.id === assigningId
              ? {
                  ...item,
                  status: "scheduled",
                  assignedDoctorId: assignDoctorId,
                  assignedDoctorName: doctor?.name || null,
                  scheduledDate: assignDate,
                  scheduledTime: assignTime,
                }
              : item,
          ),
        );
        closeAssignPanel();
      } else {
        toast.error(res.error || "Failed to assign doctor.");
      }
    } catch {
      toast.error("Error assigning doctor.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this consultation request?")) return;
    try {
      const res = await deleteConsultationFn({ data: { id } });
      if (res.success) {
        toast.success("Consultation deleted");
        setConsultations((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(res.error || "Could not delete");
      }
    } catch {
      toast.error("Error deleting consultation");
    }
  };

  // Doctor Save & Delete
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        const res = await updateDoctorFn({
          data: {
            id: editingDoctor.id,
            name: docName,
            specialty: docSpecialty,
            cred: docCred,
            exp: Number(docExp),
            city: docCity,
            fees: Number(docFees),
            hospital: docHospital,
          },
        });
        if (res.success) {
          toast.success("Doctor updated!");
          setEditingDoctor(null);
          loadAllData();
        } else toast.error(res.error || "Failed to update doctor");
      } else {
        const res = await createDoctorFn({
          data: {
            name: docName,
            specialty: docSpecialty,
            cred: docCred,
            exp: Number(docExp),
            city: docCity,
            fees: Number(docFees),
            hospital: docHospital,
          },
        });
        if (res.success) {
          toast.success("Doctor added successfully!");
          setIsAddDoctorOpen(false);
          loadAllData();
        } else toast.error(res.error || "Failed to add doctor");
      }
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this doctor?")) return;
    const res = await deleteDoctorFn({ data: { id } });
    if (res.success) {
      toast.success("Doctor removed");
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } else toast.error(res.error || "Could not delete doctor");
  };

  // Hospital Save & Delete
  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        const res = await updateHospitalFn({
          data: {
            id: editingHospital.id,
            name: hospName,
            city: hospCity,
            beds: Number(hospBeds),
            address: hospAddress,
          },
        });
        if (res.success) {
          toast.success("Hospital updated!");
          setEditingHospital(null);
          loadAllData();
        } else toast.error(res.error || "Failed to update hospital");
      } else {
        const res = await createHospitalFn({
          data: {
            name: hospName,
            city: hospCity,
            beds: Number(hospBeds),
            address: hospAddress,
          },
        });
        if (res.success) {
          toast.success("Hospital added successfully!");
          setIsAddHospitalOpen(false);
          loadAllData();
        } else toast.error(res.error || "Failed to add hospital");
      }
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm("Are you sure you want to remove this hospital?")) return;
    const res = await deleteHospitalFn({ data: { id } });
    if (res.success) {
      toast.success("Hospital removed");
      setHospitals((prev) => prev.filter((h) => h.id !== id));
    } else toast.error(res.error || "Could not delete hospital");
  };

  // Treatment Save & Delete
  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTreatment) {
        const res = await updateTreatmentFn({
          data: {
            id: editingTreatment.id,
            name: treatName,
            category: treatCategory,
            description: treatDesc,
            recoveryTime: treatRecovery,
          },
        });
        if (res.success) {
          toast.success("Treatment updated!");
          setEditingTreatment(null);
          loadAllData();
        } else toast.error(res.error || "Failed to update treatment");
      } else {
        const res = await createTreatmentFn({
          data: {
            name: treatName,
            category: treatCategory,
            description: treatDesc,
            recoveryTime: treatRecovery,
          },
        });
        if (res.success) {
          toast.success("Treatment added!");
          setIsAddTreatmentOpen(false);
          loadAllData();
        } else toast.error(res.error || "Failed to add treatment");
      }
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleImportCatalog = async () => {
    setIsImportingCatalog(true);
    try {
      const res = await importSurgeryCatalogFn();
      if (res.success) {
        toast.success(res.message);
        loadAllData();
      } else {
        toast.error(res.error || "Import failed");
      }
    } catch {
      toast.error("Error importing surgical catalog");
    } finally {
      setIsImportingCatalog(false);
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this treatment?")) return;
    const res = await deleteTreatmentFn({ data: { id } });
    if (res.success) {
      toast.success("Treatment removed");
      setTreatments((prev) => prev.filter((t) => t.id !== id));
    } else toast.error(res.error || "Could not delete treatment");
  };

  // Unauthenticated or non-admin view
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-muted-foreground">Checking Admin Authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="py-12 bg-cream min-h-screen">
        <Container className="max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-navy">Admin Portal Access</h1>
            <p className="text-sm text-muted-foreground">
              Log in with your administrator credentials to continue.
            </p>
          </div>
          <div className="rounded-xl border border-border/80 bg-cream p-5 shadow-xs">
            <AdminLogin />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Administrator accounts are invite-only. Ask an existing admin to add you.
          </p>
        </Container>
      </main>
    );
  }

  const filteredConsultations = consultations.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesClaim =
      claimFilter === "all" ||
      (claimFilter === "unclaimed" && !item.claimedByAdminId) ||
      (claimFilter === "mine" && item.claimedByAdminId === user?.id);
    const matchesQuery =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone?.includes(searchQuery) ||
      item.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesClaim && matchesQuery;
  });

  const pendingCount = consultations.filter((c) => c.status === "pending").length;

  return (
    <main className="min-h-screen bg-muted/20 pb-16 pt-8">
      <Container>
        {/* Header Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-border bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-extrabold text-navy">Admin Control Panel</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Logged in as <strong className="text-navy">{user.name}</strong> ({user.email})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/signup"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-muted transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Invite Admin
            </Link>
            <OutlineButton onClick={loadAllData} disabled={isFetching} className="py-2 text-xs">
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh All Data
            </OutlineButton>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          </div>
        </div>

        {/* Overview Stats Cards for all 5 MongoDB Collections */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">Bookings (`consultations`)</p>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{consultations.length}</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-amber-800">Pending Approvals</p>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-amber-900">{pendingCount}</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">Registered Users (`users`)</p>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{usersList.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">Doctors (`doctors`)</p>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{doctors.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground">Hospitals (`hospitals`)</p>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-navy">{hospitals.length}</p>
          </div>
        </div>

        {/* Tab Navigation for all MongoDB Collections */}
        <div className="mb-6 flex border-b border-border overflow-x-auto">
          {[
            { id: "appointments", label: "Bookings (consultations)", icon: Calendar, badge: pendingCount },
            { id: "users", label: "Patients (users)", icon: Users, badge: usersList.length },
            { id: "doctors", label: "Doctors (doctors)", icon: UserCheck, badge: doctors.length },
            { id: "hospitals", label: "Hospitals (hospitals)", icon: Building2, badge: hospitals.length },
            { id: "treatments", label: "Treatments (treatments)", icon: Stethoscope, badge: treatments.length },
            { id: "reviews", label: "Review moderation", icon: CheckCircle2, badge: undefined },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      tab.id === "appointments" && pendingCount > 0
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeTab === "reviews" && <ReviewModeration />}

        {/* TAB 1: Patient Bookings & Approvals */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, or treatment..."
                  className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-1.5 text-xs text-ink outline-none focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Queue:</span>
                {(
                  [
                    ["all", "All"],
                    ["unclaimed", "Unclaimed"],
                    ["mine", "My Claims"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setClaimFilter(val)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      claimFilter === val
                        ? "bg-primary text-white"
                        : "bg-muted/60 text-muted-foreground hover:text-navy"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <span className="ml-2 text-xs font-medium text-muted-foreground">Status:</span>
                {["all", "pending", "contacted", "scheduled", "completed", "cancelled"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                      statusFilter === st
                        ? "bg-navy text-white"
                        : "bg-muted/60 text-muted-foreground hover:text-navy"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredConsultations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-navy">No patient bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Patient Details</th>
                      <th className="px-4 py-3">Treatment & City</th>
                      <th className="px-4 py-3">Claimed By</th>
                      <th className="px-4 py-3">Assigned Doctor & Slot</th>
                      <th className="px-4 py-3">Date Submitted</th>
                      <th className="px-4 py-3">Current Status</th>
                      <th className="px-4 py-3 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredConsultations.map((item) => {
                    const isClaimedByMe = item.claimedByAdminId && item.claimedByAdminId === user?.id;
                    const isLockedByOther = item.claimedByAdminId && item.claimedByAdminId !== user?.id;
                    return (
                      <Fragment key={item.id}>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-navy">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.phone} • {item.email || "No email"}</p>
                          {item.message ? (
                            <p className="mt-1 text-[11px] text-ink/70 italic">"{item.message}"</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-primary">{item.treatment}</span>
                          <p className="text-[11px] text-muted-foreground">{item.city}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.claimedByAdminName ? (
                            <div className="space-y-1">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isClaimedByMe
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {isClaimedByMe ? "You" : item.claimedByAdminName}
                              </span>
                              <button
                                onClick={() => handleRelease(item.id)}
                                className="block text-[11px] font-semibold text-muted-foreground hover:text-navy"
                              >
                                Release
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaim(item.id)}
                              className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                              Claim
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {item.assignedDoctorName ? (
                            <>
                              <span className="font-semibold text-navy">{item.assignedDoctorName}</span>
                              <p className="text-[11px] text-muted-foreground">
                                {item.scheduledDate} • {item.scheduledTime}
                              </p>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Not assigned yet</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                              item.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "scheduled"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.status === "contacted"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                            {item.status === "pending" && <Clock className="h-3 w-3" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isLockedByOther ? (
                            <span className="text-[11px] italic text-muted-foreground">
                              Locked — claimed by {item.claimedByAdminName}
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openAssignPanel(item)}
                                className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                {item.assignedDoctorName ? "Reassign" : "Assign"}
                              </button>
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleUpdateStatus(
                                    item.id,
                                    e.target.value as
                                      | "pending"
                                      | "contacted"
                                      | "scheduled"
                                      | "completed"
                                      | "cancelled",
                                  )
                                }
                                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium outline-none focus:border-primary"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleDeleteConsultation(item.id)}
                                className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete booking"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {assigningId === item.id && (
                        <tr className="bg-cream/60">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="flex flex-wrap items-end gap-3">
                              <div>
                                <label className="mb-1 block text-[11px] font-semibold text-navy">
                                  Doctor — {item.treatment} in {item.city}
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="search"
                                    value={candidateSearch}
                                    placeholder="Search by name..."
                                    onChange={(e) => setCandidateSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && loadAssignCandidates(item, candidateSearch)}
                                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                                  />
                                  <OutlineButton
                                    type="button"
                                    onClick={() => loadAssignCandidates(item, candidateSearch)}
                                    className="py-1.5 px-3 text-xs"
                                  >
                                    Search
                                  </OutlineButton>
                                </div>
                                <select
                                  value={assignDoctorId}
                                  onChange={(e) => setAssignDoctorId(e.target.value)}
                                  disabled={candidatesLoading}
                                  className="mt-2 rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary min-w-[260px]"
                                >
                                  <option value="" disabled>
                                    {candidatesLoading ? "Loading doctors..." : "Select doctor"}
                                  </option>
                                  {candidates.map((d) => (
                                    <option key={d.id} value={d.id}>
                                      {d.name} — {d.specialty}
                                      {d.exp ? `, ${d.exp} yrs` : ""} ({d.city})
                                    </option>
                                  ))}
                                </select>
                                <p className="mt-1 text-[11px] text-muted-foreground">{candidateScope}</p>
                              </div>
                              <div>
                                <label className="mb-1 block text-[11px] font-semibold text-navy">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={assignDate}
                                  onChange={(e) => setAssignDate(e.target.value)}
                                  className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-[11px] font-semibold text-navy">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={assignTime}
                                  onChange={(e) => setAssignTime(e.target.value)}
                                  className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                                />
                              </div>
                              <OrangeButton
                                type="button"
                                onClick={handleConfirmAssign}
                                disabled={isAssigning}
                                className="py-1.5 px-3 text-xs"
                              >
                                {isAssigning ? "Saving..." : "Confirm & Schedule"}
                              </OrangeButton>
                              <OutlineButton
                                type="button"
                                onClick={closeAssignPanel}
                                className="py-1.5 px-3 text-xs"
                              >
                                Cancel
                              </OutlineButton>
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Users List */}
        {activeTab === "users" && (
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-navy">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Doctors Management */}
        {activeTab === "doctors" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-border">
              <h2 className="text-base font-bold text-navy">Doctors Directory (`doctors`)</h2>
              <OrangeButton
                onClick={() => {
                  setEditingDoctor(null);
                  setDocName("");
                  setDocSpecialty("");
                  setDocCred("");
                  setDocExp(5);
                  setDocCity("Delhi NCR");
                  setDocFees(500);
                  setDocHospital("");
                  setIsAddDoctorOpen(true);
                }}
                className="py-1.5 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Doctor
              </OrangeButton>
            </div>

            {/* Doctor Form Modal */}
            {(isAddDoctorOpen || editingDoctor) && (
              <form onSubmit={handleSaveDoctor} className="bg-cream p-5 rounded-xl border border-border space-y-3">
                <h3 className="text-sm font-bold text-navy">
                  {editingDoctor ? "Edit Doctor Details" : "Add New Doctor"}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <input
                    placeholder="Doctor Name"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Specialty (e.g. Laparoscopy)"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Qualifications (MBBS, MS)"
                    value={docCred}
                    onChange={(e) => setDocCred(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Experience (years)"
                    value={docExp}
                    onChange={(e) => setDocExp(Number(e.target.value))}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="City"
                    value={docCity}
                    onChange={(e) => setDocCity(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (₹)"
                    value={docFees}
                    onChange={(e) => setDocFees(Number(e.target.value))}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Affiliated Hospital"
                    value={docHospital}
                    onChange={(e) => setDocHospital(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <OutlineButton
                    type="button"
                    onClick={() => {
                      setIsAddDoctorOpen(false);
                      setEditingDoctor(null);
                    }}
                    className="py-1 px-3 text-xs"
                  >
                    Cancel
                  </OutlineButton>
                  <OrangeButton type="submit" className="py-1 px-3 text-xs">
                    {editingDoctor ? "Update Doctor" : "Save Doctor"}
                  </OrangeButton>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialty</th>
                    <th className="px-4 py-3">Credentials</th>
                    <th className="px-4 py-3">Exp / Fees</th>
                    <th className="px-4 py-3">City & Hospital</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {doctors.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-navy">{d.name}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{d.specialty}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.cred}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.exp ?? "—"} yrs • ₹{d.fees}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.city} ({d.hospital})</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingDoctor(d);
                              setDocName(d.name);
                              setDocSpecialty(d.specialty);
                              setDocCred(d.cred);
                              setDocExp(d.exp);
                              setDocCity(d.city);
                              setDocFees(d.fees);
                              setDocHospital(d.hospital);
                            }}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-navy"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(d.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Hospitals Management */}
        {activeTab === "hospitals" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-border">
              <h2 className="text-base font-bold text-navy">Hospitals Directory (`hospitals`)</h2>
              <OrangeButton
                onClick={() => {
                  setEditingHospital(null);
                  setHospName("");
                  setHospCity("Delhi NCR");
                  setHospBeds(150);
                  setHospAddress("");
                  setIsAddHospitalOpen(true);
                }}
                className="py-1.5 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Hospital
              </OrangeButton>
            </div>

            {(isAddHospitalOpen || editingHospital) && (
              <form onSubmit={handleSaveHospital} className="bg-cream p-5 rounded-xl border border-border space-y-3">
                <h3 className="text-sm font-bold text-navy">
                  {editingHospital ? "Edit Hospital Details" : "Add New Hospital"}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <input
                    placeholder="Hospital Name"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="City"
                    value={hospCity}
                    onChange={(e) => setHospCity(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Bed Count"
                    value={hospBeds}
                    onChange={(e) => setHospBeds(Number(e.target.value))}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Address"
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <OutlineButton
                    type="button"
                    onClick={() => {
                      setIsAddHospitalOpen(false);
                      setEditingHospital(null);
                    }}
                    className="py-1 px-3 text-xs"
                  >
                    Cancel
                  </OutlineButton>
                  <OrangeButton type="submit" className="py-1 px-3 text-xs">
                    {editingHospital ? "Update Hospital" : "Save Hospital"}
                  </OrangeButton>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Hospital Name</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Beds</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {hospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-navy">{h.name}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{h.city}</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.beds} Beds</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.address}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingHospital(h);
                              setHospName(h.name);
                              setHospCity(h.city);
                              setHospBeds(h.beds);
                              setHospAddress(h.address);
                            }}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-navy"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHospital(h.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Treatments Management */}
        {activeTab === "treatments" && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white p-4 rounded-lg border border-border">
              <div>
                <h2 className="text-base font-bold text-navy">Treatments Directory (`treatments`)</h2>
                <p className="text-[11px] text-muted-foreground">
                  {treatments.length} procedures across{" "}
                  {new Set(treatments.map((t) => t.category)).size} categories
                </p>
                <p className="mt-1 max-w-xl text-[11px] font-medium text-amber-700">
                  Sample data loaded by the app on 18 Sep 2026 — not from the original database and not
                  shown on the public site (public treatment pages use the curated catalog in
                  src/data/catalog). Kept for reference; nothing here has been deleted.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <OutlineButton
                  onClick={handleImportCatalog}
                  disabled={isImportingCatalog}
                  className="py-1.5 px-3 text-xs"
                >
                  <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isImportingCatalog ? "animate-spin" : ""}`} />
                  {isImportingCatalog ? "Importing..." : "Import Full Surgical Catalog"}
                </OutlineButton>
                <OrangeButton
                  onClick={() => {
                    setEditingTreatment(null);
                    setTreatName("");
                    setTreatCategory("General Surgery");
                    setTreatDesc("");
                    setTreatRecovery("1-2 Days");
                    setIsAddTreatmentOpen(true);
                  }}
                  className="py-1.5 px-3 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Treatment
                </OrangeButton>
              </div>
            </div>

            {(isAddTreatmentOpen || editingTreatment) && (
              <form onSubmit={handleSaveTreatment} className="bg-cream p-5 rounded-xl border border-border space-y-3">
                <h3 className="text-sm font-bold text-navy">
                  {editingTreatment ? "Edit Treatment Details" : "Add New Treatment"}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <input
                    placeholder="Treatment Name"
                    value={treatName}
                    onChange={(e) => setTreatName(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Category (e.g. Proctology)"
                    value={treatCategory}
                    onChange={(e) => setTreatCategory(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Description"
                    value={treatDesc}
                    onChange={(e) => setTreatDesc(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    placeholder="Recovery Time (e.g. 1-2 Days)"
                    value={treatRecovery}
                    onChange={(e) => setTreatRecovery(e.target.value)}
                    required
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <OutlineButton
                    type="button"
                    onClick={() => {
                      setIsAddTreatmentOpen(false);
                      setEditingTreatment(null);
                    }}
                    className="py-1 px-3 text-xs"
                  >
                    Cancel
                  </OutlineButton>
                  <OrangeButton type="submit" className="py-1 px-3 text-xs">
                    {editingTreatment ? "Update Treatment" : "Save Treatment"}
                  </OrangeButton>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Treatment Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Recovery Time</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {treatments.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-navy">{t.name}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{t.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.recoveryTime}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{t.description}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingTreatment(t);
                              setTreatName(t.name);
                              setTreatCategory(t.category);
                              setTreatDesc(t.description);
                              setTreatRecovery(t.recoveryTime);
                            }}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-navy"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTreatment(t.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
