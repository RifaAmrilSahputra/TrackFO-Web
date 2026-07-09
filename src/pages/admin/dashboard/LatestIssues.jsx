import {
  AlertTriangle,
  MapPin,
  Clock3,
  ChevronRight,
} from "lucide-react";

import SectionCard from "./SectionCard";

const statusColor = {
  open: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  on_progress: "bg-emerald-100 text-emerald-700",
  done: "bg-slate-100 text-slate-700",
};

const priorityColor = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-emerald-100 text-emerald-700",
};

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

export default function LatestIssues({
  issues = [],
}) {
  return (
    <SectionCard
      title="Gangguan Terbaru"
      subtitle="Gangguan yang baru masuk ke sistem."
    >
      <div className="space-y-4">

        {issues.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            Tidak ada gangguan.
          </div>
        )}

        {issues.map((item) => (

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
              hover:border-red-200
              hover:shadow-lg
            "
          >

            <div className="flex items-start justify-between">

              <div className="flex gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">

                  <AlertTriangle
                    size={24}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="font-semibold text-slate-900">

                      {item.judul}

                    </h3>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        priorityColor[item.priority]
                      }`}
                    >
                      {item.priority.toUpperCase()}
                    </span>

                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">

                    <span className="flex items-center gap-1">

                      <MapPin size={15} />

                      {item.area}

                    </span>

                    <span className="flex items-center gap-1">

                      <Clock3 size={15} />

                      {formatTime(item.createdAt)}

                    </span>

                  </div>

                </div>

              </div>

              <div className="flex flex-col items-end gap-3">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColor[item.status]
                  }`}
                >
                  {item.status}
                </span>

                <ChevronRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </SectionCard>
  );
}