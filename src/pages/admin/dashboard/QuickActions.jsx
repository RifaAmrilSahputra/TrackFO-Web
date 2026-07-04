import { useNavigate } from "react-router-dom";

import SectionCard from "./SectionCard";

const actions = [
  {
    title: "Kelola Gangguan",
    description:
      "Lihat gangguan baru dan lakukan assignment.",
    to: "issues",
    color: "bg-red-100 text-red-700",
    icon: "🚨",
  },
  {
    title: "Assignment",
    description:
      "Kelola penugasan teknisi.",
    to: "assignments",
    color: "bg-blue-100 text-blue-700",
    icon: "📋",
  },
  {
    title: "Tracking",
    description:
      "Pantau posisi teknisi secara realtime.",
    to: "tracking",
    color: "bg-green-100 text-green-700",
    icon: "📍",
  },
  {
    title: "Laporan",
    description:
      "Review laporan pekerjaan teknisi.",
    to: "reports",
    color: "bg-violet-100 text-violet-700",
    icon: "📄",
  },
];

export default function QuickActions() {

  const navigate = useNavigate();

  return (

    <SectionCard
      title="Akses Cepat"
      subtitle="Menu utama administrasi."
    >

      <div className="grid gap-4 md:grid-cols-2">

        {actions.map((item) => (

          <button
            key={item.title}
            onClick={() => navigate(item.to)}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
          >

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${item.color}`}
            >

              {item.icon}

            </div>

            <h4 className="mt-4 text-lg font-semibold text-slate-900">

              {item.title}

            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-500">

              {item.description}

            </p>

          </button>

        ))}

      </div>

    </SectionCard>

  );
}