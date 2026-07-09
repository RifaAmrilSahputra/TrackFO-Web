import {
  Activity,
  Wifi,
  WifiOff,
  Clock3,
} from "lucide-react";

import SectionCard from "./SectionCard";

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}) {
  return (
    <div
      className="
        group
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${bg}
          `}
        >
          <Icon
            size={28}
            className={color}
          />
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

          LIVE

        </span>

      </div>

      <div className="mt-6">

        <div className="text-4xl font-black text-slate-900">

          {value}

        </div>

        <div className="mt-2 font-semibold text-slate-800">

          {title}

        </div>

        <div className="mt-1 text-sm text-slate-500">

          {subtitle}

        </div>

      </div>

    </div>
  );
}

export default function TrackingSummary({
  summary,
}) {

  if (!summary) return null;

  const total =
    summary.online + summary.offline;

  const health =
    total === 0
      ? 0
      : Math.round(
          (summary.online / total) * 100
        );

  return (

    <SectionCard
      title="Tracking Monitoring"
      subtitle="Status koneksi GPS seluruh teknisi."
    >

      <div className="grid gap-6 xl:grid-cols-4">

        <SummaryCard
          title="Online"
          value={summary.online}
          subtitle="Teknisi aktif mengirim lokasi"
          icon={Wifi}
          color="text-green-600"
          bg="bg-green-50"
        />

        <SummaryCard
          title="Offline"
          value={summary.offline}
          subtitle="Belum mengirim lokasi"
          icon={WifiOff}
          color="text-red-600"
          bg="bg-red-50"
        />

        <SummaryCard
          title="Last Update"
          value={
            summary.lastUpdate
              ? new Date(
                  summary.lastUpdate
                ).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "--:--"
          }
          subtitle="Update GPS terakhir"
          icon={Clock3}
          color="text-blue-600"
          bg="bg-blue-50"
        />

        <div
          className="
            overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-slate-900
            to-slate-700
            p-6
            text-white
          "
        >

          <div className="flex items-center justify-between">

            <Activity
              size={30}
            />

            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">

              SYSTEM

            </span>

          </div>

          <div className="mt-8">

            <div className="text-5xl font-black">

              {health}%

            </div>

            <div className="mt-2 text-lg font-semibold">

              Tracking Health

            </div>

            <div className="mt-1 text-sm text-slate-300">

              Persentase teknisi yang sedang
              online.

            </div>

          </div>

          <div className="mt-8 h-3 rounded-full bg-white/20">

            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{
                width: `${health}%`,
              }}
            />

          </div>

        </div>

      </div>

    </SectionCard>

  );

}