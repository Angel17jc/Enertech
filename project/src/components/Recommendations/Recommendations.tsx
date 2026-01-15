import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Recommendation, UserRecommendation, EnergyGoal, ConsumptionRecord } from '../../types';
import { Lightbulb, X } from 'lucide-react';
import { withTimeout } from '../../utils/withTimeout';

export default function Recommendations() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<(Recommendation & { userStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRecId, setOpenRecId] = useState<string | null>(null);
  const [goals, setGoals] = useState<EnergyGoal[]>([]);
  const [consumptionMap, setConsumptionMap] = useState<Record<string, number>>({});
  const [applyingGoalId, setApplyingGoalId] = useState<string | null>(null);
  const activeGoalsByTarget = useMemo(() => {
    const map = new Map<number, EnergyGoal>();
    goals.forEach((goal) => {
      if (goal.status === 'active') {
        map.set(Number(goal.target_kwh), goal);
      }
    });
    return map;
  }, [goals]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadRecommendations(), loadGoals()]);
    } catch (err) {
      console.error('Error loading recommendations page', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    const allRecsRes = (await withTimeout(
      supabase.from('recommendations').select('*').eq('is_active', true),
      10000
    )) as { data: Recommendation[] | null };

    const userRecsRes = (await withTimeout(
      supabase
        .from('user_recommendations')
        .select('*')
        .eq('user_id', user!.id),
      10000
    )) as { data: UserRecommendation[] | null };

    const allRecs = allRecsRes.data;
    const userRecs = userRecsRes.data;

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
  };

  const loadGoals = async () => {
    const goalsRes = (await withTimeout(
      supabase
        .from('energy_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
      10000
    )) as { data: EnergyGoal[] | null; error: unknown };

    if (goalsRes.error) throw goalsRes.error;
    const goalsData = goalsRes.data ?? [];
    setGoals(goalsData);
    await loadConsumptionForGoals(goalsData);
  };

  const loadConsumptionForGoals = async (goalsData: EnergyGoal[]) => {
    const map: Record<string, number> = {};

    for (const goal of goalsData) {
      const consumptionRes = (await withTimeout(
        supabase
          .from('consumption_records')
          .select('kwh_consumed')
          .eq('user_id', user!.id)
          .gte('date', goal.start_date)
          .lte('date', goal.end_date),
        10000
      )) as { data: Pick<ConsumptionRecord, 'kwh_consumed'>[] | null; error?: unknown };

      const rows = consumptionRes.data ?? [];
      const total = rows.reduce((sum, record) => sum + Number(record.kwh_consumed ?? 0), 0);
      map[goal.id] = total;
    }

    setConsumptionMap(map);
  };

  const calculateProgress = (goal: EnergyGoal) => {
    const consumed = consumptionMap[goal.id] || 0;
    const target = Number(goal.target_kwh) || 0;
    if (target === 0) return 0;
    const progress = (consumed / target) * 100;
    return Math.min(progress, 100);
  };

  const presetGoals = useMemo(
    () => [
      {
        id: 'preset-10',
        title: t('recommendations.presets.reduce10.title'),
        description: t('recommendations.presets.reduce10.desc'),
        target_kwh: 150,
        durationDays: 30,
      },
      {
        id: 'preset-weekly',
        title: t('recommendations.presets.weekly.title'),
        description: t('recommendations.presets.weekly.desc'),
        target_kwh: 50,
        durationDays: 7,
      },
      {
        id: 'preset-offpeak',
        title: t('recommendations.presets.offPeak.title'),
        description: t('recommendations.presets.offPeak.desc'),
        target_kwh: 80,
        durationDays: 14,
      },
    ],
    [t]
  );

  const handleApplyPresetGoal = async (presetId: string) => {
    if (!user) return;
    const preset = presetGoals.find((p) => p.id === presetId);
    if (!preset) return;

    const hasActive = goals.some(
      (goal) => goal.status === 'active' && Number(goal.target_kwh) === preset.target_kwh
    );
    if (hasActive) return;

    setApplyingGoalId(presetId);
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + preset.durationDays);

      const insertRes = (await withTimeout(
        supabase.from('energy_goals').insert({
          user_id: user.id,
          target_kwh: preset.target_kwh,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          status: 'active',
        }),
        10000
      )) as { error?: unknown };

      if (insertRes.error) throw insertRes.error;
      await loadGoals();
    } catch (err) {
      console.error('Error applying preset goal', err);
      setError(t('common.error'));
    } finally {
      setApplyingGoalId(null);
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setOpenRecId(rec.id)}
            >
              <div className="flex items-start gap-4">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {language === 'es' ? rec.description_es : rec.description_en}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('recommendations.goalsSectionTitle')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('recommendations.goalsSectionDescription')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">{t('recommendations.noActiveGoals')}</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal);
              const consumed = consumptionMap[goal.id] || 0;
              return (
                <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 font-semibold">
                          {goal.status === 'completed' ? '✓' : '•'}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {`${t('recommendations.goalTargetLabel')}: ${Number(goal.target_kwh).toFixed(0)} kWh`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                      {t(`goals.status.${goal.status}`)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>{t('recommendations.progressLabel')}</span>
                      <span className="font-semibold">{consumed.toFixed(1)} / {Number(goal.target_kwh).toFixed(1)} kWh</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-500">{progress.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recommendations.presets.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('recommendations.presets.subtitle')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presetGoals.map((preset) => (
              <div key={preset.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
                {(() => {
                  const activeGoal = activeGoalsByTarget.get(preset.target_kwh);
                  if (!activeGoal) return null;
                  const progress = calculateProgress(activeGoal);
                  const consumed = consumptionMap[activeGoal.id] || 0;
                  return (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">{t('recommendations.progressLabel')}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{consumed.toFixed(1)} / {Number(activeGoal.target_kwh).toFixed(1)} kWh</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <div className="text-right text-[11px] text-gray-500 dark:text-gray-500 mt-1">{progress.toFixed(1)}%</div>
                    </div>
                  );
                })()}
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{preset.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{preset.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                  {`${t('recommendations.presets.targetLabel')}: ${preset.target_kwh} kWh · ${preset.durationDays} ${t('recommendations.presets.days')}`}
                </div>
                <button
                  onClick={() => handleApplyPresetGoal(preset.id)}
                  disabled={applyingGoalId === preset.id || activeGoalsByTarget.has(preset.target_kwh)}
                  className="w-full inline-flex justify-center items-center px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {applyingGoalId === preset.id
                    ? t('common.loading')
                    : activeGoalsByTarget.has(preset.target_kwh)
                      ? t('recommendations.presets.inProgress')
                      : t('recommendations.presets.apply')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {openRecId && (() => {
        const rec = recommendations.find((r) => r.id === openRecId);
        if (!rec) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenRecId(null)} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <button
                onClick={() => setOpenRecId(null)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{language === 'es' ? rec.title_es : rec.title_en}</h2>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(rec.category)}`}>
                    {t(`recommendations.category.${rec.category}`)}
                  </span>
                </div>
              </div>
              <div className="space-y-4 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                <p>{language === 'es' ? rec.description_es : rec.description_en}</p>
                {rec.potential_savings_percent && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      {t('recommendations.savings')}: {rec.potential_savings_percent}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
