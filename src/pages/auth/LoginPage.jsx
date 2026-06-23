import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    clearError();

    if (!formData.email || !formData.password) {
      setFormError('Email dan password harus diisi.');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Format email tidak valid.');
      return;
    }

    try {
      const response = await login(formData.email, formData.password);

      // Pastikan pesan sukses tidak tercampur dengan error backend sebelumnya.
      setFormError('');
      setSuccessMessage('Login berhasil. Mengarahkan Anda...');

      const roles = response.data.user.roles;
      const destination = roles.includes('SUPER_ADMIN')
        ? '/super-admin/dashboard'
        : roles.includes('ADMIN')
        ? '/admin/dashboard'
        : '/login';

      setTimeout(() => {
        navigate(destination);
      }, 600);
    } catch (err) {
      // Perjelas pesan gagal supaya user paham apakah email/password yang salah.
      const backendMessage = err.response?.data?.message || err.message;
      const messageLower = String(backendMessage).toLowerCase();
      const isAuthError =
        messageLower.includes('invalid') ||
        messageLower.includes('wrong') ||
        messageLower.includes('unauthorized') ||
        messageLower.includes('password') ||
        messageLower.includes('email');

      if (isAuthError) {
        setFormError('Email atau password salah. Periksa kembali lalu coba lagi.');
      } else {
        setFormError(backendMessage || 'Login gagal. Periksa kembali email dan password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-[24px] bg-white p-2">
          <div className="px-6 pb-6 pt-2">
            <div className="mb-2 text-center">
              <div className="text-3xl font-bold text-blue-600">TrackFO</div>
              <div className="mt-1 text-slate-600">Login</div>
            </div>

            {(formError || error || successMessage) && (
              <div
                className={`mb-5 rounded-2xl border p-4 text-sm ${
                  successMessage
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
                role="status"
                aria-live="polite"
              >
                <p>{successMessage || formError || error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-500 hover:text-slate-700 transition"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      // eye-off
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5.52 0-10-4.48-10-10 0-1.83.49-3.54 1.34-5" />
                        <path d="M1.5 1.5l21 21" />
                        <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                        <path d="M10.73 5.08A10.03 10.03 0 0 1 12 4c5.52 0 10 4.48 10 10 0 1.12-.18 2.2-.51 3.22" />
                        <path d="M14.12 14.12A3 3 0 0 0 9.88 9.88" />
                      </svg>
                    ) : (
                      // eye
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              © 2026 TrackFO. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
