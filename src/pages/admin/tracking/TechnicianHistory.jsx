function TimelineItem({ item, index }) {
  return (
    <div className="relative flex gap-4">

      <div className="flex flex-col items-center">

        <div className="z-10 h-3 w-3 rounded-full bg-blue-600" />

        <div className="flex-1 w-px bg-slate-200" />

      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4">

        <div className="flex items-center justify-between">

          <h4 className="font-semibold text-slate-900">
            Titik #{index + 1}
          </h4>

          <span className="text-xs text-slate-500">

            {
              item.recordedAt
                ? new Date(item.recordedAt)
                    .toLocaleString("id-ID")
                : "-"
            }

          </span>

        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">

          <div>

            <div className="text-xs uppercase text-slate-400">

              Latitude

            </div>

            <div className="mt-1">

              {item.latitude}

            </div>

          </div>

          <div>

            <div className="text-xs uppercase text-slate-400">

              Longitude

            </div>

            <div className="mt-1">

              {item.longitude}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default function TechnicianHistory({
  teknisi,
  history = [],
}) {

  if (!teknisi) {

    return (

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="text-center text-slate-500">

          Pilih salah satu teknisi
          untuk melihat histori tracking.

        </div>

      </section>

    );

  }

  return (

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-lg font-semibold">

            History Tracking

          </h3>

          <p className="mt-1 text-sm text-slate-500">

            👷 {teknisi.nama}

          </p>

        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">

          {history.length} titik

        </span>

      </div>

      {
        !history.length && (

          <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-slate-500">

            Belum ada history tracking.

          </div>

        )
      }

      <div className="mt-6 space-y-6">

        {
          history.map((item, index) => (

            <TimelineItem
              key={item.id}
              item={item}
              index={index}
            />

          ))
        }

      </div>

    </section>

  );

}