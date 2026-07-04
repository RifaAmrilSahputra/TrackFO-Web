import SectionCard from "./SectionCard";

function PriorityCard({
  title,
  value,
  bg,
}) {
  return (
    <div
      className={`rounded-xl ${bg} p-5 text-white`}
    >
      <div className="text-sm opacity-90">
        {title}
      </div>

      <div className="mt-2 text-4xl font-bold">
        {value}
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
      subtitle="Gangguan aktif berdasarkan tingkat prioritas."
    >

      <div className="grid gap-4 md:grid-cols-3">

        <PriorityCard
          title="🔴 High"
          value={summary.high}
          bg="bg-red-500"
        />

        <PriorityCard
          title="🟡 Medium"
          value={summary.medium}
          bg="bg-yellow-500"
        />

        <PriorityCard
          title="🟢 Low"
          value={summary.low}
          bg="bg-green-500"
        />

      </div>

    </SectionCard>
  );
}