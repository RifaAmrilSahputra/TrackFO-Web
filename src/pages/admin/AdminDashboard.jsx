import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { title: 'Technicians', value: '52', detail: '8 standby hari ini', accent: 'bg-blue-500' },
  { title: 'Active Assignments', value: '34', detail: '12 prioritas tinggi', accent: 'bg-violet-500' },
  { title: 'Pending Reports', value: '12', detail: 'Butuh review admin', accent: 'bg-amber-500' },
  { title: 'Completed Today', value: '8', detail: 'Selesai tepat waktu', accent: 'bg-emerald-500' },
];

const actions = [
  {
    title: 'Kelola Assignments',
    description: 'Buat dan pantau penugasan teknisi lapangan.',
    to: 'assignments',
    initial: 'A',
  },
  {
    title: 'Lihat Gangguan',
    description: 'Prioritaskan gangguan baru dan ubah status pekerjaan.',
    to: 'issues',
    initial: 'G',
  },
  {
    title: 'Generate Reports',
    description: 'Cek laporan harian dan rangkum performa area.',
    to: 'reports',
    initial: 'R',
  },
  {
    title: 'Tracking Teknisi',
    description: 'Pantau progress teknisi dan posisi assignment aktif.',
    to: 'tracking',
    initial: 'T',
  },
];

const activities = [
  { title: 'Assignment dibuat', meta: '2 jam lalu', status: 'Baru' },
  { title: 'Report diselesaikan', meta: '4 jam lalu', status: 'Selesai' },
  { title: 'Fault dilaporkan', meta: '6 jam lalu', status: 'Urgent' },
  { title: 'Technician ditambahkan', meta: '1 hari lalu', status: 'Info' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleText = user?.roles?.join(', ') || 'Admin';

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_300px] lg:p-8">
          <div>
            <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              {roleText}
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Selamat datang, {user?.nama || user?.name || 'Admin'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Ringkasan operasional area hari ini. Pantau gangguan, assignment, laporan, dan kesiapan teknisi dari satu tempat.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('issues')}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cek Gangguan
              </button>
              <button
                onClick={() => navigate('assignments')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Buat Assignment
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Kondisi area</p>
            <div className="mt-5 space-y-4">
              <ProgressRow label="SLA harian" value="86%" width="86%" />
              <ProgressRow label="Tim aktif" value="71%" width="71%" />
              <ProgressRow label="Report masuk" value="64%" width="64%" />
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Akses Cepat</h3>
              <p className="mt-1 text-sm text-slate-500">Menu utama untuk pekerjaan admin harian.</p>
            </div>
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
          <h3 className="text-lg font-semibold text-slate-950">Aktivitas Terakhir</h3>
          <div className="mt-5 space-y-3">
            {activities.map((activity) => (
              <ActivityItem key={`${activity.title}-${activity.meta}`} {...activity} />
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-5 md:grid-cols-3">
        <InfoItem label="User ID" value={user?.id || '-'} />
        <InfoItem label="Email" value={user?.email || '-'} />
        <InfoItem label="Role" value={roleText} />
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

function ProgressRow({ label, value, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-orange-400" style={{ width }} />
      </div>
    </div>
  );
}

function ActivityItem({ title, meta, status }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{meta}</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
        {status}
      </span>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-orange-700">{label}</p>
      <p className="mt-1 break-words font-semibold text-orange-950">{value}</p>
    </div>
  );
}
