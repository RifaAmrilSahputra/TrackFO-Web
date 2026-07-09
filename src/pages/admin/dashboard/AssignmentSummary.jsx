import {
  ClipboardPlus,
  CheckCircle2,
  Truck,
  Wrench,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";

import SectionCard from "./SectionCard";

const items = [
  {
    key: "assigned",
    label: "Assigned",
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-700",
    icon: ClipboardPlus,
  },
  {
    key: "accepted",
    label: "Accepted",
    color: "bg-cyan-500",
    light: "bg-cyan-50",
    text: "text-cyan-700",
    icon: CheckCircle2,
  },
  {
    key: "on_the_way",
    label: "On The Way",
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    icon: Truck,
  },
  {
    key: "working",
    label: "Working",
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    icon: Wrench,
  },
  {
    key: "pending_verification",
    label: "Verification",
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-700",
    icon: ShieldCheck,
  },
  {
    key: "done",
    label: "Done",
    color: "bg-slate-700",
    light: "bg-slate-100",
    text: "text-slate-700",
    icon: BadgeCheck,
  },
];

function AssignmentCard({
  label,
  value,
  Icon,
  color,
  light,
  text,
}) {
  return (
    <div
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
        hover:shadow-lg
      "
    >
      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            ${light}
          `}
        >
          <Icon
            size={24}
            className={text}
          />
        </div>

        <span
          className={`
            rounded-full
            px-2.5
            py-1
            text-xs
            font-semibold
            text-white
            ${color}
          `}
        >
          Active
        </span>

      </div>

      <div className="mt-6">

        <div className="text-4xl font-bold text-slate-900">

          {value}

        </div>

        <div className="mt-2 text-sm font-medium text-slate-500">

          {label}

        </div>

      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${Math.min(
              value * 10,
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}

export default function AssignmentSummary({
  summary,
}) {

  if (!summary) return null;

  return (

    <SectionCard
      title="Assignment Workflow"
      subtitle="Status seluruh proses assignment teknisi."
    >

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {items.map((item) => (

          <AssignmentCard
            key={item.key}
            label={item.label}
            value={summary[item.key] ?? 0}
            Icon={item.icon}
            color={item.color}
            light={item.light}
            text={item.text}
          />

        ))}

      </div>

    </SectionCard>

  );

}