import {
  ClipboardCheck,
  UserRound,
  Clock3,
  ChevronRight,
} from "lucide-react";

import SectionCard from "./SectionCard";

const statusConfig = {
  assigned: {
    color: "bg-blue-100 text-blue-700",
    icon: "📋",
    label: "Assigned",
  },
  accepted: {
    color: "bg-cyan-100 text-cyan-700",
    icon: "✅",
    label: "Accepted",
  },
  on_the_way: {
    color: "bg-amber-100 text-amber-700",
    icon: "🚗",
    label: "On The Way",
  },
  working: {
    color: "bg-emerald-100 text-emerald-700",
    icon: "🛠",
    label: "Working",
  },
  pending_verification: {
    color: "bg-violet-100 text-violet-700",
    icon: "📝",
    label: "Verification",
  },
  done: {
    color: "bg-slate-100 text-slate-700",
    icon: "✔",
    label: "Done",
  },
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

export default function LatestAssignments({
  assignments = [],
}) {
  return (
    <SectionCard
      title="Assignment Terbaru"
      subtitle="Penugasan teknisi terbaru."
    >
      <div className="space-y-4">

        {assignments.length === 0 && (
          <div className="py-10 text-center text-slate-500">
            Belum ada assignment.
          </div>
        )}

        {assignments.map((item) => {

          const status =
            statusConfig[item.status] ??
            statusConfig.assigned;

          return (

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
                hover:border-blue-200
                hover:shadow-lg
              "
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">

                    <ClipboardCheck
                      size={24}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">

                      {item.gangguan}

                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

                      <UserRound size={15} />

                      <span>

                        {item.teknisi}

                      </span>

                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                      <Clock3 size={15} />

                      {formatTime(
                        item.assignedAt
                      )}

                    </div>

                  </div>

                </div>

                <div className="flex flex-col items-end gap-3">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                  >
                    {status.icon} {status.label}
                  </span>

                  <ChevronRight
                    size={18}
                    className="text-slate-400 transition group-hover:translate-x-1"
                  />

                </div>

              </div>

              <div className="mt-5">

                <div className="h-2 rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{
                      width:
                        item.status === "assigned"
                          ? "20%"
                          : item.status === "accepted"
                          ? "40%"
                          : item.status === "on_the_way"
                          ? "60%"
                          : item.status === "working"
                          ? "80%"
                          : item.status ===
                            "pending_verification"
                          ? "90%"
                          : "100%",
                    }}
                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </SectionCard>
  );
}