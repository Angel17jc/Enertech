import { useEffect, useMemo, useRef, useState, ElementType, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Target,
  Lightbulb,
  User,
  LogOut,
  Shield,
  Home,
  Menu,
  X,
  MessageSquare,
  Search,
  CornerDownLeft,
  MousePointer2,
  ChevronDown,
} from 'lucide-react';

type NavItem = {
  id: string;
  path: string;
  icon: ElementType;
  label: string;
};

export default function Navbar() {
  const { profile, signOut, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showRecommendationsMenu, setShowRecommendationsMenu] = useState(false);
  const [showConsumptionMenu, setShowConsumptionMenu] = useState(false);

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { id: 'inicio', path: '/', icon: Home, label: t('nav.home') },
      { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
      { id: 'devices', path: '/devices', icon: Cpu, label: t('nav.devices') },
      { id: 'consumption', path: '/consumption', icon: BarChart3, label: t('nav.consumption') },
      { id: 'goals', path: '/goals', icon: Target, label: t('nav.goals') },
      { id: 'recommendations', path: '/recommendations', icon: Lightbulb, label: t('nav.recommendations') },
      { id: 'feedback', path: '/feedback', icon: MessageSquare, label: t('nav.feedback') },
    ];

    if (profile?.role === 'admin') {
      items.push({ id: 'admin', path: '/admin', icon: Shield, label: t('nav.admin') });
    }
    return items;
  }, [profile?.role, t]);

  const quickActions = useMemo(
    () => [
      { id: 'settings', label: t('nav.profile'), path: '/settings' },
      { id: 'feedback', label: t('nav.feedback'), path: '/feedback' },
      ...(profile?.role === 'admin' ? [{ id: 'admin', label: t('nav.admin'), path: '/admin' }] : []),
    ],
    [profile?.role, t]
  );

  const handleNavigate = useCallback((path: string) => {
    setSearchTerm('');
    setMobileMenuOpen(false);
    setShowQuickActions(false);
    navigate(path);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return navItems;
    return navItems.filter((item) => item.label.toLowerCase().includes(term) || item.id.toLowerCase().includes(term));
  }, [navItems, searchTerm]);

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/inicio';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setMobileMenuOpen(true);
      }
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        setHighlightIndex((idx) => Math.min(filtered.length - 1, idx + 1));
      }
      if (e.key === 'ArrowUp' && filtered.length > 0) {
        setHighlightIndex((idx) => Math.max(0, idx - 1));
      }
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current && filtered[highlightIndex]) {
        handleNavigate(filtered[highlightIndex].path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, highlightIndex, handleNavigate]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    setShowRecommendationsMenu(false);
    setShowConsumptionMenu(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16 w-full">
          <div className="flex items-center min-w-[140px]">
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md hover:opacity-90"
              aria-label={t('nav.home')}
            >
              {t('app.title')}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {(searchTerm ? filtered : navItems).map((item) => {
              if (item.id === 'feedback' || item.id === 'goals') return null;
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              if (item.id === 'recommendations') {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setShowRecommendationsMenu(true)}
                    onMouseLeave={() => setShowRecommendationsMenu(false)}
                  >
                    <button
                      onClick={() => handleNavigate(item.path)}
                      onFocus={() => setShowRecommendationsMenu(true)}
                      onBlur={() => setShowRecommendationsMenu(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={showRecommendationsMenu}
                    >
                      <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                      {item.label}
                      <ChevronDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                    </button>
                    {showRecommendationsMenu && (
                      <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleNavigate('/feedback')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        >
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                          {t('nav.feedback')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              if (item.id === 'consumption') {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setShowConsumptionMenu(true)}
                    onMouseLeave={() => setShowConsumptionMenu(false)}
                  >
                    <button
                      onClick={() => handleNavigate(item.path)}
                      onFocus={() => setShowConsumptionMenu(true)}
                      onBlur={() => setShowConsumptionMenu(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={showConsumptionMenu}
                    >
                      <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                      {item.label}
                      <ChevronDown className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                    </button>
                    {showConsumptionMenu && (
                      <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleNavigate('/goals')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                        >
                          <Target className="w-4 h-4" aria-hidden="true" />
                          {t('nav.goals')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
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

          <div className="hidden md:flex items-center space-x-3">
            <div className="relative w-64">
              <label className="sr-only" htmlFor="global-search">Buscar</label>
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 dark:bg-gray-800">
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                </div>
                <input
                  id="global-search"
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar o ir..."
                  className="bg-transparent text-sm text-gray-800 dark:text-gray-200 w-full focus:outline-none placeholder:text-gray-400"
                />
                <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium">Ctrl+K</span>
              </div>
              {searchTerm && (
                <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                  {filtered.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">Sin resultados</div>
                  )}
                  {filtered.map((item, idx) => {
                    const Icon = item.icon;
                    const active = idx === highlightIndex;
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${
                          active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span>{item.label}</span>
                        <span className="ml-auto text-[11px] text-gray-400">{item.id}</span>
                      </button>
                    );
                  })}
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-500 flex items-center gap-1">
                    <CornerDownLeft className="w-3 h-3" /> Enter para ir
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={showQuickActions}
                onClick={() => setShowQuickActions((v) => !v)}
              >
                <MousePointer2 className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">Accesos</span>
              </button>
              {showQuickActions && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="px-3 py-2 text-xs text-gray-500">Atajos de menú</div>
                  {quickActions.map((qa) => (
                    <button
                      key={qa.id}
                      onClick={() => handleNavigate(qa.path)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {qa.label}
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-500">
                    Usa Ctrl+K y flechas para navegar con teclado.
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('/settings')}
                  className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActivePath('/settings')
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={t('nav.profile')}
                >
                  <User className="w-5 h-5" aria-hidden="true" />
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
                  onClick={() => handleNavigate('/login')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {t('auth.signin')}
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
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
          <div className="px-3 pt-3 pb-3 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
              <Search className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar o ir (Ctrl+K)"
                className="bg-transparent text-sm text-gray-800 dark:text-gray-200 w-full focus:outline-none"
              />
            </div>
          </div>
          <div className="px-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
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
                  onClick={() => handleNavigate('/settings')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActivePath('/settings')
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" aria-hidden="true" />
                  {t('nav.profile')}
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
                  onClick={() => handleNavigate('/login')}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium bg-emerald-600 text-white"
                >
                  {t('auth.signin')}
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
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
