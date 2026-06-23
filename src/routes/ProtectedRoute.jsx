import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Melindungi routes yang memerlukan autentikasi
 * Opsional: validasi role-based access
 */
export default function ProtectedRoute({ children, requiredRoles = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Jika masih loading, tampilkan loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Jika tidak terautentikasi, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada role yang diminta, cek apakah user memiliki role tersebut
  if (requiredRoles) {
    const hasRequiredRole = requiredRoles.some((role) => {
      if (!user?.roles) return false;
      // SUPER_ADMIN memiliki semua akses ADMIN
      if (role === 'ADMIN' && user.roles.includes('SUPER_ADMIN')) {
        return true;
      }
      return user.roles.includes(role);
    });

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">403</h1>
            <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman ini</p>
            <a 
              href="/" 
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Kembali ke Home
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
}
