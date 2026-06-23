import { useMemo, useState } from 'react';
import { authAPI, userAPI } from '../../services/apiClient';
import { useFetch, useMutation } from '../../hooks/useAPI';

const emptyForm = {
  nama: '',
  email: '',
  password: '',
  noHp: '',
  areaKerja: '',
  alamat: '',
  latitude: '',
  longitude: '',
};

const emptyPasswordForm = { newPassword: '', confirmPassword: '' };

function normalizeTechnician(technician) {
  const profile = technician.teknisi || technician.technician || {};
  const userSource = technician.user || {};
  const nama = technician.nama || technician.name || userSource.nama || userSource.name || '';
  const email = technician.email || userSource.email || '';
  const noHp =
    profile.noHp ||
    profile.no_hp ||
    profile.phone ||
    technician.noHp ||
    technician.no_hp ||
    technician.phone ||
    userSource.noHp ||
    userSource.no_hp ||
    userSource.phone ||
    '';
  const areaKerja =
    profile.areaKerja ||
    profile.area_kerja ||
    technician.areaKerja ||
    technician.area_kerja ||
    technician.area ||
    userSource.areaKerja ||
    userSource.area_kerja ||
    '';
  const alamat = profile.alamat || technician.alamat || technician.address || userSource.alamat || '';
  const latitude = profile.latitude ?? technician.latitude ?? userSource.latitude ?? '';
  const longitude = profile.longitude ?? technician.longitude ?? userSource.longitude ?? '';

  return {
    ...technician,
    nama,
    email,
    noHp,
    areaKerja,
    alamat,
    latitude,
    longitude,
    isActive: technician.isActive ?? userSource.isActive ?? true,
    createdAt: technician.createdAt || userSource.createdAt || '',
  };
}

function getResponseMessage(response, fallback) {
  return response?.message || response?.data?.message || fallback;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateTechnicianForm(form, includePassword = false) {
  if (!form.nama.trim()) return 'Nama wajib diisi.';
  if (!form.email.trim()) return 'Email wajib diisi.';
  if (!validateEmail(form.email)) return 'Format email tidak valid.';
  if (includePassword && form.password && form.password.length < 8) return 'Password minimal 8 karakter.';
  if (form.noHp && !/^[0-9+\-\s()]+$/.test(form.noHp)) return 'Nomor HP hanya boleh berisi angka dan simbol +.';
  if (form.latitude !== '' && Number.isNaN(Number(form.latitude))) return 'Latitude harus berupa angka.';
  if (form.longitude !== '' && Number.isNaN(Number(form.longitude))) return 'Longitude harus berupa angka.';
  return '';
}

function buildPayload(form, mode = 'update') {
  const payload = {
    [mode === 'create' ? 'name' : 'nama']: form.nama.trim(),
    email: form.email.trim(),
    noHp: form.noHp.trim(),
    areaKerja: form.areaKerja.trim(),
    alamat: form.alamat.trim(),
    latitude: form.latitude === '' ? null : Number(form.latitude),
    longitude: form.longitude === '' ? null : Number(form.longitude),
  };

  if (mode === 'create') {
    payload.roles = ['TEKNISI'];
    if (form.password) payload.password = form.password;
  }

  return payload;
}

export default function UsersPage() {
  const { data, loading, error, refetch } = useFetch(userAPI.getTechnicians);
  const createMutation = useMutation(userAPI.create);
  const updateMutation = useMutation(userAPI.update);
  const resetPasswordMutation = useMutation(authAPI.resetUserPassword);
  const disableMutation = useMutation(userAPI.delete);

  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [toast, setToast] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const technicians = useMemo(() => (data?.data || data || []).map(normalizeTechnician), [data]);

  const areas = useMemo(() => {
    const values = technicians.map((technician) => technician.areaKerja).filter(Boolean);
    return [...new Set(values)];
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return technicians.filter((technician) => {
      const searchable = [
        technician.nama,
        technician.email,
        technician.noHp,
        technician.areaKerja,
        technician.alamat,
      ]
        .join(' ')
        .toLowerCase();

      return (!keyword || searchable.includes(keyword)) && (areaFilter === 'all' || technician.areaKerja === areaFilter);
    });
  }, [areaFilter, search, technicians]);

  const summary = useMemo(() => {
    const active = technicians.filter((technician) => technician.isActive).length;
    const withCoordinate = technicians.filter((technician) => technician.latitude !== '' && technician.longitude !== '').length;

    return [
      { label: 'Total Teknisi', value: technicians.length },
      { label: 'Aktif', value: active },
      { label: 'Area Kerja', value: areas.length },
      { label: 'Koordinat', value: withCoordinate },
    ];
  }, [areas.length, technicians]);

  const isSubmitting =
    createMutation.loading || updateMutation.loading || resetPasswordMutation.loading || disableMutation.loading;

  const openCreateModal = () => {
    setForm(emptyForm);
    setCreateOpen(true);
    setToast(null);
  };

  const openEditModal = (technician) => {
    setSelectedTechnician(technician);
    setForm({
      nama: technician.nama || '',
      email: technician.email || '',
      password: '',
      noHp: technician.noHp || '',
      areaKerja: technician.areaKerja || '',
      alamat: technician.alamat || '',
      latitude: technician.latitude ?? '',
      longitude: technician.longitude ?? '',
    });
    setEditOpen(true);
    setToast(null);
  };

  const openResetModal = (technician) => {
    setSelectedTechnician(technician);
    setPasswordForm(emptyPasswordForm);
    setResetOpen(true);
    setToast(null);
  };

  const openDeleteModal = (technician) => {
    setSelectedTechnician(technician);
    setDeleteOpen(true);
    setToast(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const validationError = validateTechnicianForm(form, true);
    if (validationError) {
      setToast({ tone: 'error', message: validationError });
      return;
    }

    try {
      const response = await createMutation.mutate(buildPayload(form, 'create'));
      setCreateOpen(false);
      setForm(emptyForm);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Teknisi berhasil dibuat.') });
      if (response?.temporaryPassword) setTemporaryPassword(response.temporaryPassword);
      refetch();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal membuat teknisi.' });
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const validationError = validateTechnicianForm(form);
    if (validationError) {
      setToast({ tone: 'error', message: validationError });
      return;
    }

    try {
      const response = await updateMutation.mutate(selectedTechnician.id, buildPayload(form));
      setEditOpen(false);
      setSelectedTechnician(null);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Data teknisi berhasil diperbarui.') });
      refetch();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal memperbarui teknisi.' });
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!passwordForm.newPassword) {
      setToast({ tone: 'error', message: 'Password baru wajib diisi.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setToast({ tone: 'error', message: 'Password baru minimal 8 karakter.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ tone: 'error', message: 'Konfirmasi password tidak sama.' });
      return;
    }

    try {
      const response = await resetPasswordMutation.mutate(selectedTechnician.id, passwordForm.newPassword);
      setResetOpen(false);
      setPasswordForm(emptyPasswordForm);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Password teknisi berhasil direset.') });
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal reset password teknisi.' });
    }
  };

  const handleDisable = async () => {
    try {
      const response = await disableMutation.mutate(selectedTechnician.id);
      setDeleteOpen(false);
      setSelectedTechnician(null);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Teknisi berhasil dinonaktifkan.') });
      refetch();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal menonaktifkan teknisi.' });
    }
  };

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Super Admin</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Management Teknisi</h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola akun teknisi, area kerja, koordinat, reset password, dan status akun.
            </p>
          </div>
          <button onClick={openCreateModal} className={primaryButtonClass}>
            Tambah Teknisi
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </section>

      {toast && <Alert tone={toast.tone}>{toast.message}</Alert>}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_120px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, email, nomor HP, area kerja, alamat..."
            className={controlClass}
          />
          <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className={controlClass}>
            <option value="all">Semua area</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <button onClick={refetch} className={secondaryButtonClass}>
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <EmptyState title="Memuat teknisi..." description="Data teknisi sedang diambil dari server." />
          ) : error ? (
            <EmptyState
              title={error.statusCode === 403 ? 'Akses ditolak' : 'Gagal memuat teknisi'}
              description={error.message || 'Terjadi kesalahan saat memuat teknisi.'}
              tone="error"
            />
          ) : !technicians.length ? (
            <EmptyState title="Belum ada teknisi" description="Teknisi yang dibuat akan muncul di tabel ini." />
          ) : !filteredTechnicians.length ? (
            <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci atau filter area." />
          ) : (
            <table className="w-full min-w-[1120px] table-fixed divide-y divide-slate-200 text-left text-sm">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[17%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className={thClass}>Nama</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Nomor HP</th>
                  <th className={thClass}>Area kerja</th>
                  <th className={thClass}>Alamat</th>
                  <th className={thClass}>Koordinat</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Tanggal dibuat</th>
                  <th className={thClass}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTechnicians.map((technician) => (
                  <tr key={technician.id || technician.email} className="align-top">
                    <td className={tdClass}>
                      <p className="font-semibold text-slate-950">{technician.nama || '-'}</p>
                    </td>
                    <td className={breakAllTdClass}>{technician.email || '-'}</td>
                    <td className={tdClass}>{technician.noHp || '-'}</td>
                    <td className={tdClass}>{technician.areaKerja || '-'}</td>
                    <td className={tdClass}>{technician.alamat || '-'}</td>
                    <td className={breakAllTdClass}>{formatCoordinate(technician.latitude, technician.longitude)}</td>
                    <td className={nowrapTdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          technician.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {technician.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className={tdClass}>{formatDate(technician.createdAt)}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openEditModal(technician)} className={tableButtonClass}>
                          Edit
                        </button>
                        <button onClick={() => openResetModal(technician)} className={tableButtonClass}>
                          Reset
                        </button>
                        <button onClick={() => openDeleteModal(technician)} className={dangerButtonClass}>
                          Nonaktifkan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {createOpen && (
        <TechnicianModal
          title="Tambah Teknisi"
          submitLabel="Simpan Teknisi"
          form={form}
          includePassword
          loading={createMutation.loading}
          onChange={handleFormChange}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editOpen && (
        <TechnicianModal
          title="Edit Teknisi"
          submitLabel="Simpan Perubahan"
          form={form}
          loading={updateMutation.loading}
          onChange={handleFormChange}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}

      {resetOpen && (
        <Modal title={`Reset Password ${selectedTechnician?.nama || 'Teknisi'}`} onClose={() => setResetOpen(false)}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Field label="Password baru">
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className={inputClass}
                minLength={8}
                required
              />
            </Field>
            <Field label="Konfirmasi password baru">
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className={inputClass}
                minLength={8}
                required
              />
            </Field>
            <ModalActions loading={resetPasswordMutation.loading} submitLabel="Reset Password" onCancel={() => setResetOpen(false)} />
          </form>
        </Modal>
      )}

      {deleteOpen && (
        <Modal title="Nonaktifkan Teknisi" onClose={() => setDeleteOpen(false)}>
          <p className="text-sm leading-6 text-slate-600">
            Akun <span className="font-semibold text-slate-950">{selectedTechnician?.nama || '-'}</span> akan
            dinonaktifkan dan tidak muncul lagi pada daftar teknisi aktif.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setDeleteOpen(false)} className={secondaryButtonClass} disabled={isSubmitting}>
              Batal
            </button>
            <button onClick={handleDisable} className={dangerSolidButtonClass} disabled={disableMutation.loading}>
              {disableMutation.loading ? 'Memproses...' : 'Nonaktifkan'}
            </button>
          </div>
        </Modal>
      )}

      {temporaryPassword && (
        <Modal title="Password Sementara" onClose={() => setTemporaryPassword(null)}>
          <p className="text-sm text-slate-600">Catat password sementara ini. Password hanya ditampilkan sekali.</p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-mono text-lg font-semibold text-amber-900">
            {temporaryPassword}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setTemporaryPassword(null)} className={primaryButtonClass}>
              Selesai
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TechnicianModal({ title, submitLabel, form, includePassword = false, loading, onChange, onClose, onSubmit }) {
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama">
            <input name="nama" value={form.nama} onChange={onChange} className={inputClass} required />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={form.email} onChange={onChange} className={inputClass} required />
          </Field>
        </div>
        {includePassword && (
          <Field label="Password">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className={inputClass}
              placeholder="Kosongkan untuk password sementara"
            />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor HP">
            <input name="noHp" value={form.noHp} onChange={onChange} className={inputClass} placeholder="08..." />
          </Field>
          <Field label="Area kerja">
            <input name="areaKerja" value={form.areaKerja} onChange={onChange} className={inputClass} />
          </Field>
        </div>
        <Field label="Alamat">
          <textarea name="alamat" value={form.alamat} onChange={onChange} rows="3" className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude">
            <input name="latitude" value={form.latitude} onChange={onChange} className={inputClass} placeholder="-6.2" />
          </Field>
          <Field label="Longitude">
            <input name="longitude" value={form.longitude} onChange={onChange} className={inputClass} placeholder="106.8" />
          </Field>
        </div>
        <ModalActions loading={loading} submitLabel={submitLabel} onCancel={onClose} />
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ loading, submitLabel, onCancel }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className={secondaryButtonClass} disabled={loading}>
        Batal
      </button>
      <button type="submit" className={primaryButtonClass} disabled={loading}>
        {loading ? 'Menyimpan...' : submitLabel}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ title, description, tone = 'default' }) {
  const color = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600';
  return (
    <div className={`rounded-xl border p-6 text-center ${color}`}>
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

  return <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${className}`}>{children}</p>;
}

function formatCoordinate(latitude, longitude) {
  if (latitude === '' || longitude === '' || latitude === null || longitude === null) return '-';
  return `${latitude}, ${longitude}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

const controlClass =
  'h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';
const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';
const primaryButtonClass =
  'h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70';
const secondaryButtonClass =
  'h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70';
const tableButtonClass =
  'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50';
const dangerButtonClass =
  'rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50';
const dangerSolidButtonClass =
  'h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70';
const thClass = 'px-3 py-3 font-semibold whitespace-normal break-words';
const tdClass = 'whitespace-normal break-words px-3 py-3 leading-6 text-slate-700';
const breakAllTdClass = 'whitespace-normal break-all px-3 py-3 leading-6 text-slate-700';
const nowrapTdClass = 'whitespace-nowrap px-3 py-3 text-slate-700';
