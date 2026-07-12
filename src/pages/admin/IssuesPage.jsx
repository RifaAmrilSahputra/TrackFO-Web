import { useMemo, useState } from 'react';
import { issueAPI, userAPI } from '../../services/apiClient';
import { useFetch, useMutation } from '../../hooks/useAPI';

const initialForm = {
  judul: '',
  deskripsi: '',
  area: '',
  alamat: '',
  latitude: '',
  longitude: '',
  priority: '',
  deadline: '',
};

const priorityStyles = {
  high: 'border-rose-200 bg-rose-50 text-rose-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

const statusStyles = {
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  on_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  open: 'border-rose-200 bg-rose-50 text-rose-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};


export default function IssuesPage() {
  const { data, loading, error, refetch } = useFetch(issueAPI.getAll);
  const { mutate, loading: creating, error: createError } = useMutation(issueAPI.create);
  const {
    data: areaData,
    loading: loadingAreas,
    error: areaError,
    refetch: refetchArea,
  } = useFetch(userAPI.getAreas);

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  const issues = useMemo(() => data?.data || [], [data]);

  const summary = useMemo(() => {
    const total = issues.length;
    const inProgress = issues.filter((issue) => normalize(issue.status).includes('progress')).length;
    const highPriority = issues.filter((issue) => normalize(issue.priority) === 'high').length;
    const done = issues.filter((issue) => ['done', 'resolved'].includes(normalize(issue.status))).length;

    return [
      { label: 'Total Gangguan', value: total, detail: 'Semua laporan masuk', tone: 'bg-slate-950' },
      { label: 'In Progress', value: inProgress, detail: 'Sedang ditangani', tone: 'bg-blue-500' },
      { label: 'High Priority', value: highPriority, detail: 'Butuh perhatian cepat', tone: 'bg-rose-500' },
      { label: 'Selesai', value: done, detail: 'Sudah terselesaikan', tone: 'bg-emerald-500' },
    ];
  }, [issues]);
 
  const statusOptions = useMemo(() => {
    const statuses = issues.map((issue) => issue.status).filter(Boolean);
    return [...new Set(statuses)];
  }, [issues]);

  const areaOptions = useMemo(() => {
    const areas = areaData?.data || areaData || [];

    if (!Array.isArray(areas)) return [];

    return [...new Set(
      areas
        .filter((area) => typeof area === 'string' && area.trim())
        .map((area) => area.trim())
    )].sort((firstArea, secondArea) => firstArea.localeCompare(secondArea, 'id'));
  }, [areaData]);

  const filteredIssues = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const title = issue.judul || issue.title || '';
      const description = issue.deskripsi || issue.description || '';
      const address = issue.alamat || issue.address || '';
      const status = normalize(issue.status || 'unknown');
      const priority = normalize(issue.priority || 'standar');
      const area = issue.area || '';
      const matchesArea =
        areaFilter === 'all' || area === areaFilter;
      const searchable = `
      ${title}
      ${description}
      ${address}
      ${area}
      ${status}
      ${priority}
      `
        .toLowerCase()
        .trim();

      const matchesSearch = !keyword || searchable.includes(keyword);
      const matchesStatus = statusFilter === 'all' || status === normalize(statusFilter);
      const matchesPriority = priorityFilter === 'all' || priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesArea
      );
    });
  }, [issues, priorityFilter, search, statusFilter, areaFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const payload = {
      judul: form.judul,
      deskripsi: form.deskripsi,
      area: form.area,
      alamat: form.alamat || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      priority: form.priority || undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    try {
      await mutate(payload);
      setForm(initialForm);
      setMessageType('success');
      setMessage('Gangguan berhasil dibuat.');
      refetch();
      refetchArea();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Gagal membuat gangguan.');
    }
  };

  const handleUpdateStatus = async (issueId, status) => {
    setMessage('');

    try {
      await issueAPI.update(issueId, { status });
      setMessageType('success');
      setMessage('Status gangguan berhasil diperbarui.');
      refetch();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Gagal memperbarui status.');
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchArea();
  };

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Operations
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Kelolaa Gangguan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Prioritaskan laporan masuk, pantau status penanganan, dan buat gangguan baru untuk tim lapangan.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Antrian aktif</p>
            <p className="mt-3 text-4xl font-semibold">{summary[0].value}</p>
            <p className="mt-2 text-sm text-slate-400">{summary[1].value} gangguan sedang dalam pengerjaan.</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-950">Daftar Gangguan</h3>
              <p className="mt-1 text-sm text-slate-500">
                {filteredIssues.length} dari {issues.length} gangguan ditampilkan.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, area, alamat, status..."
                className="h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Area</option>

                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                className="h-10 w-full rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <EmptyState title="Memuat gangguan..." description="Data terbaru sedang diambil dari server." />
            ) : error ? (
              <EmptyState
                title="Gagal memuat gangguan"
                description={error.message || 'Terjadi kesalahan saat memuat gangguan.'}
                tone="error"
              />
            ) : !issues.length ? (
              <EmptyState title="Belum ada gangguan" description="Gangguan baru yang dibuat akan muncul di sini." />
            ) : !filteredIssues.length ? (
              <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci, status, atau priority filter." />
            ) : (
              <div className="min-w-0 space-y-4">
                {filteredIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 2xl:sticky 2xl:top-6 2xl:self-start">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Buat Gangguan Baru</h3>
            <p className="mt-1 text-sm text-slate-500">Tambahkan laporan gangguan lengkap dengan lokasi dan prioritas.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Judul">
              <input
                name="judul"
                value={form.judul}
                onChange={handleChange}
                placeholder="Contoh: Kabel putus area FO-12"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows="4"
                placeholder="Tuliskan kronologi atau detail gangguan."
                className={inputClass}
                required
              />
            </Field>

            <Field label="Area">
              <select
                name="area"
                value={form.area}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={!areaOptions.length}
              >
                <option value="">
                  {areaOptions.length
                    ? 'Pilih Area'
                    : loadingAreas
                      ? 'Memuat Area...'
                      : 'Area belum tersedia'}
                </option>

                {areaOptions.map((area) => (
                  <option
                    key={area}
                    value={area}
                  >
                    {area}
                  </option>
                ))}
              </select>
              {areaError && (
                <p className="mt-2 text-xs text-rose-600">
                  Gagal memuat area. Silakan muat ulang halaman.
                </p>
              )}
            </Field>

            <Field label="Alamat">
              <input
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                placeholder="Alamat atau landmark terdekat"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude">
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="-6.2000"
                  className={inputClass}
                />
              </Field>
              <Field label="Longitude">
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="106.8166"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Priority">
                <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                  <option value="">Pilih priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>
            </div>

            {createError && <Alert tone="error">{createError.message}</Alert>}
            {message && <Alert tone={messageType}>{message}</Alert>}

            <button
              type="submit"
              disabled={creating}
              className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? 'Membuat...' : 'Buat Gangguan'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

function SummaryCard({ label, value, detail, tone }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${tone}`} />
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function IssueCard({ issue, onUpdateStatus }) {
  const title = issue.judul || issue.title || 'Tanpa judul';
  const description = issue.deskripsi || issue.description || 'Tidak ada deskripsi.';
  const address = issue.alamat || issue.address || 'Alamat belum tersedia';
  const status = issue.status || 'unknown';
  const priority = issue.priority || 'standar';
  const issueId = issue.id || '-';
  const deadline = issue.deadline || issue.dueDate || issue.due_date;

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              ID {issueId}
            </span>
            <Badge value={status} styles={statusStyles} />
            <Badge value={priority} styles={priorityStyles} />
          </div>
          <h4 className="mt-3 text-base font-semibold text-slate-950">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          <button
            onClick={() => onUpdateStatus(issue.id, 'on_progress')}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            In Progress
          </button>
          <button
            onClick={() => onUpdateStatus(issue.id, 'done')}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-3">
        <Meta label="Area" value={issue.area || '-'} />
        <Meta label="Alamat" value={address} />
        <Meta label="Deadline" value={deadline ? formatDate(deadline) : 'Belum ditentukan'} />
      </div>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Badge({ value, styles }) {
  const key = normalize(value);
  const className = styles[key] || styles.default;

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}>
      {formatLabel(value)}
    </span>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words font-medium text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState({ title, description, tone = 'default' }) {
  const color = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600';

  return (
    <div className={`rounded-2xl border p-6 text-center ${color}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-80">{description}</p>
    </div>
  );
}

function Alert({ tone = 'success', children }) {
  const className =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <p className={`rounded-lg border px-3 py-2 text-sm font-medium ${className}`}>{children}</p>;
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '_');
}

function formatLabel(value) {
  return String(value || 'Unknown').replace(/_/g, ' ');
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
