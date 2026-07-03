function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-none">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm font-medium text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "open":
      return "yellow";

    case "assigned":
      return "blue";

    case "on_progress":
      return "green";

    case "done":
      return "slate";

    default:
      return "slate";
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "red";

    case "medium":
      return "yellow";

    case "low":
      return "green";

    default:
      return "slate";
  }
}

export default function GangguanInfo({
  gangguan,
  teknisi = [],
}) {
  if (!gangguan) return null;

  const leader =
    teknisi.find((t) => t.isLeader);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <h3 className="text-lg font-semibold text-slate-900">
        Informasi Gangguan
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Detail gangguan yang sedang dimonitor.
      </p>

      <div className="mt-5 space-y-1">

        <Row
          label="ID"
          value={`#${gangguan.id}`}
        />

        <Row
          label="Judul"
          value={gangguan.judul}
        />

        <Row
          label="Area"
          value={gangguan.area}
        />

        <Row
          label="Alamat"
          value={gangguan.alamat}
        />

        <Row
          label="Priority"
          value={
            <Badge color={getPriorityColor(gangguan.priority)}>
              {gangguan.priority}
            </Badge>
          }
        />

        <Row
          label="Status"
          value={
            <Badge color={getStatusColor(gangguan.status)}>
              {gangguan.status}
            </Badge>
          }
        />

        <Row
          label="Deadline"
          value={
            gangguan.deadline
              ? new Date(
                  gangguan.deadline
                ).toLocaleString("id-ID")
              : "-"
          }
        />

      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">

        <h4 className="font-semibold text-slate-900">
          Leader Teknisi
        </h4>

        {leader ? (
          <div className="mt-3 rounded-xl bg-blue-50 p-4">

            <div className="text-base font-semibold">
              👷 {leader.nama}
            </div>

            <div className="mt-1 text-sm text-slate-600">
              {leader.assignmentStatus}
            </div>

            <div className="mt-3 text-sm">
              <div>
                📍 Distance :
                {" "}
                {leader.distance?.toFixed(2)}
                km
              </div>

              <div>
                🕒 Last Seen :
                {" "}
                {leader.lastSeen
                  ? new Date(
                      leader.lastSeen
                    ).toLocaleString("id-ID")
                  : "-"}
              </div>
            </div>

          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Belum ada leader.
          </div>
        )}

      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">

        <h4 className="font-semibold text-slate-900">
          Ringkasan Tim
        </h4>

        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="text-sm text-slate-500">
              Total Teknisi
            </div>

            <div className="mt-1 text-2xl font-bold">
              {teknisi.length}
            </div>

          </div>

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="text-sm text-slate-500">
              Working
            </div>

            <div className="mt-1 text-2xl font-bold">

              {
                teknisi.filter(
                  (t) =>
                    t.assignmentStatus ===
                    "working"
                ).length
              }

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}