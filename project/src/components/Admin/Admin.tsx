import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Shield, Users, Zap } from 'lucide-react';
import { withTimeout } from '../../utils/withTimeout';
import { ConsumptionRecord } from '../../types';

interface FeedbackItem {
  id: string;
  user_id: string;
  // solo el feedback antiguo tiene message; el formulario llena el resto
  message: string | null;
  ease_of_use: string | null;
  device_usage: string | null;
  energy_savings_experience: string | null;
  general_comments: string | null;
  recommendations: string | null;
  not_found_info: string | null;
  created_at: string;
  profile_full_name?: string;
}

// claves de traducción de las opciones de "¿cuántos dispositivos?"
const DEVICE_USAGE_KEYS: Record<string, string> = {
  '1-2': 'feedback.devices12',
  '3-5': 'feedback.devices35',
  '6-10': 'feedback.devices610',
  '10+': 'feedback.devices10Plus',
};

const clip = (text: string) => (text.length > 120 ? text.slice(0, 120) + '...' : text);

export default function Admin() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConsumption: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilesRes, consumptionRes, feedbackRes] = await withTimeout(
        Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('consumption_records').select('kwh_consumed'),
          supabase
            .from('feedback')
            .select('id, user_id, message, ease_of_use, device_usage, energy_savings_experience, general_comments, recommendations, not_found_info, created_at')
            .order('created_at', { ascending: false }),
        ]),
        10000
      );

      if (profilesRes.data) {
        setUsers(profilesRes.data);
        setStats((prev) => ({
          ...prev,
          totalUsers: profilesRes.data.length,
        }));
      }

      if (consumptionRes.data) {
        const rows = (consumptionRes.data as Pick<ConsumptionRecord, 'kwh_consumed'>[]) ?? [];
        const total = rows.reduce((sum, record) => sum + Number(record.kwh_consumed ?? 0), 0);
        setStats((prev) => ({
          ...prev,
          totalConsumption: total,
        }));
      }

      if (feedbackRes.data) {
        const feedbackList: FeedbackItem[] = feedbackRes.data.map((f: any) => {
          const profile = profilesRes.data?.find((p: any) => p.id === f.user_id);
          return {
            ...f,
            profile_full_name: profile?.full_name,
          } as FeedbackItem;
        });
        setFeedbacks(feedbackList);
      }
    } catch (error) {
      console.error('Error loading admin data', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalConsumption')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalConsumption.toFixed(2)} kWh
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.users')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('auth.fullname')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('auth.email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Registro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                          : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback recibidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Respuestas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{fb.profile_full_name ?? fb.user_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {fb.message ? (
                      clip(fb.message)
                    ) : (
                      <div className="space-y-1">
                        {fb.ease_of_use && <p>Facilidad de uso: {t(`feedback.${fb.ease_of_use}`)}</p>}
                        {fb.device_usage && <p>Dispositivos: {t(DEVICE_USAGE_KEYS[fb.device_usage] ?? fb.device_usage)}</p>}
                        {fb.energy_savings_experience && <p>Experiencia de ahorro: {t(`feedback.${fb.energy_savings_experience}`)}</p>}
                        {(fb.general_comments || fb.recommendations || fb.not_found_info) && (
                          <p className="italic">{clip((fb.general_comments || fb.recommendations || fb.not_found_info) as string)}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{new Date(fb.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={async () => {
                        if (!confirm('Eliminar feedback?')) return;
                        const { error } = await supabase.from('feedback').delete().eq('id', fb.id);
                        if (error) {
                          alert('No se pudo eliminar feedback');
                        } else {
                          setFeedbacks((prev) => prev.filter((x) => x.id !== fb.id));
                        }
                      }}
                      className="text-sm text-red-600"
                    >Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
