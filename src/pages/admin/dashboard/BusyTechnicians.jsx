import SectionCard from "./SectionCard";

export default function BusyTechnicians({
  technicians = [],
}) {
  return (
    <SectionCard
      title="Teknisi Sedang Bekerja"
      subtitle="Teknisi yang sedang menangani gangguan."
    >

      <div className="space-y-4">

        {technicians.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            Semua teknisi sedang available.
          </div>
        )}

        {technicians.map((item) => (

          <div
            key={item.id}
            className="rounded-xl border border-slate-200 p-4"
          >

            <div className="flex items-start justify-between">

              <div>

                <h4 className="font-semibold">

                  👷 {item.nama}

                </h4>

                <div className="mt-1 text-sm text-slate-500">

                  {item.area}

                </div>

              </div>

              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">

                {item.status}

              </span>

            </div>

            <div className="mt-3 text-sm text-slate-500">

              Last Seen

              {" • "}

              {item.lastSeen
                ? new Date(item.lastSeen).toLocaleString(
                    "id-ID"
                  )
                : "-"}

            </div>

          </div>

        ))}

      </div>

    </SectionCard>
  );
}