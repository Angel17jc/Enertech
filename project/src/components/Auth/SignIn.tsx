import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LogIn, Eye, EyeOff, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password'
        });
        if (error) throw error;
        setResetSent(true);
      } else {
        await signIn(email, password);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(isResetMode ? t('auth.resetError') : t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleResetMode = () => {
    setIsResetMode((s) => !s);
    setError('');
    setResetSent(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 dark:bg-emerald-500 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('app.tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                aria-required="true"
              />
            </div>

            {!isResetMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pr-12 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    aria-required="true"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}
            {resetSent && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg">
                {t('auth.resetSent')}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isResetMode ? t('auth.resetPassword') : t('auth.signin')}
            >
              {loading ? (
                t('common.loading')
              ) : isResetMode ? (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  {t('auth.resetPassword')}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  {t('auth.signin')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isResetMode ? t('auth.backToLogin') : t('auth.forgotPassword')}{' '}
                  <button
                    onClick={toggleResetMode}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium focus:outline-none focus:underline"
                  >
                    {isResetMode ? t('auth.signin') : t('auth.resetPassword')}
                  </button>
                </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium focus:outline-none focus:underline"
              >
                {t('auth.signUpHere')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
