import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function WelcomePanel({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12l9-8 9 8v7a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('welcome.title')}{profile?.full_name ? `, ${profile.full_name}` : ''}!</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('welcome.subtitle')}</p>

          <div className="mt-4">
            <button
              onClick={() => onNavigate?.('signup')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {t('welcome.cta')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-6">
        <section>
          <h3 className="font-medium text-gray-900 dark:text-white">{t('welcome.features.title')}</h3>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1581091870622-3c3f1a3e8b57?auto=format&fit=crop&w=400&q=60" alt="Dispositivos" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.devices.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.devices.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=60" alt="Consumo" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.consumption.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.consumption.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=60" alt="Metas" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.goals.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.goals.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1484496957711-3a7c2a9a6d2f?auto=format&fit=crop&w=400&q=60" alt="Recomendaciones" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.recommendations.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.recommendations.desc')}</div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <h3 className="font-medium text-gray-900 dark:text-white">{t('welcome.howto.title')}</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>{t('welcome.howto.step1')}</li>
            <li>{t('welcome.howto.step2')}</li>
            <li>{t('welcome.howto.step3')}</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p>Si quieres ayuda detallada, visita Ajustes → Documentación o contáctanos.</p>
      </div>
    </div>
  );
}
