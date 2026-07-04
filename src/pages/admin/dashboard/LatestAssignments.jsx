import SectionCard from "./SectionCard";

function Badge({ status }) {

  const colors = {
    assigned: "bg-blue-100 text-blue-700",
    accepted: "bg-cyan-100 text-cyan-700",
    on_the_way: "bg-yellow-100 text-yellow-700",
    working: "bg-green-100 text-green-700",
    pending_verification: "bg-violet-100 text-violet-700",
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

export default function LatestAssignments({
  assignments = [],
}) {
  return (
    <SectionCard
      title="Assignment Terbaru"
      subtitle="Assignment terbaru yang dibuat."
    >
      <div className="space-y-4">

        {assignments.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            Tidak ada assignment.
          </div>
        )}

        {assignments.map((item) => (

          <div
            key={item.id}
            className="rounded-xl border border-slate-200 p-4"
          >

            <div className="flex items-start justify-between">

              <div>

                <h4 className="font-semibold">

                  {item.gangguan}

                </h4>

                <div className="mt-1 text-sm text-slate-500">

                  👷 {item.teknisi}

                </div>

              </div>

              <Badge status={item.status} />

            </div>

            <div className="mt-3 text-sm text-slate-500">

              {new Date(item.assignedAt).toLocaleString(
                "id-ID"
              )}

            </div>

          </div>

        ))}

      </div>

    </SectionCard>
  );
}