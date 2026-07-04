import SectionCard from "./SectionCard";

function StatusBadge({ status }) {
  const colors = {
    open: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    on_progress: "bg-green-100 text-green-700",
    done: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        colors[status] || colors.done
      }`}
    >
      {status}
    </span>
  );
}

export default function LatestIssues({ issues = [] }) {
  return (
    <SectionCard
      title="Gangguan Terbaru"
      subtitle="5 gangguan terbaru yang masuk."
    >
      <div className="space-y-4">
        {issues.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            Tidak ada data.
          </div>
        )}

        {issues.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start justify-between">

              <div>

                <h4 className="font-semibold text-slate-900">
                  {item.judul}
                </h4>

                <div className="mt-1 text-sm text-slate-500">
                  {item.area}
                </div>

              </div>

              <StatusBadge status={item.status} />

            </div>

            <div className="mt-4 flex items-center justify-between text-sm">

              <span className="font-medium text-red-600">
                {item.priority}
              </span>

              <span className="text-slate-500">
                {new Date(item.createdAt).toLocaleString("id-ID")}
              </span>

            </div>

          </div>
        ))}
      </div>
    </SectionCard>
  );
}