import SectionCard from "./SectionCard";

function StatItem({
  title,
  value,
  color,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <span
          className={`h-3 w-3 rounded-full ${color}`}
        />

      </div>

      <h3 className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      )}

    </div>
  );
}

export default function DashboardStats({
  stats,
}) {

  if (!stats) return null;

  return (

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <StatItem
        title="Total Gangguan"
        value={stats.totalGangguan}
        color="bg-red-500"
        description={`${stats.gangguanAktif} gangguan aktif`}
      />

      <StatItem
        title="Teknisi"
        value={stats.totalTeknisi}
        color="bg-blue-500"
        description={`${stats.teknisiAvailable} tersedia`}
      />

      <StatItem
        title="Assignment"
        value={stats.assignmentAktif}
        color="bg-violet-500"
        description="Sedang berjalan"
      />

      <StatItem
        title="Laporan"
        value={stats.totalLaporan}
        color="bg-emerald-500"
        description="Total laporan"
      />

    </div>

  );
}