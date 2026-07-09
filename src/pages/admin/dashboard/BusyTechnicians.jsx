import {
  UserRound,
  MapPin,
  Clock3,
  Activity,
  ChevronRight,
} from "lucide-react";

import SectionCard from "./SectionCard";

function formatTime(date) {
  if (!date) return "-";

  const diff =
    (Date.now() - new Date(date).getTime()) / 1000;

  if (diff < 60)
    return `${Math.floor(diff)} detik lalu`;

  if (diff < 3600)
    return `${Math.floor(diff / 60)} menit lalu`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} jam lalu`;

  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function BusyTechnicians({
  technicians = [],
}) {

  return (

    <SectionCard
      title="Teknisi Sedang Bekerja"
      subtitle="Monitoring teknisi yang sedang menangani gangguan."
    >

      <div className="space-y-4">

        {technicians.length === 0 && (

          <div className="py-10 text-center text-slate-500">

            Tidak ada teknisi yang sedang bekerja.

          </div>

        )}

        {technicians.map((item) => (

          <div
            key={item.id}
            className="
              group
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-orange-200
              hover:shadow-lg
            "
          >

            <div className="flex items-start justify-between">

              <div className="flex gap-4">

                {/* Avatar */}

                <div className="relative">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">

                    <UserRound
                      size={28}
                      className="text-orange-600"
                    />

                  </div>

                  {/* Online Indicator */}

                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />

                </div>

                {/* Info */}

                <div>

                  <h3 className="font-semibold text-slate-900">

                    {item.nama}

                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

                    <MapPin size={15} />

                    {item.area}

                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                    <Clock3 size={15} />

                    {formatTime(item.lastSeen)}

                  </div>

                </div>

              </div>

              {/* Status */}

              <div className="flex flex-col items-end gap-3">

                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">

                  🟠 Busy

                </span>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </div>

            {/* Activity */}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Activity
                    size={18}
                    className="text-emerald-500"
                  />

                  <span className="text-sm font-medium text-slate-700">

                    Sedang Menangani Gangguan

                  </span>

                </div>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">

                  LIVE

                </span>

              </div>

              <div className="mt-4 h-2 rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                  style={{
                    width: "80%",
                  }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </SectionCard>

  );

}