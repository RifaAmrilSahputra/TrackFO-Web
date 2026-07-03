function Card({ title, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <h3 className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

      <Card
        title="Total Teknisi"
        value={summary.totalTeknisi}
        color="text-slate-900"
      />

      <Card
        title="Leader"
        value={summary.leader}
        color="text-blue-600"
      />

      <Card
        title="Working"
        value={summary.working}
        color="text-emerald-600"
      />

      <Card
        title="On The Way"
        value={summary.onTheWay}
        color="text-amber-600"
      />

      <Card
        title="Rata-rata Jarak"
        value={`${summary.averageDistance} km`}
        color="text-violet-600"
      />

    </div>
  );
}