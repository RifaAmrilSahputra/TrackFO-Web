import { useEffect, useState } from "react";
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

      setLoading(true);

      const res =
        await dashboardAPI.getDashboard();

      setDashboard(res.data.data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ??
        err.message
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

  if (loading) {

    return (

      <div className="flex h-80 items-center justify-center">

        <div className="text-slate-500">

          Memuat Dashboard...

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">

        {error}

      </div>

    );

  }

  return (

    <div className="space-y-6">

      {/* Hero */}

      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow">

        <div className="flex items-center justify-between">

          <div>

            <div className="text-sm text-slate-300">

              Dashboard Operasional

            </div>

            <h1 className="mt-2 text-4xl font-bold">

              Selamat Datang,

              {" "}

              {user?.nama}

            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">

              Pantau kondisi jaringan, assignment,
              tracking teknisi dan laporan
              secara realtime.

            </p>

          </div>

        </div>

      </section>

      {/* Stats */}

      <DashboardStats
        stats={dashboard.stats}
      />

      {/* Assignment */}

      <AssignmentSummary
        summary={dashboard.assignmentSummary}
      />

      {/* Priority */}

      <PrioritySummary
        summary={dashboard.prioritySummary}
      />

      {/* Tracking */}

      <TrackingSummary
        summary={dashboard.trackingSummary}
      />

      {/* List */}

      <div className="grid gap-6 xl:grid-cols-3">

        <LatestIssues
          issues={dashboard.latestGangguan}
        />

        <LatestAssignments
          assignments={
            dashboard.latestAssignment
          }
        />

        <BusyTechnicians
          technicians={
            dashboard.busyTechnician
          }
        />

      </div>

      {/* Quick Action */}

      <QuickActions />

    </div>

  );

}