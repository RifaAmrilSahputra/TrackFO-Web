import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import SectionCard from "./SectionCard";

const priorities = [
  {
    key: "high",
    title: "High Priority",
    subtitle: "Perlu ditangani segera",
    color: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    text: "text-red-600",
    icon: AlertTriangle,
  },
  {
    key: "medium",
    title: "Medium Priority",
    subtitle: "Perlu penanganan",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: AlertCircle,
  },
  {
    key: "low",
    title: "Low Priority",
    subtitle: "Masih dalam batas aman",
    color: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: ShieldCheck,
  },
];

function PriorityCard({
  title,
  subtitle,
  value,
  Icon,
  color,
  bg,
  text,
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
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Gradient Decoration */}

      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-2
          bg-gradient-to-r
          ${color}
        `}
      />

      <div className="flex items-start justify-between">

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
            className={text}
          />
        </div>

        <span
          className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${bg}
            ${text}
          `}
        >
          Priority
        </span>

      </div>

      <div className="mt-8">

        <h2 className="text-5xl font-black tracking-tight text-slate-900">
          {value}
        </h2>

        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

      {/* Decorative Progress */}

      <div className="mt-8">

        <div className="h-2 rounded-full bg-slate-100">

          <div
            className={`
              h-full
              rounded-full
              bg-gradient-to-r
              ${color}
            `}
            style={{
              width: `${Math.min(
                value * 15,
                100
              )}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}

export default function PrioritySummary({
  summary,
}) {
  if (!summary) return null;

  return (
    <SectionCard
      title="Prioritas Gangguan"
      subtitle="Distribusi gangguan aktif berdasarkan tingkat prioritas."
    >
      <div className="grid gap-6 lg:grid-cols-3">

        {priorities.map((item) => (

          <PriorityCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            value={summary[item.key] ?? 0}
            Icon={item.icon}
            color={item.color}
            bg={item.bg}
            text={item.text}
          />

        ))}

      </div>
    </SectionCard>
  );
}