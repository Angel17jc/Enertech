import { ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import Devices from './components/Devices/Devices';
import Consumption from './components/Consumption/Consumption';
import Recommendations from './components/Recommendations/Recommendations';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
import AccessibilityPanel from './components/Layout/AccessibilityPanel';
import WelcomePanel from './components/Layout/WelcomePanel';
import SupportChat from './components/Layout/SupportChat';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AppWithAccessibility />
          </AccessibilityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppWithAccessibility() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<WelcomePanel />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
          <Route path="consumption" element={<ProtectedRoute><Consumption /></ProtectedRoute>} />
          <Route path="recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="goals" element={<Navigate to="/recommendations" replace />} />
          <Route path="feedback" element={<Navigate to="/recommendations" replace />} />
          <Route path="admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="inicio" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/login" element={<PublicOnlyRoute><SignIn /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AccessibilityPanel />
      <SupportChat />
    </>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function FullScreenLoader() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
        {t('common.loading')}
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { user, loading, profile } = useAuth();

  // Evita flash en navegación: si ya hay user, no muestres loader
  if (loading && user) {
    return <>{children}</>;
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Evita flash en navegación para usuarios ya autenticados
  if (loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
