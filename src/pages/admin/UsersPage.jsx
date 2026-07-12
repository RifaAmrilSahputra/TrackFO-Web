import { useMemo, useState } from 'react';
import { authAPI, userAPI } from '../../services/apiClient';
import { useFetch, useMutation } from '../../hooks/useAPI';

const emptyForm = {
  nama: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'TEKNISI',
  noHp: '',
  areaKerja: '',
  alamat: '',
  latitude: '',
  longitude: '',
};

const emptyPasswordForm = { newPassword: '', confirmPassword: '' };

function normalizeUser(user) {
  const profile = user.teknisi || user.technician || {};
  const userSource = user.user || {};
  const nama = user.nama || user.name || userSource.nama || userSource.name || '';
  const email = user.email || userSource.email || '';
  const noHp =
    profile.noHp ||
    profile.no_hp ||
    profile.phone ||
    user.noHp ||
    user.no_hp ||
    user.phone ||
    userSource.noHp ||
    userSource.no_hp ||
    userSource.phone ||
    '';
  const areaKerja =
    profile.areaKerja ||
    profile.area_kerja ||
    user.areaKerja ||
    user.area_kerja ||
    user.area ||
    userSource.areaKerja ||
    userSource.area_kerja ||
    '';
  const alamat = profile.alamat || user.alamat || user.address || userSource.alamat || '';
  const latitude = profile.latitude ?? user.latitude ?? userSource.latitude ?? '';
  const longitude = profile.longitude ?? user.longitude ?? userSource.longitude ?? '';

  return {
    ...user,
    nama,
    email,
    noHp,
    areaKerja,
    alamat,
    latitude,
    longitude,
    isActive: user.isActive ?? userSource.isActive ?? true,
    createdAt: user.createdAt || userSource.createdAt || '',
    role: (user.roles && user.roles[0]) || user.role || 'TEKNISI',
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
  if (includePassword && form.password && form.password !== form.confirmPassword) return 'Konfirmasi password tidak sama.';
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

  if (form.role) {
    payload.roles = [form.role];
  }

  if (mode === 'create' && form.password) {
    payload.password = form.password;
  }

  return payload;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('admins');
  const {
    data: adminData,
    loading: loadingAdmins,
    error: adminError,
    refetch: refetchAdmins,
  } = useFetch(userAPI.getAdmins);
  const {
    data: technicianData,
    loading: loadingTechnicians,
    error: technicianError,
    refetch: refetchTechnicians,
  } = useFetch(userAPI.getTechnicians);
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const users = useMemo(() => {
    const raw = activeTab === 'admins' ? (adminData?.data || adminData || []) : (technicianData?.data || technicianData || []);
    return raw.map(normalizeUser);
  }, [activeTab, adminData, technicianData]);

  const loading = activeTab === 'admins' ? loadingAdmins : loadingTechnicians;
  const error = activeTab === 'admins' ? adminError : technicianError;
  const refetchCurrent = activeTab === 'admins' ? refetchAdmins : refetchTechnicians;

  const areas = useMemo(() => {
    const values = users.map((item) => item.areaKerja).filter(Boolean);
    return [...new Set(values)];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((item) => {
      const searchable = [
        item.nama,
        item.email,
        item.noHp,
        item.areaKerja,
        item.alamat,
      ]
        .join(' ')
        .toLowerCase();

      return (!keyword || searchable.includes(keyword)) && (areaFilter === 'all' || item.areaKerja === areaFilter);
    });
  }, [areaFilter, search, users]);

  const summary = useMemo(() => {
    const active = users.filter((item) => item.isActive).length;
    const withCoordinate = users.filter((item) => item.latitude !== '' && item.longitude !== '').length;

    return [
      { label: activeTab === 'admins' ? 'Total Admin' : 'Total Teknisi', value: users.length },
      { label: 'Aktif', value: active },
      { label: 'Area Kerja', value: areas.length },
      { label: 'Koordinat', value: withCoordinate },
    ];
  }, [activeTab, areas.length, users]);

  const isSubmitting =
    createMutation.loading || updateMutation.loading || resetPasswordMutation.loading || disableMutation.loading;

  const openCreateModal = () => {
    setForm({ ...emptyForm, role: activeTab === 'admins' ? 'ADMIN' : 'TEKNISI' });
    setCreateOpen(true);
    setFormError(null);
    setToast(null);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      nama: user.nama || '',
      email: user.email || '',
      role: user.role || (activeTab === 'admins' ? 'ADMIN' : 'TEKNISI'),
      password: '',
      confirmPassword: '',
      noHp: user.noHp || '',
      areaKerja: user.areaKerja || '',
      alamat: user.alamat || '',
      latitude: user.latitude ?? '',
      longitude: user.longitude ?? '',
    });
    setEditOpen(true);
    setFormError(null);
    setToast(null);
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setPasswordForm(emptyPasswordForm);
    setResetOpen(true);
    setToast(null);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
    setToast(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const validationError = validateTechnicianForm(form, true);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const response = await createMutation.mutate(buildPayload(form, 'create'));
      setCreateOpen(false);
      setForm({ ...emptyForm, role: activeTab === 'admins' ? 'ADMIN' : 'TEKNISI' });
      setToast({ tone: 'success', message: getResponseMessage(response, 'User berhasil dibuat.') });
      if (response?.temporaryPassword) setTemporaryPassword(response.temporaryPassword);
      refetchCurrent();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal membuat user.' });
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const validationError = validateTechnicianForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const response = await updateMutation.mutate(selectedUser.id, buildPayload(form));
      setEditOpen(false);
      setSelectedUser(null);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Data user berhasil diperbarui.') });
      refetchCurrent();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal memperbarui user.' });
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
      const response = await resetPasswordMutation.mutate(selectedUser.id, passwordForm.newPassword);
      setResetOpen(false);
      setPasswordForm(emptyPasswordForm);
      setToast({ tone: 'success', message: getResponseMessage(response, 'Password user berhasil direset.') });
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal reset password user.' });
    }
  };

  const handleDisable = async () => {
    try {
      const response = await disableMutation.mutate(selectedUser.id);
      setDeleteOpen(false);
      setSelectedUser(null);
      setToast({ tone: 'success', message: getResponseMessage(response, 'User berhasil dinonaktifkan.') });
      refetchCurrent();
    } catch (err) {
      setToast({ tone: 'error', message: err?.message || 'Gagal menonaktifkan user.' });
    }
  };

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Super Admin</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              Manajemen {activeTab === 'admins' ? 'Admin' : 'Teknisi'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola akun {activeTab === 'admins' ? 'ADMIN/SUPER_ADMIN' : 'TEKNISI'}, area kerja, reset password, dan status akun.
            </p>
          </div>
          <button onClick={openCreateModal} className={primaryButtonClass}>
            Tambah {activeTab === 'admins' ? 'Admin' : 'Teknisi'}
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'admins'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Admins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('technicians')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'technicians'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Technicians
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
          <button onClick={refetchCurrent} className={secondaryButtonClass}>
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <EmptyState
              title={`Memuat ${activeTab === 'admins' ? 'admin' : 'teknisi'}...`}
              description={`Data ${activeTab === 'admins' ? 'admin' : 'teknisi'} sedang diambil dari server.`}
            />
          ) : error ? (
            <EmptyState
              title={error.statusCode === 403 ? 'Akses ditolak' : `Gagal memuat ${activeTab === 'admins' ? 'admin' : 'teknisi'}`}
              description={error.message || 'Terjadi kesalahan saat memuat data.'}
              tone="error"
            />
          ) : !users.length ? (
            <EmptyState
              title={`Belum ada ${activeTab === 'admins' ? 'admin' : 'teknisi'}`}
              description={`${activeTab === 'admins' ? 'Admin' : 'Teknisi'} yang dibuat akan muncul di tabel ini.`}
            />
          ) : !filteredUsers.length ? (
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
                {filteredUsers.map((user) => (
                  <tr key={user.id || user.email} className="align-top">
                    <td className={tdClass}>
                      <p className="font-semibold text-slate-950">{user.nama || '-'}</p>
                    </td>
                    <td className={breakAllTdClass}>{user.email || '-'}</td>
                    <td className={tdClass}>{user.noHp || '-'}</td>
                    <td className={tdClass}>{user.areaKerja || '-'}</td>
                    <td className={tdClass}>{user.alamat || '-'}</td>
                    <td className={breakAllTdClass}>{formatCoordinate(user.latitude, user.longitude)}</td>
                    <td className={nowrapTdClass}>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className={tdClass}>{formatDate(user.createdAt)}</td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openEditModal(user)} className={tableButtonClass}>
                          Edit
                        </button>
                        <button onClick={() => openResetModal(user)} className={tableButtonClass}>
                          Reset
                        </button>
                        <button onClick={() => openDeleteModal(user)} className={dangerButtonClass}>
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
        <UserModal
          title={`Tambah ${activeTab === 'admins' ? 'Admin' : 'Teknisi'}`}
          submitLabel={`Simpan ${activeTab === 'admins' ? 'Admin' : 'Teknisi'}`}
          form={form}
          includePassword
          loading={createMutation.loading}
          formError={formError}
          onChange={handleFormChange}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editOpen && (
        <UserModal
          title={`Edit ${activeTab === 'admins' ? 'Admin' : 'Teknisi'}`}
          submitLabel="Simpan Perubahan"
          form={form}
          loading={updateMutation.loading}
          formError={formError}
          onChange={handleFormChange}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      )}

      {resetOpen && (
        <Modal title={`Reset Password ${selectedUser?.nama || 'User'}`} onClose={() => setResetOpen(false)}>
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
        <Modal title={`Nonaktifkan ${activeTab === 'admins' ? 'Admin' : 'Teknisi'}`} onClose={() => setDeleteOpen(false)}>
          <p className="text-sm leading-6 text-slate-600">
            Akun <span className="font-semibold text-slate-950">{selectedUser?.nama || '-'}</span> akan
            dinonaktifkan dan tidak muncul lagi pada daftar {activeTab === 'admins' ? 'admin' : 'teknisi'} aktif.
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

function UserModal({ title, submitLabel, form, includePassword = false, loading, formError, onChange, onClose, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);
  const roleOptions = [
    { value: 'TEKNISI', label: 'Teknisi' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
  ];

  const passwordError = includePassword
    ? form.password && form.password.length > 0 && form.password.length < 8
      ? 'Password minimal 8 karakter.'
      : form.confirmPassword && form.password !== form.confirmPassword
      ? 'Konfirmasi password tidak sama.'
      : ''
    : '';

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama">
            <input name="nama" value={form.nama} onChange={onChange} className={inputClass} required />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={form.email} onChange={onChange} className={inputClass} required />
          </Field>
        </div>
        {includePassword && (
          <>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className={`${inputClass} pr-24`}
                  placeholder="Kosongkan untuk password sementara"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
            <Field label="Konfirmasi Password">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                className={inputClass}
                placeholder="Ulangi password"
              />
              {passwordError && <p className="mt-2 text-sm text-rose-600">{passwordError}</p>}
            </Field>
          </>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role">
            <select name="role" value={form.role} onChange={onChange} className={inputClass}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nomor HP">
            <input name="noHp" value={form.noHp} onChange={onChange} className={inputClass} placeholder="08..." />
          </Field>
        </div>
        {(form.role === 'TEKNISI' || !form.role) && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Area kerja">
                <input name="areaKerja" value={form.areaKerja} onChange={onChange} className={inputClass} />
              </Field>
              <Field label="Alamat">
                <textarea name="alamat" value={form.alamat} onChange={onChange} rows="3" className={inputClass} />
              </Field>
            </div>
          </>
        )}
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
