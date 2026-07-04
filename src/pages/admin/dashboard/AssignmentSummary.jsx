import SectionCard from "./SectionCard";

function Item({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between">

        <span className="text-sm text-slate-500">
          {label}
        </span>

        <span
          className={`h-3 w-3 rounded-full ${color}`}
        />

      </div>

      <div className="mt-3 text-2xl font-bold text-slate-900">
        {value}
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
      title="Assignment"
      subtitle="Status pekerjaan teknisi."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <Item
          label="Assigned"
          value={summary.assigned}
          color="bg-blue-500"
        />

        <Item
          label="Accepted"
          value={summary.accepted}
          color="bg-cyan-500"
        />

        <Item
          label="On The Way"
          value={summary.on_the_way}
          color="bg-yellow-500"
        />

        <Item
          label="Working"
          value={summary.working}
          color="bg-green-500"
        />

        <Item
          label="Verification"
          value={summary.pending_verification}
          color="bg-violet-500"
        />

        <Item
          label="Done"
          value={summary.done}
          color="bg-slate-500"
        />

      </div>
    </SectionCard>
  );
}