import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { ConsumptionRecord } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingDown, Calendar, Activity } from 'lucide-react';
import { withTimeout } from '../../utils/withTimeout';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionRecord[]>([]);
  const [stats, setStats] = useState({
    totalConsumption: 0,
    avgDaily: 0,
    activeDevices: 0,
    activeGoals: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [consumptionRes, devicesRes, goalsRes] = await withTimeout(
        Promise.all([
          supabase
            .from('consumption_records')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('date', { ascending: true }),
          supabase.from('devices').select('*').eq('user_id', user.id).eq('is_active', true),
          supabase.from('energy_goals').select('*').eq('user_id', user.id).eq('status', 'active'),
        ]),
        10000
      );

      if (consumptionRes.data) {
        const consumptionRows = (consumptionRes.data as ConsumptionRecord[]) ?? [];
        setConsumptionData(consumptionRows);
        const total = consumptionRows.reduce((sum, record) => sum + Number(record.kwh_consumed), 0);
        const avg = consumptionRows.length > 0 ? total / consumptionRows.length : 0;

        setStats((prev) => ({
          ...prev,
          totalConsumption: total,
          avgDaily: avg,
        }));
      }

      if (devicesRes.data) {
        setStats((prev) => ({
          ...prev,
          activeDevices: devicesRes.data.length,
        }));
      }

      if (goalsRes.data) {
        setStats((prev) => ({
          ...prev,
          activeGoals: goalsRes.data.length,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const chartData = consumptionData.map((record) => ({
    date: new Date(record.date).toLocaleDateString(),
    kwh: Number(record.kwh_consumed),
  }));

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          title={t('dashboard.totalConsumption')}
          value={`${stats.totalConsumption.toFixed(2)} ${t('common.kwh')}`}
          subtitle={t('dashboard.thisMonth')}
          color="emerald"
        />
        <StatCard
          icon={TrendingDown}
          title={t('dashboard.avgDaily')}
          value={`${stats.avgDaily.toFixed(2)} ${t('common.kwh')}`}
          subtitle=""
          color="blue"
        />
        <StatCard
          icon={Activity}
          title={t('dashboard.activeDevices')}
          value={stats.activeDevices.toString()}
          subtitle=""
          color="amber"
        />
        <StatCard
          icon={Calendar}
          title={t('dashboard.activeGoals')}
          value={stats.activeGoals.toString()}
          subtitle=""
          color="teal"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.consumptionTrend')}
        </h2>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                style={{ fontSize: '12px' }}
                label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Line
                type="monotone"
                dataKey="kwh"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            {t('dashboard.noData')}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  color: 'emerald' | 'blue' | 'amber' | 'teal';
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
