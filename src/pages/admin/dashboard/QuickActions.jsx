import {
  AlertTriangle,
  ClipboardList,
  MapPinned,
  FileText,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import SectionCard from "./SectionCard";

const actions = [
  {
    title: "Gangguan",
    description: "Kelola gangguan jaringan dan lakukan assignment teknisi.",
    route: "/admin/issues",

    icon: AlertTriangle,

    bg: "from-red-500 to-rose-600",

    light: "bg-red-50",

    text: "text-red-600",
  },

  {
    title: "Assignment",
    description: "Monitor seluruh proses penugasan teknisi lapangan.",
    route: "/admin/assignments",

    icon: ClipboardList,

    bg: "from-blue-500 to-indigo-600",

    light: "bg-blue-50",

    text: "text-blue-600",
  },

  {
    title: "Tracking",
    description: "Pantau posisi teknisi secara realtime pada peta.",
    route: "/admin/tracking",

    icon: MapPinned,

    bg: "from-emerald-500 to-green-600",

    light: "bg-emerald-50",

    text: "text-emerald-600",
  },

  {
    title: "Laporan",
    description: "Lihat hasil pekerjaan teknisi dan laporan gangguan.",
    route: "/admin/reports",

    icon: FileText,

    bg: "from-violet-500 to-purple-600",

    light: "bg-violet-50",

    text: "text-violet-600",
  },
];

export default function QuickActions() {

  const navigate = useNavigate();

  return (

    <SectionCard
      title="Quick Actions"
      subtitle="Akses cepat menuju modul utama TrackFO."
    >

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {actions.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              onClick={() => navigate(item.route)}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-xl
              "
            >

              {/* Background Gradient */}

              <div
                className={`
                  absolute
                  inset-x-0
                  top-0
                  h-2
                  bg-gradient-to-r
                  ${item.bg}
                `}
              />

              {/* Icon */}

              <div
                className={`
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  ${item.light}
                `}
              >

                <Icon
                  size={32}
                  className={item.text}
                />

              </div>

              {/* Content */}

              <div className="mt-6">

                <h3 className="text-xl font-bold text-slate-900">

                  {item.title}

                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">

                  {item.description}

                </p>

              </div>

              {/* Footer */}

              <div className="mt-8 flex items-center justify-between">

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ${item.light}
                    ${item.text}
                  `}
                >

                  Buka Modul

                </span>

                <ArrowRight
                  size={20}
                  className="
                    text-slate-400
                    transition-all
                    duration-300
                    group-hover:translate-x-2
                    group-hover:text-slate-700
                  "
                />

              </div>

            </button>

          );

        })}

      </div>

    </SectionCard>

  );

}