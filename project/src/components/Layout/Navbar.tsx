import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Target,
  Lightbulb,
  Settings,
  LogOut,
  Shield,
  Home,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { profile, signOut, user } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'inicio', icon: Home, label: t('nav.home') },
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'devices', icon: Cpu, label: t('nav.devices') },
    { id: 'consumption', icon: BarChart3, label: t('nav.consumption') },
    { id: 'goals', icon: Target, label: t('nav.goals') },
    { id: 'recommendations', icon: Lightbulb, label: t('nav.recommendations') },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ id: 'admin', icon: Shield, label: t('nav.admin') });
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <button
                type="button"
                onClick={() => onNavigate('inicio')}
                className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md hover:opacity-90"
                aria-label={t('nav.home')}
              >
                {t('app.title')}
              </button>
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('settings')}
                  className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentView === 'settings'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={t('nav.settings')}
                >
                  <Settings className="w-5 h-5" aria-hidden="true" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {t('auth.signin')}
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50"
                >
                  {t('auth.signup')}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}

            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    currentView === 'settings'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" aria-hidden="true" />
                  {t('nav.settings')}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium bg-emerald-600 text-white"
                >
                  {t('auth.signin')}
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-emerald-600 border border-emerald-100"
                >
                  {t('auth.signup')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
