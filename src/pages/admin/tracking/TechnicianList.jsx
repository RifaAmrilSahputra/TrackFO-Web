function StatusBadge({ status }) {
  const styles = {
    assigned: "bg-blue-100 text-blue-700",
    accepted: "bg-cyan-100 text-cyan-700",
    on_the_way: "bg-amber-100 text-amber-700",
    working: "bg-green-100 text-green-700",
    pending_verification: "bg-violet-100 text-violet-700",
    done: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function TechnicianStatus({ status }) {
  const styles = {
    available: "bg-emerald-100 text-emerald-700",
    busy: "bg-orange-100 text-orange-700",
    off: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TechnicianList({
  teknisi = [],
  selected,
  onSelect,
}) {
  if (!teknisi.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-center text-slate-500">
          Belum ada teknisi yang ditugaskan.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-5">

        <h3 className="text-lg font-semibold text-slate-900">
          Tim Teknisi
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Klik salah satu teknisi untuk melihat histori tracking.
        </p>

      </div>

      <div className="space-y-4">

        {teknisi.map((item) => {

          const active =
            selected?.teknisiId === item.teknisiId;

          return (

            <button
              key={item.teknisiId}
              onClick={() => onSelect(item)}
              className={`w-full rounded-2xl border p-5 text-left transition

                ${
                  active
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                }
              `}
            >

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <h4 className="text-lg font-semibold">

                      👷 {item.nama}

                    </h4>

                    {item.isLeader && (

                      <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">

                        Leader

                      </span>

                    )}

                  </div>

                  <div className="mt-1 text-sm text-slate-500">

                    {item.email}

                  </div>

                </div>

                <div className="text-right">

                  <StatusBadge
                    status={item.assignmentStatus}
                  />

                </div>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-4">

                <div>

                  <div className="text-xs uppercase text-slate-400">

                    Status Teknisi

                  </div>

                  <div className="mt-1">

                    <TechnicianStatus
                      status={item.statusTeknisi}
                    />

                  </div>

                </div>

                <div>

                  <div className="text-xs uppercase text-slate-400">

                    Distance

                  </div>

                  <div className="mt-1 font-semibold">

                    {item.distance
                      ? `${item.distance.toFixed(2)} km`
                      : "-"}

                  </div>

                </div>

                <div>

                  <div className="text-xs uppercase text-slate-400">

                    Last Seen

                  </div>

                  <div className="mt-1 text-sm">

                    {item.lastSeen
                      ? new Date(
                          item.lastSeen
                        ).toLocaleString("id-ID")
                      : "-"}

                  </div>

                </div>

                <div>

                  <div className="text-xs uppercase text-slate-400">

                    Area Kerja

                  </div>

                  <div className="mt-1">

                    {item.areaKerja}

                  </div>

                </div>

              </div>

            </button>

          );

        })}

      </div>

    </section>
  );
}