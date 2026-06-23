import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from './DashboardLayout';
import SuperAdminDashboard from '../pages/admin/SuperAdminDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import IssuesPage from '../pages/admin/IssuesPage';
import AssignmentsPage from '../pages/admin/AssignmentsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import TrackingPage from '../pages/admin/TrackingPage';
import UsersPage from '../pages/admin/UsersPage';

function RedirectToDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roles?.includes('SUPER_ADMIN')) {
    return <Navigate to="/super-admin/dashboard" replace state={{ from: location }} />;
  }

  if (user.roles?.includes('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace state={{ from: location }} />;
  }

  return <Navigate to="/login" replace state={{ from: location }} />;
}

/**
 * AppRoutes Component
 * Mengelola semua routes di aplikasi
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
            <DashboardLayout role="SUPER_ADMIN" />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <DashboardLayout role="ADMIN" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="tracking" element={<TrackingPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RedirectToDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <RedirectToDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
