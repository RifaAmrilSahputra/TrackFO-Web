import { useEffect, useMemo, useRef, useState } from 'react';

import { trackingAPI } from '../../services/apiClient';

import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import { useFetch, useMutation } from '../../hooks/useAPI';

export default function TrackingPage() {
  const mapRef = useRef(null);



  const { data, loading, error, refetch } = useFetch(trackingAPI.getAll);

  // Polling 30 detik: update marker, tanpa mengubah posisi/zoom map
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(() => {
      // marker akan ikut ter-refresh via state `data` dari useFetch
      refetch();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loading, refetch]);


  const { mutate: fetchHistory, loading: fetchingHistory } = useMutation((id) => trackingAPI.getByTechnician(id));

  const [history, setHistory] = useState(null);
  const [teknisiId, setTeknisiId] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [search, setSearch] = useState('');

  const trackings = useMemo(() => data?.data || [], [data]);

  const summary = useMemo(() => {
    const technicianIds = new Set(trackings.map((item) => getTechnicianId(item)).filter(Boolean));
    const withCoordinate = trackings.filter((item) => item.latitude && item.longitude).length;
    const latest = trackings
      .map((item) => getTime(item))
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return [
      { label: 'Tracking Masuk', value: trackings.length, detail: 'Titik lokasi tercatat', tone: 'bg-slate-950' },
      { label: 'Teknisi Unik', value: technicianIds.size, detail: 'Teknisi terpantau', tone: 'bg-blue-500' },
      { label: 'Koordinat Valid', value: withCoordinate, detail: 'Latitude dan longitude ada', tone: 'bg-emerald-500' },
      { label: 'Update Terakhir', value: latest ? formatShortDate(latest) : '-', detail: 'Waktu titik terbaru', tone: 'bg-violet-500' },
    ];
  }, [trackings]);

  const filteredTrackings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return trackings.filter((item) => {
      const technicianId = getTechnicianId(item);
      const technicianName = item.teknisi?.user?.name || item.technician?.name || item.teknisiName || '';
      const searchable = `${technicianId} ${technicianName} ${item.latitude || ''} ${item.longitude || ''} ${getTime(item) || ''}`.toLowerCase();

      return !keyword || searchable.includes(keyword);
    });
  }, [search, trackings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHistoryError('');
    setHistory(null);

    if (!teknisiId) {
      setHistoryError('Masukkan ID teknisi terlebih dahulu.');
      return;
    }

    try {
      const response = await fetchHistory(teknisiId);
      setHistory(response.data);
    } catch (err) {
      setHistoryError(err?.message || 'Gagal mengambil history tracking.');
    }
  };

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Live Tracking
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Tracking Teknisi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pantau titik lokasi teknisi terbaru dan telusuri riwayat tracking berdasarkan ID teknisi.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Titik terbaru</p>
            <p className="mt-3 text-4xl font-semibold">{summary[0].value}</p>
            <p className="mt-2 text-sm text-slate-400">{summary[1].value} teknisi tercatat di tracking.</p>
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
          {/* Peta Tracking */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-3">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">GPS Teknisi</h3>
                <p className="mt-1 text-sm text-slate-500">Marker diperbarui otomatis setiap 30 detik.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={refetch}
                  className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="mt-3 rounded-xl bg-white p-8 text-center text-sm text-slate-600">
                Memuat peta dan data tracking...
              </div>
            ) : !trackings.length ? (
              <div className="mt-3 rounded-xl bg-white p-8 text-center text-sm text-slate-600">Belum ada data GPS teknisi.</div>
            ) : (
              <div className="mt-3">
                <div className="h-[420px] w-full overflow-hidden rounded-xl bg-white">
                  <MapContainer
                    // agar tidak menggeser map saat data berubah, jangan pakai key berbasis data
                    style={{ height: '100%', width: '100%' }}
                    center={getMapCenter(trackings)}
                    zoom={getMapZoom(trackings)}
                    scrollWheelZoom={true}
                    whenCreated={(map) => {
                      mapRef.current = map;
                    }}

                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {trackings
                      .filter((item) => isValidLatLng(item.latitude, item.longitude))
                      .map((item) => {
                        const technicianId = getTechnicianId(item) || '-';
                        const technicianName = item.teknisi?.user?.name || item.technician?.name || item.teknisiName || '';
                        const time = getTime(item);
                        const status = item.status || item.teknisiStatus || '';
                        const task = item.task || item.tugas || '';

                        return (
                          <Marker
                            key={item.id || `${technicianId}-${time}`}
                            position={[Number(item.latitude), Number(item.longitude)]}
                          >
                            <Popup>
                              <div className="min-w-[180px] text-sm">
                                <div className="font-semibold">{technicianName || 'Teknisi'}</div>
                                <div className="mt-1 text-xs text-slate-600">ID: {technicianId}</div>
                                {status ? <div className="mt-1">Status: {status}</div> : null}
                                {task ? <div className="mt-1">Tugas: {task}</div> : null}
                                <div className="mt-1">Update: {time ? formatDate(time) : '-'}</div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Konten list + history */}
          <div className="mt-5 flex min-w-0 flex-col gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-950">Latest Tracking</h3>
              <p className="mt-1 text-sm text-slate-500">
                {filteredTrackings.length} dari {trackings.length} titik tracking ditampilkan.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari teknisi, koordinat, waktu..."
                className={controlClass}
              />
              {/* tombol Refresh sudah ada di header peta */}
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <EmptyState title="Memuat tracking..." description="Data lokasi teknisi sedang diambil." />
            ) : error ? (
              <TrackingError error={error} onRefresh={refetch} />
            ) : !trackings.length ? (
              <EmptyState title="Belum ada tracking" description="Titik lokasi teknisi akan muncul di daftar ini." />
            ) : !filteredTrackings.length ? (
              <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci pencarian tracking." />
            ) : (
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                {filteredTrackings.map((item) => (
                  <TrackingCard key={item.id || `${getTechnicianId(item)}-${getTime(item)}`} item={item} />
                ))}
              </div>
            )}
          </div>


        </section>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 2xl:sticky 2xl:top-6 2xl:self-start">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">History Teknisi</h3>
            <p className="mt-1 text-sm text-slate-500">Cari riwayat tracking berdasarkan ID teknisi.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Teknisi ID">
              <input
                value={teknisiId}
                onChange={(e) => setTeknisiId(e.target.value)}
                placeholder="Contoh: 24"
                className={inputClass}
              />
            </Field>
            {historyError && <Alert tone="error">{historyError}</Alert>}
            <button
              type="submit"
              disabled={fetchingHistory}
              className="h-11 w-full rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {fetchingHistory ? 'Mencari...' : 'Cari History'}
            </button>
          </form>

          {history && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-950">History Tracking</h4>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {history.data?.length || 0} titik
                </span>
              </div>

              {history.data?.length ? (
                <div className="mt-4 space-y-3">
                  {history.data.map((item) => (
                    <HistoryItem key={item.id || `${item.latitude}-${item.longitude}-${getTime(item)}`} item={item} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Tidak ada history untuk ID ini.</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const controlClass =
  'h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

function TrackingCard({ item }) {
  const technicianId = getTechnicianId(item) || '-';
  const technicianName = item.teknisi?.user?.name || item.technician?.name || item.teknisiName;
  const time = getTime(item);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">
          {String(technicianId).slice(0, 2)}
        </div>
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-slate-950">Teknisi ID: {technicianId}</h4>
          <p className="truncate text-sm text-slate-500">{technicianName || 'Nama teknisi belum tersedia'}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
        <Meta label="Latitude" value={item.latitude || '-'} />
        <Meta label="Longitude" value={item.longitude || '-'} />
        <Meta label="Waktu" value={time ? formatDate(time) : 'Tidak tersedia'} wide />
      </div>
    </article>
  );
}

function HistoryItem({ item }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <Meta label="Latitude" value={item.latitude || '-'} />
        <Meta label="Longitude" value={item.longitude || '-'} />
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <Meta label="Waktu" value={getTime(item) ? formatDate(getTime(item)) : 'Tidak tersedia'} />
      </div>
    </div>
  );
}

function TrackingError({ error, onRefresh }) {
  if (error.statusCode === 403) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="font-semibold text-rose-700">{error.message || 'Anda tidak memiliki akses ke resource ini.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-rose-200 hover:bg-rose-100"
          >
            Logout & Login
          </button>
          <button onClick={onRefresh} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return <EmptyState title="Gagal memuat tracking" description={error.message || 'Terjadi kesalahan saat memuat tracking.'} tone="error" />;
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

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Meta({ label, value, wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
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

function getTechnicianId(item) {
  return item.teknisiId || item.teknisi_id || item.technicianId || item.technician_id || item.teknisi?.id || item.technician?.id;
}

function getTime(item) {
  return item.createdAt || item.created_at || item.timestamp || item.time;
}

function formatShortDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(date);
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

function isValidLatLng(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return Number.isFinite(nLat) && Number.isFinite(nLng) && Math.abs(nLat) <= 90 && Math.abs(nLng) <= 180;
}

function getMapCenter(items) {
  const valid = items
    .map((i) => ({ lat: Number(i.latitude), lng: Number(i.longitude) }))
    .filter((p) => isValidLatLng(p.lat, p.lng));

  if (!valid.length) return [-6.200000, 106.816666];

  const lats = valid.map((p) => p.lat);
  const lngs = valid.map((p) => p.lng);
  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
  return [avgLat, avgLng];
}

function getMapZoom(items) {
  const valid = items.filter((i) => isValidLatLng(i.latitude, i.longitude));
  if (!valid.length) return 12;
  return 12;
}

