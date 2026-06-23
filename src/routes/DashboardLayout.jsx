import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ role = 'ADMIN' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin';

  const navLinks = [
    { to: '', label: 'Dashboard' },
    { to: 'issues', label: 'Gangguan' },
    { to: 'assignments', label: 'Assignments' },
    { to: 'reports', label: 'Laporan' },
    { to: 'tracking', label: 'Tracking' },
  ];

  if (role === 'SUPER_ADMIN') {
    navLinks.push({ to: 'users', label: 'User Management' });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">TrackFO</h1>
            <p className="text-sm text-slate-500">{roleLabel} Portal</p>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
            <div className="min-w-0 text-sm text-slate-600 sm:text-right">
              <p className="truncate font-medium text-slate-900">{user?.nama || user?.name || 'Pengguna'}</p>
              <p className="truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-xl bg-rose-500 px-4 py-2 text-white transition hover:bg-rose-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:self-start">
          <div className="max-h-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Menu</p>
            <nav className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === ''}
                  className={({ isActive }) =>
                    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
