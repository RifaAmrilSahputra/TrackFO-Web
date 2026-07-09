import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  MapPinned,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { dashboardAPI } from "../../services/apiClient";

import DashboardStats from "./dashboard/DashboardStats";
import AssignmentSummary from "./dashboard/AssignmentSummary";
import PrioritySummary from "./dashboard/PrioritySummary";
import TrackingSummary from "./dashboard/TrackingSummary";
import LatestIssues from "./dashboard/LatestIssues";
import LatestAssignments from "./dashboard/LatestAssignments";
import BusyTechnicians from "./dashboard/BusyTechnicians";
import QuickActions from "./dashboard/QuickActions";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      const res =
        await dashboardAPI.getDashboard();

      setDashboard(res.data.data);

      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ??
          "Gagal memuat dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Selamat Pagi";

    if (hour < 15) return "Selamat Siang";

    if (hour < 18) return "Selamat Sore";

    return "Selamat Malam";
  }

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">

        <div className="flex items-center gap-3">

          <AlertTriangle className="text-red-600" />

          <div>

            <h2 className="font-semibold text-red-700">
              Dashboard Error
            </h2>

            <p className="mt-1 text-red-600">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 bg-slate-50">

      {/* ================= HERO ================= */}

      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-xl">

        <div className="flex flex-col justify-between gap-10 xl:flex-row">

          <div>

            <span className="rounded-full bg-white/10 px-4 py-1 text-sm">

              Dashboard Operasional

            </span>

            <h1 className="mt-6 text-5xl font-black tracking-tight">

              {getGreeting()},

              <br />

              {user?.nama}

            </h1>

            <p className="mt-5 max-w-2xl text-slate-300">

              Pantau seluruh aktivitas gangguan,
              assignment, tracking teknisi,
              dan laporan pekerjaan secara
              realtime melalui TrackFO.

            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <AlertTriangle className="mb-3 text-red-300" />

              <div className="text-3xl font-bold">

                {dashboard.stats.gangguanAktif}

              </div>

              <div className="mt-1 text-sm text-slate-300">

                Gangguan Aktif

              </div>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <MapPinned className="mb-3 text-green-300" />

              <div className="text-3xl font-bold">

                {dashboard.trackingSummary.online}

              </div>

              <div className="mt-1 text-sm text-slate-300">

                Teknisi Online

              </div>

            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">

              <Activity className="mb-3 text-cyan-300" />

              <div className="text-3xl font-bold">

                {dashboard.stats.assignmentAktif}

              </div>

              <div className="mt-1 text-sm text-slate-300">

                Assignment Aktif

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= STATS ================= */}

      <DashboardStats
        stats={dashboard.stats}
      />

      {/* ================= SUMMARY ================= */}

      <div className="grid gap-6 xl:grid-cols-2">

        <AssignmentSummary
          summary={dashboard.assignmentSummary}
        />

        <PrioritySummary
          summary={dashboard.prioritySummary}
        />

      </div>

      {/* ================= TRACKING ================= */}

      <TrackingSummary
        summary={dashboard.trackingSummary}
      />

      {/* ================= ACTIVITY ================= */}

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="space-y-6 xl:col-span-2">

          <LatestIssues
            issues={dashboard.latestGangguan}
          />

          <LatestAssignments
            assignments={
              dashboard.latestAssignment
            }
          />

        </div>

        <BusyTechnicians
          technicians={
            dashboard.busyTechnician
          }
        />

      </div>

      {/* ================= QUICK ACTION ================= */}

      <QuickActions />

    </div>
  );
}