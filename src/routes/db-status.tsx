import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Database, CheckCircle2, XCircle, RefreshCw, Layers, Users, PhoneCall, Calendar, Sparkles, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import { checkDbConnection } from "@/lib/db-status";
import { getConsultationsFn } from "@/lib/server-functions/consultations";
import { seedDatabaseFn } from "@/lib/server-functions/seed";
import { restoreArchiveFn, getRestoredDataFn, CollectionSummary } from "@/lib/server-functions/restore";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { toast } from "sonner";

export const Route = createFileRoute("/db-status")({
  head: () => ({
    meta: [
      { title: "MongoDB Health & Data Dashboard | Prime Care" },
      { name: "description", content: "Inspect real-time MongoDB database connection status, collection metrics, and consultation form submissions." },
    ],
  }),
  component: DbStatusPage,
});

function DbStatusPage() {
  const [dbState, setDbState] = useState<{
    isConnected: boolean;
    status: string;
    message: string;
    error?: string;
  }>({
    isConnected: false,
    status: "checking",
    message: "Connecting to database...",
  });

  const [consultations, setConsultations] = useState<
    Array<{
      id: string;
      name: string;
      phone: string;
      email?: string;
      treatment: string;
      city: string;
      message?: string;
      status: string;
      createdAt: string;
    }>
  >([]);

  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [dbCollections, setDbCollections] = useState<CollectionSummary[]>([]);
  const [selectedColl, setSelectedColl] = useState<string>("");

  const fetchDbData = async () => {
    setIsLoading(true);
    try {
      // 1. Check DB Connection
      const connRes = await checkDbConnection();
      setDbState({
        isConnected: connRes.isConnected,
        status: connRes.status,
        message: connRes.message,
        ...(connRes.error ? { error: connRes.error } : {}),
      });

      // 2. Fetch Consultations from MongoDB
      const consultRes = await getConsultationsFn();
      if (consultRes.success) {
        setConsultations(consultRes.consultations);
      }

      // 3. Fetch Doctors Count from MongoDB
      const docsRes = await getDoctorsFn();
      if (docsRes.success) {
        setDoctorCount(docsRes.count);
      }

      // 4. Fetch Restored Collections Data
      const collRes = await getRestoredDataFn();
      if (collRes.success && collRes.collections) {
        setDbCollections(collRes.collections);
        const firstColl = collRes.collections[0];
        if (firstColl && !selectedColl) {
          setSelectedColl(firstColl.name);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh database state.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDatabaseFn();
      if (res.success) {
        toast.success(res.message || "Database seeded successfully!");
        fetchDbData();
      } else {
        toast.error(res.error || "Failed to seed database.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error running database seed operation.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRestoreArchive = async () => {
    setIsRestoring(true);
    try {
      const res = await restoreArchiveFn();
      if (res.success) {
        toast.success(res.message || "Archive jobroomdb.archive restored into MongoDB!");
        fetchDbData();
      } else {
        toast.error(res.error || res.message || "Failed to restore archive.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error restoring database archive.");
    } finally {
      setIsRestoring(false);
    }
  };

  const activeCollectionObj = dbCollections.find((c) => c.name === selectedColl) || dbCollections[0];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-navy py-12">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow tone="light">Database Diagnostics</Eyebrow>
                <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
                  MongoDB Backend Status & Live Submissions
                </h1>
                <p className="mt-2 text-sm text-navy-foreground/75 sm:text-base">
                  Real-time status of your MongoDB connection, collection counts, and form submissions stored in the database.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <OutlineButton onClick={fetchDbData} disabled={isLoading} className="border-white/30 text-white hover:bg-white/10">
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh State
                </OutlineButton>
                <OutlineButton onClick={handleRestoreArchive} disabled={isRestoring} className="border-emerald-400/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                  {isRestoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 text-emerald-400" />} Restore DATA/jobroomdb.archive
                </OutlineButton>
                <OrangeButton onClick={handleSeed} disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Seed Database
                </OrangeButton>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container className="space-y-8">
            {!dbState.isConnected && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-5 text-amber-900 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-amber-900">
                  <Database className="h-5 w-5 text-amber-700" /> How to Connect Your MongoDB Database
                </h3>
                <p className="mt-1 text-xs text-amber-800">
                  Your web backend is configured to fetch and store data in MongoDB. To connect your database:
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-white p-3 border border-amber-200">
                    <p className="font-bold text-navy">Option A: MongoDB Atlas (Cloud DB - Recommended)</p>
                    <p className="mt-1 text-muted-foreground text-[11px]">
                      Paste your cluster URI into the <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950">.env</code> file:
                    </p>
                    <code className="mt-2 block rounded bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/healthtech
                    </code>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-amber-200">
                    <p className="font-bold text-navy">Option B: Local MongoDB Server</p>
                    <p className="mt-1 text-muted-foreground text-[11px]">
                      Ensure MongoDB Community Server is installed and running on default port <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950">27017</code>.
                    </p>
                    <code className="mt-2 block rounded bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                      mongod --dbpath C:\data\db
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Connection Health */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">MongoDB Status</span>
                  <Database className="h-5 w-5 text-brand-orange" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {dbState.isConnected ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-500" />
                  )}
                  <span className="text-xl font-bold text-navy capitalize">{dbState.status}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{dbState.message}</p>
                {dbState.error && (
                  <p className="mt-1 rounded bg-rose-50 p-2 text-[11px] font-mono text-rose-700 max-h-24 overflow-y-auto">{dbState.error}</p>
                )}
              </div>

              {/* Card 2: Consultations Stored */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Consultations Saved</span>
                  <PhoneCall className="h-5 w-5 text-brand-orange" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-navy">{consultations.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">Submissions saved to `consultations` collection</p>
              </div>

              {/* Card 3: Doctors Collection */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Doctors Collection</span>
                  <Users className="h-5 w-5 text-brand-orange" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-navy">{doctorCount}</p>
                <p className="mt-2 text-xs text-muted-foreground">Documents in `doctors` collection</p>
              </div>

              {/* Card 4: Collections Count */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">MongoDB Collections</span>
                  <Layers className="h-5 w-5 text-brand-orange" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-navy">{dbCollections.length}</p>
                <p className="mt-2 text-xs text-muted-foreground">Active Database Collections</p>
              </div>
            </div>

            {/* Restored MongoDB Data Explorer */}
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" /> Restored MongoDB Data Explorer
                  </h2>
                  <p className="text-xs text-muted-foreground">View documents restored from `DATA/jobroomdb.archive` directly from MongoDB.</p>
                </div>
                {dbCollections.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-navy">Select Collection:</label>
                    <select
                      className="rounded-lg border border-border bg-cream px-3 py-1.5 text-xs font-bold text-navy outline-none"
                      value={selectedColl}
                      onChange={(e) => setSelectedColl(e.target.value)}
                    >
                      {dbCollections.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.count} docs)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {dbCollections.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                  <Database className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-semibold text-navy">No collections loaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Restore DATA/jobroomdb.archive" to populate your database collections.</p>
                </div>
              ) : (
                <div>
                  {activeCollectionObj && (
                    <div>
                      <div className="flex items-center justify-between mb-3 bg-cream p-3 rounded-lg border border-border">
                        <p className="text-xs font-bold text-navy uppercase">
                          Collection: <span className="text-brand-orange">{activeCollectionObj.name}</span>
                        </p>
                        <span className="rounded-full bg-navy px-3 py-0.5 text-[11px] font-bold text-white">
                          Total {activeCollectionObj.count} Documents
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-[400px]">
                        <pre className="rounded-lg bg-slate-900 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                          {JSON.stringify(activeCollectionObj.sampleDocs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Consultation Records Table */}
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-navy">Live MongoDB Consultation Submissions</h2>
                  <p className="text-xs text-muted-foreground">These records were submitted via the website form and persisted to MongoDB.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {consultations.length} Submissions
                </span>
              </div>

              {consultations.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                  <PhoneCall className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm font-semibold text-navy">No consultations submitted yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Submit a test request using the consultation form on the home or contact page.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-cream text-navy uppercase font-semibold">
                      <tr>
                        <th className="p-3">ID / Date</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Treatment</th>
                        <th className="p-3">City</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {consultations.map((c) => (
                        <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                          <td className="p-3">
                            <p className="font-mono text-[11px] text-muted-foreground">{c.id.substring(0, 10)}...</p>
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <Calendar className="h-3 w-3" /> {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString()}
                            </p>
                          </td>
                          <td className="p-3 font-semibold text-navy">{c.name}</td>
                          <td className="p-3 font-mono">{c.phone}</td>
                          <td className="p-3 font-medium text-brand-orange">{c.treatment}</td>
                          <td className="p-3">{c.city}</td>
                          <td className="p-3">
                            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
