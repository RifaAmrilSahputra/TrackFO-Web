import {
  AlertTriangle,
  Users,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Background Decoration */}

      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 ${color}`}
      />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <div className="mt-4 flex items-center gap-2">

            <TrendingUp
              size={15}
              className="text-emerald-500"
            />

            <span className="text-sm text-slate-500">
              {subtitle}
            </span>

          </div>

        </div>

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-white
            shadow-lg
            ${color}
          `}
        >
          {icon}
        </div>

      </div>

      <div className="mt-6 h-1 w-full rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: "70%",
          }}
        />

      </div>

    </div>
  );
}

export default function DashboardStats({
  stats,
}) {
  if (!stats) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Gangguan"
        value={stats.totalGangguan}
        subtitle={`${stats.gangguanAktif} gangguan aktif`}
        icon={<AlertTriangle size={28} />}
        color="bg-red-500"
      />

      <StatCard
        title="Total Teknisi"
        value={stats.totalTeknisi}
        subtitle={`${stats.teknisiAvailable} teknisi tersedia`}
        icon={<Users size={28} />}
        color="bg-blue-500"
      />

      <StatCard
        title="Assignment Aktif"
        value={stats.assignmentAktif}
        subtitle={`${stats.teknisiBusy} teknisi sedang bekerja`}
        icon={<ClipboardList size={28} />}
        color="bg-violet-500"
      />

      <StatCard
        title="Total Laporan"
        value={stats.totalLaporan}
        subtitle="Laporan pekerjaan"
        icon={<FileText size={28} />}
        color="bg-emerald-500"
      />

    </div>
  );
}