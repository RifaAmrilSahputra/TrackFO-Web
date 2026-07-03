import { useMemo, useState } from 'react';
import { issueAPI, userAPI } from '../../services/apiClient';
import { useFetch, useMutation } from '../../hooks/useAPI';
import { useAuth } from '../../context/AuthContext';

const statusStyles = {
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  assigned: 'border-blue-200 bg-blue-50 text-blue-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  on_progress: 'border-blue-200 bg-blue-50 text-blue-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function AssignmentsPage() {
  const { data, loading, error, refetch } = useFetch(issueAPI.getAll);
  const createAssignment = useMutation((payload) => issueAPI.assignTechnician(payload.issueId, payload.body));
  const technicianRequest = useMutation((params) => userAPI.getTechnicians(params));
  const auth = useAuth();

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [method, setMethod] = useState('auto');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
  const [leaderId, setLeaderId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [search, setSearch] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  const issues = useMemo(() => data?.data || [], [data]);

  const summary = useMemo(() => {
    const assignmentCount = issues.reduce((total, issue) => total + (issue.assignments?.length || 0), 0);
    const unassigned = issues.filter((issue) => !issue.assignments?.length).length;
    const accepted = issues.reduce(
      (total, issue) => total + (issue.assignments || []).filter((assignment) => normalize(assignment.status || 'assigned') === 'accepted').length,
      0,
    );

    return [
      { label: 'Issue Aktif', value: issues.length, detail: 'Gangguan tersedia', tone: 'bg-slate-950' },
      { label: 'Assignment', value: assignmentCount, detail: 'Teknisi ditugaskan', tone: 'bg-blue-500' },
      { label: 'Belum Assigned', value: unassigned, detail: 'Perlu penugasan', tone: 'bg-amber-500' },
      { label: 'Accepted', value: accepted, detail: 'Diterima teknisi', tone: 'bg-emerald-500' },
    ];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const assignments = issue.assignments || [];
      const title = issue.judul || issue.title || '';
      const description = issue.deskripsi || issue.description || '';
      const issueStatus = issue.status || 'unknown';
      const technicianNames = assignments
        .map((assignment) => assignment.teknisi?.user?.name || assignment.teknisi?.user?.username || assignment.teknisiId || '')
        .join(' ');
      const searchable = `${issue.id} ${title} ${description} ${issueStatus} ${technicianNames}`.toLowerCase();

      const matchesSearch = !keyword || searchable.includes(keyword);
      const matchesAssignment =
        assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && assignments.length > 0) ||
        (assignmentFilter === 'unassigned' && assignments.length === 0);

      return matchesSearch && matchesAssignment;
    });
  }, [assignmentFilter, issues, search]);

  const resetAssignmentState = () => {
    setSelectedIssue(null);
    setMethod('auto');
    setTechnicians([]);
    setSelectedTechnicianIds([]);
    setLeaderId(null);
    createAssignment.reset();
    technicianRequest.reset();
  };

  const openAssignmentModal = (issue) => {
    resetAssignmentState();
    setSelectedIssue(issue);
    setMessage('');
  };

  const handleMethodChange = async (nextMethod) => {
    setMethod(nextMethod);
    setSelectedTechnicianIds([]);
    setLeaderId(null);
    createAssignment.reset();

    if (nextMethod === 'auto') {
      setTechnicians([]);
      technicianRequest.reset();
      return;
    }

    try {
      const response = await technicianRequest.mutate({ area: selectedIssue.area });
      setTechnicians(getCollection(response));
    } catch {
      setTechnicians([]);
    }
  };

  const toggleTechnician = (technicianId) => {
    setSelectedTechnicianIds((currentIds) => {
      const isSelected = currentIds.includes(technicianId);
      const nextIds = isSelected ? currentIds.filter((id) => id !== technicianId) : [...currentIds, technicianId];

      if (nextIds.length <= 1) {
        setLeaderId(null);
      } else if (!nextIds.includes(leaderId)) {
        setLeaderId(nextIds[0]);
      }

      return nextIds;
    });
  };

  const handleCreateAssignment = async () => {
    const body = { method };

    if (method === 'manual') {
      body.teknisiIds = selectedTechnicianIds;
      if (selectedTechnicianIds.length > 1) body.leaderId = leaderId;
    }

    try {
      await createAssignment.mutate({ issueId: selectedIssue.id, body });
      resetAssignmentState();
      setMessageType('success');
      setMessage('Assignment berhasil dibuat.');
      refetch();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Gagal membuat assignment.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setMessage('');

    try {
      await issueAPI.updateAssignmentStatus(id, status);
      setMessageType('success');
      setMessage('Status assignment berhasil diperbarui.');
      refetch();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Gagal memperbarui status assignment.');
    }
  };

  return (
    <div className="max-w-full space-y-6 overflow-hidden">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-0 gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              Workforce
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Kelola Assignment</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Atur penugasan teknisi, lihat issue yang belum mendapat tim, dan pantau respons assignment dari satu halaman.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Coverage assignment</p>
            <p className="mt-3 text-4xl font-semibold">{summary[1].value}</p>
            <p className="mt-2 text-sm text-slate-400">{summary[2].value} issue masih perlu teknisi.</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      {message && <Alert tone={messageType}>{message}</Alert>}

      <div className="min-w-0">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-950">Daftar Gangguan & Assignment</h3>
              <p className="mt-1 text-sm text-slate-500">
                {filteredIssues.length} dari {issues.length} issue ditampilkan.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari issue, teknisi, status..."
                className={controlClass}
              />
              <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} className={controlClass}>
                <option value="all">Semua issue</option>
                <option value="assigned">Sudah assigned</option>
                <option value="unassigned">Belum assigned</option>
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
              <EmptyState title="Memuat assignment..." description="Data issue dan penugasan sedang diambil." />
            ) : error ? (
              <EmptyState title="Gagal memuat assignment" description={error.message || 'Terjadi kesalahan saat memuat data.'} tone="error" />
            ) : !issues.length ? (
              <EmptyState title="Belum ada issue" description="Issue yang tersedia untuk assignment akan muncul di sini." />
            ) : !filteredIssues.length ? (
              <EmptyState title="Tidak ada hasil" description="Coba ubah kata kunci atau filter assignment." />
            ) : (
              <div className="min-w-0 space-y-4">
                {filteredIssues.map((issue) => (
                  <IssueAssignmentCard
                    key={issue.id}
                    issue={issue}
                    auth={auth}
                    onAssign={openAssignmentModal}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedIssue && (
        <AssignmentModal
          issue={selectedIssue}
          method={method}
          technicians={technicians}
          selectedTechnicianIds={selectedTechnicianIds}
          leaderId={leaderId}
          loadingTechnicians={technicianRequest.loading}
          technicianError={technicianRequest.error}
          creating={createAssignment.loading}
          createError={createAssignment.error}
          onMethodChange={handleMethodChange}
          onToggleTechnician={toggleTechnician}
          onLeaderChange={setLeaderId}
          onClose={resetAssignmentState}
          onSubmit={handleCreateAssignment}
        />
      )}
    </div>
  );
}

const controlClass =
  'h-10 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';

function IssueAssignmentCard({ issue, auth, onAssign, onStatusUpdate }) {
  const assignments = issue.assignments || [];
  const title = issue.judul || issue.title || 'Tanpa judul';
  const description = issue.deskripsi || issue.description || 'Tidak ada deskripsi.';

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">ID {issue.id}</span>
            <Badge value={issue.status || 'unknown'} />
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              {assignments.length} assignment
            </span>
          </div>
          <h4 className="mt-3 text-base font-semibold text-slate-950">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onAssign(issue)}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Assign
        </button>
      </div>

      {assignments.length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {assignments.map((assignment) => (
            <AssignmentRow key={assignment.id} assignment={assignment} auth={auth} onStatusUpdate={onStatusUpdate} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          Belum ada assignment untuk issue ini.
        </div>
      )}
    </article>
  );
}

function AssignmentModal({
  issue,
  method,
  technicians,
  selectedTechnicianIds,
  leaderId,
  loadingTechnicians,
  technicianError,
  creating,
  createError,
  onMethodChange,
  onToggleTechnician,
  onLeaderChange,
  onClose,
  onSubmit,
}) {
  const title = issue.judul || issue.title || 'Tanpa judul';
  const address = issue.alamat || issue.address || 'Alamat belum tersedia';
  const priority = issue.priority || 'standar';
  const manualReady = selectedTechnicianIds.length > 0 && (selectedTechnicianIds.length === 1 || leaderId);
  const submitDisabled = creating || loadingTechnicians || (method === 'manual' && !manualReady);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Buat Assignment</p>
            <h3 id="assignment-modal-title" className="mt-1 text-xl font-semibold text-slate-950">
              Pilih teknisi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            aria-label="Tutup modal"
            className="rounded-lg px-2.5 py-1.5 text-xl leading-none text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">ID {issue.id}</span>
            <Badge value={issue.status || 'unknown'} />
            <Badge value={priority} />
          </div>
          <h4 className="mt-3 font-semibold text-slate-950">{title}</h4>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <Meta label="Area" value={issue.area || '-'} />
            <Meta label="Alamat" value={address} />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">Metode assignment</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MethodOption
              checked={method === 'auto'}
              title="Auto Assignment"
              description="Backend memilih teknisi terdekat."
              onChange={() => onMethodChange('auto')}
            />
            <MethodOption
              checked={method === 'manual'}
              title="Manual Assignment"
              description="Pilih satu atau beberapa teknisi."
              onChange={() => onMethodChange('manual')}
            />
          </div>
        </fieldset>

        <div className="mt-5">
          {method === 'auto' ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Teknisi available terdekat akan dipilih otomatis.
            </div>
          ) : loadingTechnicians ? (
            <EmptyState title="Memuat teknisi..." description={`Mencari teknisi untuk area ${issue.area || '-'}.`} />
          ) : technicianError ? (
            <EmptyState
              title="Gagal memuat teknisi"
              description={technicianError.message || 'Terjadi kesalahan saat mengambil daftar teknisi.'}
              tone="error"
            />
          ) : technicians.length ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">Teknisi di area {issue.area || '-'}</p>
                <p className="text-xs text-slate-500">{selectedTechnicianIds.length} dipilih</p>
              </div>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                {technicians.map((technician) => (
                  <TechnicianOption
                    key={technician.id}
                    technician={technician}
                    selected={selectedTechnicianIds.includes(technician.id)}
                    showLeader={selectedTechnicianIds.length > 1 && selectedTechnicianIds.includes(technician.id)}
                    isLeader={leaderId === technician.id}
                    onToggle={() => onToggleTechnician(technician.id)}
                    onLeaderChange={() => onLeaderChange(technician.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="Teknisi tidak ditemukan" description={`Belum ada teknisi untuk area ${issue.area || '-'}.`} />
          )}
        </div>

        {createError && <div className="mt-4"><Alert tone="error">{createError.message}</Alert></div>}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Menugaskan...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MethodOption({ checked, title, description, onChange }) {
  return (
    <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
      <input type="radio" name="assignment-method" checked={checked} onChange={onChange} className="mt-1 accent-blue-600" />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
    </label>
  );
}

function TechnicianOption({ technician, selected, showLeader, isLeader, onToggle, onLeaderChange }) {
  const status = normalize(technician.status || 'off');
  const selectable = status === 'available';
  const statusTone =
    status === 'available' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${selectable ? 'border-slate-200' : 'border-slate-100 bg-slate-50'}`}>
      <input
        type="checkbox"
        checked={selected}
        disabled={!selectable}
        onChange={onToggle}
        aria-label={`Pilih ${technician.nama || technician.name || `teknisi ${technician.id}`}`}
        className="h-4 w-4 shrink-0 accent-blue-600 disabled:cursor-not-allowed"
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${selectable ? 'text-slate-950' : 'text-slate-500'}`}>
          {technician.nama || technician.name || `Teknisi ${technician.id}`}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${statusTone}`} />
          <span className="capitalize">{formatLabel(technician.status || 'off')}</span>
          {technician.areaKerja && <span>• {technician.areaKerja}</span>}
        </div>
      </div>
      {showLeader && (
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="radio"
            name="assignment-leader"
            checked={isLeader}
            onChange={onLeaderChange}
            className="accent-blue-600"
          />
          Leader
        </label>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-700">{value}</p>
    </div>
  );
}

function AssignmentRow({ assignment, auth, onStatusUpdate }) {
  const technician = assignment.teknisi?.user?.nama || assignment.teknisi?.user?.name || assignment.teknisi?.user?.username || assignment.teknisiId || 'N/A';
  const status = assignment.status || 'assigned';
  const canManage = canManageAssignment(auth, assignment);

  return (
    <div className="grid min-w-0 gap-3 rounded-xl bg-slate-50 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0 text-sm">
        <p className="truncate font-semibold text-slate-950">Teknisi: {technician}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge value={status} />
          {assignment.leaderId && (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
              Leader {assignment.leaderId}
            </span>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="flex flex-wrap gap-2 md:justify-end">
          <button
            onClick={() => onStatusUpdate(assignment.id, 'accepted')}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Terima
          </button>
          <button
            onClick={() => onStatusUpdate(assignment.id, 'rejected')}
            className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            Tolak
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500 md:text-right">Menunggu aksi teknisi.</p>
      )}
    </div>
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

function canManageAssignment(auth, assignment) {
  const { user, hasRole } = auth;
  const isTechnician = hasRole && hasRole('TEKNISI');
  const userId = user?.id;
  const assignedTeknisiId = assignment.teknisiId || assignment.teknisi?.id || assignment.teknisi?.user?.id;

  return Boolean(isTechnician && userId && assignedTeknisiId && Number(userId) === Number(assignedTeknisiId));
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '_');
}

function formatLabel(value) {
  return String(value || 'Unknown').replace(/_/g, ' ');
}

function getCollection(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}
