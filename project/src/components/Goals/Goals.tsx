import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { EnergyGoal, ConsumptionRecord } from '../../types';
import { Plus, Target } from 'lucide-react';
import GoalForm from './GoalForm';

export default function Goals() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [goals, setGoals] = useState<EnergyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [consumptionMap, setConsumptionMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('energy_goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data);
      await loadConsumptionForGoals(data);
    }
    setLoading(false);
  };

  const loadConsumptionForGoals = async (goalsData: EnergyGoal[]) => {
    const map: Record<string, number> = {};

    for (const goal of goalsData) {
      const { data } = await supabase
        .from('consumption_records')
        .select('kwh_consumed')
        .eq('user_id', user!.id)
        .gte('date', goal.start_date)
        .lte('date', goal.end_date);

      if (data) {
        const rows = (data as Pick<ConsumptionRecord, 'kwh_consumed'>[]) ?? [];
        const total = rows.reduce((sum, record) => sum + Number(record.kwh_consumed ?? 0), 0);
        map[goal.id] = total;
      }
    }

    setConsumptionMap(map);
  };

  const calculateProgress = (goal: EnergyGoal) => {
    const consumed = consumptionMap[goal.id] || 0;
    const target = Number(goal.target_kwh);
    const progress = (consumed / target) * 100;
    return Math.min(progress, 100);
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadGoals();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('goals.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('goals.add')}
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Target className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 dark:text-gray-400">{t('goals.noGoals')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const consumed = consumptionMap[goal.id] || 0;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('goals.target')}: {Number(goal.target_kwh).toFixed(0)} kWh
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {t(`goals.status.${goal.status}`)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('goals.progress')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {consumed.toFixed(2)} / {Number(goal.target_kwh).toFixed(2)} kWh
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="text-xs text-right text-gray-500 dark:text-gray-500">
                    {progress.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <GoalForm onClose={handleFormClose} />}
    </div>
  );
}
