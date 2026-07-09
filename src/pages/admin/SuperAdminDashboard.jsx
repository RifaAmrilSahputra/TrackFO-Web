import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileText,
  MapPinned,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/apiClient';

import AssignmentSummary from './dashboard/AssignmentSummary';
import BusyTechnicians from './dashboard/BusyTechnicians';
import DashboardStats from './dashboard/DashboardStats';
import LatestAssignments from './dashboard/LatestAssignments';
import LatestIssues from './dashboard/LatestIssues';
import PrioritySummary from './dashboard/PrioritySummary';
import TrackingSummary from './dashboard/TrackingSummary';

const superAdminActions = [
  {
    title: 'User Management',
    description: 'Kelola admin dan teknisi yang mengakses TrackFO.',
    route: 'users',
    icon: Users,
    bg: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    title: 'Gangguan',
    description: 'Pantau gangguan lintas area dan status penanganannya.',
    route: 'issues',
    icon: AlertTriangle,
    bg: 'from-red-500 to-rose-600',
    light: 'bg-red-50',
    text: 'text-red-600',
  },
  {
    title: 'Assignment',
    description: 'Audit distribusi pekerjaan teknisi lapangan.',
    route: 'assignments',
    icon: ClipboardList,
    bg: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
    text: 'text-violet-600',
  },
  {
    title: 'Laporan',
    description: 'Review hasil pekerjaan dan performa penyelesaian.',
    route: 'reports',
    icon: FileText,
    bg: 'from-emerald-500 to-green-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      const res = await dashboardAPI.getDashboard();

      setDashboard(res.data.data);
      setError('');
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ??
          'Gagal memuat dashboard super admin.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialLoad = setTimeout(() => {
      loadDashboard();
    }, 0);

    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  const roleText = user?.roles?.join(', ') || 'SUPER_ADMIN';

  const operationalHealth = useMemo(() => {
    if (!dashboard?.trackingSummary) return 0;

    const total =
      dashboard.trackingSummary.online +
      dashboard.trackingSummary.offline;

    if (total === 0) return 0;

    return Math.round(
      (dashboard.trackingSummary.online / total) * 100
    );
  }, [dashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
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

            <p className="mt-1 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-slate-50">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl lg:p-10">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-slate-200">
              Super Admin Control Center
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Pusat kendali seluruh operasional TrackFO
            </h1>

            <p className="mt-5 max-w-3xl text-slate-300">
              Gunakan data dashboard operasional yang sama untuk melihat
              kesehatan tracking, beban assignment, gangguan prioritas, dan
              aktivitas terbaru lintas modul.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('users')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                <Users size={18} />
                Kelola Users
              </button>

              <button
                onClick={() => navigate('tracking')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <MapPinned size={18} />
                Monitor Tracking
              </button>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <HeroMetric
              icon={ShieldCheck}
              label="Health Tracking"
              value={`${operationalHealth}%`}
              detail="Teknisi online"
              tone="text-emerald-300"
            />
            <HeroMetric
              icon={AlertTriangle}
              label="Gangguan Aktif"
              value={dashboard.stats?.gangguanAktif ?? 0}
              detail="Butuh pemantauan"
              tone="text-red-300"
            />
            <HeroMetric
              icon={Activity}
              label="Assignment Aktif"
              value={dashboard.stats?.assignmentAktif ?? 0}
              detail="Sedang berjalan"
              tone="text-cyan-300"
            />
            <HeroMetric
              icon={Wifi}
              label="Teknisi Online"
              value={dashboard.trackingSummary?.online ?? 0}
              detail="Mengirim lokasi"
              tone="text-blue-300"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <InfoItem label="User ID" value={user?.id || '-'} />
        <InfoItem label="Email" value={user?.email || '-'} />
        <InfoItem label="Roles" value={roleText} />
      </section>

      <DashboardStats stats={dashboard.stats} />

      <div className="grid gap-6 xl:grid-cols-2">
        <AssignmentSummary summary={dashboard.assignmentSummary} />
        <PrioritySummary summary={dashboard.prioritySummary} />
      </div>

      <TrackingSummary summary={dashboard.trackingSummary} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <LatestIssues issues={dashboard.latestGangguan} />
          <LatestAssignments assignments={dashboard.latestAssignment} />
        </div>

        <BusyTechnicians technicians={dashboard.busyTechnician} />
      </div>

      <SuperAdminActions
        actions={superAdminActions}
        onNavigate={navigate}
      />
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
      <Icon className={tone} size={24} />

      <div className="mt-4 text-3xl font-bold">{value}</div>

      <div className="mt-1 text-sm font-semibold text-white">{label}</div>

      <div className="mt-1 text-xs text-slate-300">{detail}</div>
    </div>
  );
}

function SuperAdminActions({ actions, onNavigate }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Akses Cepat Super Admin
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Shortcut untuk kontrol user dan monitoring lintas modul.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => onNavigate(item.route)}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${item.bg}`}
              />

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.light}`}
              >
                <Icon size={32} className={item.text} />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${item.light} ${item.text}`}
                >
                  Buka Modul
                </span>

                <ArrowRight
                  size={20}
                  className="text-slate-400 transition-all duration-300 group-hover:translate-x-2 group-hover:text-slate-700"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}
