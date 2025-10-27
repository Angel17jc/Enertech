import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Home, Cpu, BarChart3, Target, Lightbulb } from 'lucide-react';

export default function WelcomePanel() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <Home className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('welcome.title')}{profile?.full_name ? `, ${profile.full_name}` : ''}!</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('welcome.subtitle')}</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-6">
        <section>
          <h3 className="font-medium text-gray-900 dark:text-white">{t('welcome.features.title')}</h3>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                <Cpu className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.devices.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.devices.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.consumption.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.consumption.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.goals.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.goals.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="p-2 bg-white dark:bg-gray-900 rounded-md shadow-sm">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
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
