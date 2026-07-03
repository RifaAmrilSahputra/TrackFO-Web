export default function GangguanSelector({
  gangguan = [],
  value,
  onChange,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Live Tracking
          </span>

          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Monitoring Gangguan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pilih gangguan untuk melihat posisi teknisi yang sedang menangani
            pekerjaan.
          </p>
        </div>

        <div className="w-full lg:w-[420px]">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Gangguan Aktif
          </label>

          <select
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Pilih Gangguan...</option>

            {gangguan.map((item) => (
              <option key={item.id} value={item.id}>
                #{item.id} • {item.judul} • {item.area}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}