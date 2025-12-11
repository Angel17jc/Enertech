import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import Devices from './components/Devices/Devices';
import Consumption from './components/Consumption/Consumption';
import Goals from './components/Goals/Goals';
import Recommendations from './components/Recommendations/Recommendations';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import Admin from './components/Admin/Admin';
import Feedback from './components/Feedback/Feedback';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import AccessibilityPanel from './components/Layout/AccessibilityPanel';
import WelcomePanel from './components/Layout/WelcomePanel';
import SupportChat from './components/Layout/SupportChat';

function AppContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('inicio');

  useEffect(() => {
    // cuando el usuario se autentica, navegamos automáticamente a la vista inicio
    if (user) {
      setCurrentView('inicio');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'inicio':
        return <WelcomePanel onNavigate={setCurrentView} />;
      case 'login':
        return <SignIn onToggle={() => setCurrentView('signup')} />;
      case 'signup':
        return <SignUp onToggle={() => setCurrentView('login')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <Devices />;
      case 'consumption':
        return <Consumption />;
      case 'goals':
        return <Goals />;
      case 'recommendations':
        return <Recommendations />;
      case 'settings':
        return <Profile />;
      case 'admin':
        return <Admin />;
      case 'feedback':
        return <Feedback />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}

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
  // Ahora el panel de accesibilidad se muestra siempre (incluye su propia pestaña flotante)
  return (
    <>
      <AppContent />
      <AccessibilityPanel />
      <SupportChat />
    </>
  );
}
