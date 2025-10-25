import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Recommendation } from '../../types';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';

export default function Recommendations() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<(Recommendation & { userStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    setLoading(true);

    const { data: allRecs } = await supabase
      .from('recommendations')
      .select('*')
      .eq('is_active', true);

    const { data: userRecs } = await supabase
      .from('user_recommendations')
      .select('*')
      .eq('user_id', user!.id);

    if (allRecs) {
      const userRecsMap = new Map(userRecs?.map((ur) => [ur.recommendation_id, ur.status]));
      const enriched = allRecs.map((rec) => ({
        ...rec,
        userStatus: userRecsMap.get(rec.id) || 'pending',
      }));
      setRecommendations(enriched);
    }

    setLoading(false);
  };

  const updateStatus = async (recId: string, status: 'applied' | 'dismissed') => {
    const { data: existing } = await supabase
      .from('user_recommendations')
      .select('id')
      .eq('user_id', user!.id)
      .eq('recommendation_id', recId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_recommendations')
        .update({ status })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_recommendations').insert({
        user_id: user!.id,
        recommendation_id: recId,
        status,
      });
    }

    loadRecommendations();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      heating: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      cooling: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      lighting: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
      appliances: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300',
      general: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('recommendations.title')}</h1>

      {recommendations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 dark:text-gray-400">{t('recommendations.noRecommendations')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {language === 'es' ? rec.title_es : rec.title_en}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(rec.category)}`}>
                    {t(`recommendations.category.${rec.category}`)}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {language === 'es' ? rec.description_es : rec.description_en}
              </p>

              {rec.potential_savings_percent && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {t('recommendations.savings')}: {rec.potential_savings_percent}%
                  </p>
                </div>
              )}

              {rec.userStatus === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(rec.id, 'applied')}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('recommendations.markApplied')}
                  </button>
                  <button
                    onClick={() => updateStatus(rec.id, 'dismissed')}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('recommendations.dismiss')}
                  </button>
                </div>
              )}

              {rec.userStatus === 'applied' && (
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Aplicada
                </div>
              )}

              {rec.userStatus === 'dismissed' && (
                <div className="flex items-center text-gray-500 dark:text-gray-500 text-sm">
                  <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Descartada
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
