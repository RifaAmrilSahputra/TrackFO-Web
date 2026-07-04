import SectionCard from "./SectionCard";

function TrackingCard({
  title,
  value,
  color,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-500">
          {title}
        </span>

        <span
          className={`h-3 w-3 rounded-full ${color}`}
        />

      </div>

      <div className="mt-3 text-3xl font-bold">
        {value}
      </div>

    </div>
  );
}

export default function TrackingSummary({
  summary,
}) {
  if (!summary) return null;

  return (
    <SectionCard
      title="Tracking Teknisi"
      subtitle="Status koneksi GPS teknisi."
    >

      <div className="grid gap-4 md:grid-cols-3">

        <TrackingCard
          title="🟢 Online"
          value={summary.online}
          color="bg-green-500"
        />

        <TrackingCard
          title="⚫ Offline"
          value={summary.offline}
          color="bg-slate-500"
        />

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

          <div className="text-sm text-slate-500">

            Last Update

          </div>

          <div className="mt-3 font-semibold text-slate-900">

            {summary.lastUpdate
              ? new Date(
                  summary.lastUpdate
                ).toLocaleString("id-ID")
              : "-"}

          </div>

        </div>

      </div>

    </SectionCard>
  );
}