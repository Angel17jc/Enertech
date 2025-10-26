import { useState, FormEvent, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserPlus, Eye, EyeOff, Check, X } from 'lucide-react';

interface SignUpProps {
  onToggle: () => void;
}

export default function SignUp({ onToggle }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName);
    } catch (err) {
      setError(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  // Validaciones de contraseña en tiempo real
  const validations = useMemo(() => {
    const hasMinLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?"':{}|<>]/.test(password);

    return { hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial };
  }, [password]);

  const isPasswordValid = validations.hasMinLength && validations.hasUpper && validations.hasLower && validations.hasNumber;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 dark:bg-emerald-500 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" aria-hidden="true" />
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
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.fullname')}
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                aria-required="true"
              />
            </div>

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
                  autoComplete="new-password"
                  minLength={6}
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

              <div className="mt-3 text-sm" aria-live="polite">
                <ul className="space-y-1">
                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    {validations.hasMinLength ? (
                      <Check className="w-4 h-4 text-emerald-600 mr-2" aria-hidden="true" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
                    )}
                    <span>Mínimo 6 caracteres</span>
                  </li>

                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    {validations.hasUpper ? (
                      <Check className="w-4 h-4 text-emerald-600 mr-2" aria-hidden="true" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
                    )}
                    <span>Al menos una letra mayúscula</span>
                  </li>

                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    {validations.hasLower ? (
                      <Check className="w-4 h-4 text-emerald-600 mr-2" aria-hidden="true" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
                    )}
                    <span>Al menos una letra minúscula</span>
                  </li>

                  <li className="flex items-center text-gray-700 dark:text-gray-300">
                    {validations.hasNumber ? (
                      <Check className="w-4 h-4 text-emerald-600 mr-2" aria-hidden="true" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
                    )}
                    <span>Al menos un número</span>
                  </li>

                  <li className="flex items-center text-gray-500 dark:text-gray-400">
                    {validations.hasSpecial ? (
                      <Check className="w-4 h-4 text-emerald-600 mr-2" aria-hidden="true" />
                    ) : (
                      <span className="w-4 h-4 mr-2" />
                    )}
                    <span className="text-xs">(Opcional) Caracter especial</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !email || !fullName}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('auth.signup')}
            >
              {loading ? t('common.loading') : t('auth.signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.already')}{' '}
              <button
                onClick={onToggle}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium focus:outline-none focus:underline"
              >
                {t('auth.signInHere')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
