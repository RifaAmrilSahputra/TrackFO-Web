import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useAPI';
import { reportAPI } from '../../services/apiClient';

const statusStyles = {
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  review: 'border-blue-200 bg-blue-50 text-blue-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function ReportsPage() {
  const { data, loading, error, refetch } = useFetch(reportAPI.getAll);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const reports = useMemo(() => data?.data || [], [data]);

  const statusOptions = useMemo(() => {
    const statuses = reports.map((report) => report.status).filter(Boolean);
    return [...new Set(statuses)];
  }, [reports]);

  const summary = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((report) => ['pending', 'review'].includes(normalize(report.status))).length;
    const completed = reports.filter((report) => ['approved', 'done', 'completed'].includes(normalize(report.status))).length;
    const withNotes = reports.filter((report) => report.catatan || report.notes || report.description).length;

    return [
      { label: 'Total Laporan', value: total, detail: 'Semua laporan masuk', tone: 'bg-slate-950' },
      { label: 'Perlu Review', value: pending, detail: 'Menunggu validasi', tone: 'bg-amber-500' },
      { label: 'Selesai', value: completed, detail: 'Sudah tervalidasi', tone: 'bg-emerald-500' },
      { label: 'Ada Catatan', value: withNotes, detail: 'Memiliki detail teknisi', tone: 'bg-blue-500' },
    ];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      const reportId = report.id || '';
      const issueId = report.gangguanId || report.issueId || report.gangguan_id || '';
      const status = report.status || 'Belum ditentukan';
      const notes = report.catatan || report.notes || report.description || '';
      const technician = report.teknisi?.user?.name || report.technician?.name || report.teknisiName || '';
      const searchable = `${reportId} ${issueId} ${status} ${notes} ${technician}`.toLowerCase();

      const matchesSearch = !keyword || searchable.includes(keyword);
      const matchesStatus = statusFilter === 'all' || normalize(status) === normalize(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Reports
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Laporan Teknisi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review laporan lapangan, cek status validasi, dan temukan catatan penyelesaian gangguan dengan cepat.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Laporan masuk</p>
            <p className="mt-3 text-4xl font-semibold">{summary[0].value}</p>
            <p className="mt-2 text-sm text-slate-400">{summary[1].value} laporan masih perlu review.</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950">Daftar Laporan</h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredReports.length} dari {reports.length} laporan ditampilkan.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari report, gangguan, catatan..."
              className={controlClass}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={controlClass}>
              <option value="all">Semua status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
            <button
              onClick={refetch}
              className="h-10 w-full rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <EmptyState title="Memuat laporan..." description="Data laporan sedang diambil dari server." />
          ) : error ? (
            <EmptyState title="Gagal memuat laporan" description={error.message || 'Terjadi kesalahan saat memuat laporan.'} tone="error" />
          ) : !reports.length ? (
            <EmptyState title="Belum ada laporan" description="Laporan teknisi akan muncul di daftar ini." />
          ) : !filteredReports.length ? (
            <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci atau filter status." />
          ) : (
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const controlClass =
  'h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

function ReportCard({ report }) {
  const reportId = report.id || '-';
  const issueId = report.gangguanId || report.issueId || report.gangguan_id || '-';
  const status = report.status || 'Belum ditentukan';
  const notes = report.catatan || report.notes || report.description || 'Tidak ada catatan.';
  const technician = report.teknisi?.user?.name || report.technician?.name || report.teknisiName || '-';
  const createdAt = report.createdAt || report.created_at || report.timestamp || report.time;

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Report {reportId}</span>
            <Badge value={status} />
          </div>
          <h4 className="mt-3 font-semibold text-slate-950">Gangguan ID: {issueId}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{notes}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
        <Meta label="Teknisi" value={technician} />
        <Meta label="Waktu" value={createdAt ? formatDate(createdAt) : 'Belum tersedia'} />
      </div>
    </article>
  );
}

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

function Badge({ value }) {
  const key = normalize(value);
  const className = statusStyles[key] || statusStyles.default;

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
