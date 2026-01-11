import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Recommendation, UserRecommendation } from '../../types';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { withTimeout } from '../../utils/withTimeout';

export default function Recommendations() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<(Recommendation & { userStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: allRecs } = await withTimeout(
        supabase.from('recommendations').select('*').eq('is_active', true),
        10000
      );

      const { data: userRecs } = await withTimeout(
        supabase
          .from('user_recommendations')
          .select('*')
          .eq('user_id', user.id),
        10000
      );

      if (allRecs) {
        const userRecsMap = new Map(
          (userRecs ?? []).map((ur: UserRecommendation) => [ur.recommendation_id, ur.status] as const)
        );
        const enriched = allRecs.map((rec: Recommendation) => ({
          ...rec,
          userStatus: userRecsMap.get(rec.id) || 'pending',
        }));
        setRecommendations(enriched);
      }
    } catch (error) {
      console.error('Error loading recommendations', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
        {error}
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                className="w-full text-left p-6 flex items-start gap-4 focus:outline-none"
              >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {language === 'es' ? rec.title_es : rec.title_en}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(rec.category)}`}>
                        {t(`recommendations.category.${rec.category}`)}
                      </span>
                    </div>
                    {expandedId === rec.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
                    )}
                  </div>
                  {expandedId === rec.id && (
                    <div className="mt-4 space-y-3">
                      <p className="text-gray-600 dark:text-gray-400">
                        {language === 'es' ? rec.description_es : rec.description_en}
                      </p>
                      {rec.potential_savings_percent && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            {t('recommendations.savings')}: {rec.potential_savings_percent}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
