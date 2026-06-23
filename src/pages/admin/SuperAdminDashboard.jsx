import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { title: 'Total Users', value: '1,234', detail: 'Admin dan teknisi aktif', accent: 'bg-blue-500' },
  { title: 'Total Technicians', value: '856', detail: 'Tersebar di semua area', accent: 'bg-violet-500' },
  { title: 'Active Assignments', value: '456', detail: 'Sedang dalam pengerjaan', accent: 'bg-amber-500' },
  { title: 'Completed Reports', value: '789', detail: 'Laporan sudah selesai', accent: 'bg-emerald-500' },
];

const actions = [
  {
    title: 'Kelola Users',
    description: 'Buat, edit, dan pantau user admin serta teknisi.',
    to: 'users',
    initial: 'U',
  },
  {
    title: 'Monitor Gangguan',
    description: 'Lihat gangguan lintas area dan status penanganannya.',
    to: 'issues',
    initial: 'G',
  },
  {
    title: 'Audit Assignment',
    description: 'Pantau beban kerja teknisi dan distribusi assignment.',
    to: 'assignments',
    initial: 'A',
  },
  {
    title: 'Laporan Nasional',
    description: 'Buka ringkasan performa dari seluruh area operasional.',
    to: 'reports',
    initial: 'R',
  },
];

const regions = [
  { name: 'Jakarta Barat', score: '92%', tone: 'bg-emerald-500' },
  { name: 'Bandung', score: '84%', tone: 'bg-blue-500' },
  { name: 'Surabaya', score: '77%', tone: 'bg-amber-500' },
  { name: 'Medan', score: '69%', tone: 'bg-rose-500' },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleText = user?.roles?.join(', ') || 'Super Admin';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {roleText}
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Pusat kendali TrackFO</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pantau user, assignment, laporan, dan performa area dari satu dashboard yang siap dipakai untuk keputusan cepat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('users')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Kelola Users
              </button>
              <button
                onClick={() => navigate('reports')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Lihat Reports
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Health sistem</p>
            <p className="mt-3 text-4xl font-semibold">98.2%</p>
            <p className="mt-2 text-sm text-slate-400">Operasional berjalan normal di mayoritas area.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric label="Area aktif" value="18" />
              <MiniMetric label="Admin online" value="42" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Akses Cepat</h3>
            <p className="mt-1 text-sm text-slate-500">Shortcut untuk kontrol sistem dan monitoring lintas area.</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {actions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.to)}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200">
                  {action.initial}
                </span>
                <h4 className="mt-4 font-semibold text-slate-950 group-hover:text-blue-700">{action.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Performa Area</h3>
          <div className="mt-5 space-y-4">
            {regions.map((region) => (
              <RegionRow key={region.name} {...region} />
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 md:grid-cols-3">
        <InfoItem label="User ID" value={user?.id || '-'} />
        <InfoItem label="Email" value={user?.email || '-'} />
        <InfoItem label="Roles" value={roleText} />
      </section>
    </div>
  );
}

function StatCard({ title, value, detail, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${accent}`} />
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function RegionRow({ name, score, tone }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{name}</span>
        <span className="font-semibold text-slate-950">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: score }} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-blue-700">{label}</p>
      <p className="mt-1 break-words font-semibold text-blue-950">{value}</p>
    </div>
  );
}
