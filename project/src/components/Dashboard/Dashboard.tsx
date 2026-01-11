import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { ConsumptionRecord, Device, EnergyGoal } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingDown, Calendar, Activity } from 'lucide-react';
import { withTimeout } from '../../utils/withTimeout';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionRecord[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [goals, setGoals] = useState<EnergyGoal[]>([]);
  const [stats, setStats] = useState({
    totalConsumption: 0,
    avgDaily: 0,
    activeDevices: 0,
    activeGoals: 0,
  });
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

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
            .order('date', { ascending: true }),
          supabase.from('devices').select('*').eq('user_id', user.id),
          supabase.from('energy_goals').select('*').eq('user_id', user.id),
        ]),
        10000
      );

      if (consumptionRes.data) {
        const consumptionRows = (consumptionRes.data as ConsumptionRecord[]) ?? [];
        setConsumptionData(consumptionRows);
      }

      if (devicesRes.data) {
        setDevices(devicesRes.data as Device[]);
        setStats((prev) => ({
          ...prev,
          activeDevices: devicesRes.data.length,
        }));
      }

      if (goalsRes.data) {
        setGoals(goalsRes.data as EnergyGoal[]);
        setStats((prev) => ({
          ...prev,
          activeGoals: goalsRes.data.filter((g: EnergyGoal) => g.status === 'active').length,
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(
    () =>
      consumptionData.filter(
        (record) => record.date.slice(0, 10) >= startDate && record.date.slice(0, 10) <= endDate
      ),
    [consumptionData, startDate, endDate]
  );

  const chartData = filteredRecords.map((record) => ({
    date: new Date(record.date).toLocaleDateString(),
    kwh: Number(record.kwh_consumed),
  }));

  const totalKwh = useMemo(
    () => filteredRecords.reduce((sum, record) => sum + Number(record.kwh_consumed), 0),
    [filteredRecords]
  );

  const hasConsumption = filteredRecords.length > 0;

  const daysInRange = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return diff >= 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
  }, [startDate, endDate]);

  const avgDaily = useMemo(() => (daysInRange > 0 ? totalKwh / daysInRange : 0), [daysInRange, totalKwh]);

  const deviceEstimates = useMemo(() => {
    const days = daysInRange || 1;
    return devices
      .filter((d) => d.is_active !== false)
      .map((dev) => ({
        id: dev.id,
        name: dev.name,
        kwh: Number(((dev.watts * (dev.hours_per_day || 0) * days) / 1000).toFixed(2)),
      }))
      .sort((a, b) => b.kwh - a.kwh);
  }, [devices, daysInRange]);

  const topDevices = deviceEstimates.slice(0, 3);
  const totalEstimate = deviceEstimates.reduce((s, d) => s + d.kwh, 0);

  const goalsProgress = useMemo(() => {
    return goals
      .filter((g) => g.status === 'active')
      .map((g) => {
        const consumed = consumptionData
          .filter((r) => r.date.slice(0, 10) >= g.start_date && r.date.slice(0, 10) <= g.end_date)
          .reduce((s, r) => s + Number(r.kwh_consumed), 0);
        const progress = g.target_kwh > 0 ? consumed / g.target_kwh : 0;
        const spanDays = Math.max(1, Math.floor((new Date(g.end_date).getTime() - new Date(g.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const frequency: 'weekly' | 'monthly' | 'custom' = spanDays <= 10 ? 'weekly' : spanDays <= 45 ? 'monthly' : 'custom';
        let tone: 'success' | 'warning' | 'danger' = 'success';
        if (progress >= 1) tone = 'warning';
        if (progress >= 1.2) tone = 'danger';
        return {
          id: g.id,
          target: g.target_kwh,
          consumed,
          progress,
          tone,
          start: g.start_date,
          end: g.end_date,
          frequency,
        };
      });
  }, [goals, consumptionData]);

  const alerts = useMemo(() => {
    const messages: { type: 'info' | 'warning'; text: string }[] = [];
    const last7 = consumptionData.filter((r) => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      return r.date.slice(0, 10) >= d.toISOString().slice(0, 10);
    });
    if (last7.length === 0) {
      messages.push({ type: 'warning', text: t('dashboard.alerts.noRecentData') || 'Sin datos en los últimos 7 días' });
    }
    if (totalEstimate > 0 && topDevices[0]) {
      const pct = (topDevices[0].kwh / totalEstimate) * 100;
      if (pct >= 50) {
        messages.push({
          type: 'info',
          text: `${topDevices[0].name} concentra ${pct.toFixed(0)}% de tu estimado en este rango`,
        });
      }
    }
    if (messages.length === 0) {
      messages.push({ type: 'info', text: t('dashboard.alerts.allGood') || 'Consumo estable en el periodo seleccionado' });
    }
    return messages;
  }, [consumptionData, topDevices, totalEstimate, t]);

  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      totalConsumption: hasConsumption ? totalKwh : totalEstimate,
      avgDaily: hasConsumption ? avgDaily : (daysInRange > 0 ? totalEstimate / daysInRange : 0),
    }));
  }, [totalKwh, avgDaily, hasConsumption, totalEstimate, daysInRange]);

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title') || 'Panel'}</h1>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600 dark:text-gray-400">{t('dashboard.from') || 'Desde'}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          />
          <label className="text-gray-600 dark:text-gray-400">{t('dashboard.to') || 'Hasta'}</label>
          <input
            type="date"
            value={endDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          title={t('dashboard.totalConsumption')}
          value={`${stats.totalConsumption.toFixed(2)} ${t('common.kwh')}`}
          subtitle={hasConsumption ? (t('dashboard.selectedRange') || 'Rango seleccionado') : (t('dashboard.estimatedUsingDevices') || 'Estimado por dispositivos')}
          color="emerald"
        />
        <StatCard
          icon={TrendingDown}
          title={t('dashboard.avgDaily')}
          value={`${stats.avgDaily.toFixed(2)} ${t('common.kwh')}`}
          subtitle={hasConsumption ? '' : (t('dashboard.estimatedUsingDevices') || 'Estimado por dispositivos')}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('dashboard.consumptionTrend')}
          </h2>
          {!hasConsumption && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {t('dashboard.estimatedUsingDevices') || 'Estimado por dispositivos'}
            </span>
          )}
        </div>

        {(hasConsumption ? chartData : chartData.length > 0 ? chartData : ((): { date: string; kwh: number }[] => {
          // fallback: distribute estimate across range for visualization
          if (!hasConsumption && daysInRange > 0 && totalEstimate > 0) {
            const start = new Date(startDate);
            const data: { date: string; kwh: number }[] = [];
            const perDay = totalEstimate / daysInRange;
            for (let i = 0; i < daysInRange; i++) {
              const d = new Date(start);
              d.setDate(start.getDate() + i);
              data.push({ date: d.toLocaleDateString(), kwh: Number(perDay.toFixed(2)) });
            }
            return data;
          }
          return [];
        })()).length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hasConsumption ? chartData : ((): { date: string; kwh: number }[] => {
              if (chartData.length > 0) return chartData;
              if (!hasConsumption && daysInRange > 0 && totalEstimate > 0) {
                const start = new Date(startDate);
                const data: { date: string; kwh: number }[] = [];
                const perDay = totalEstimate / daysInRange;
                for (let i = 0; i < daysInRange; i++) {
                  const d = new Date(start);
                  d.setDate(start.getDate() + i);
                  data.push({ date: d.toLocaleDateString(), kwh: Number(perDay.toFixed(2)) });
                }
                return data;
              }
              return [];
            })()}>
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
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-center">
            {hasConsumption
              ? t('dashboard.noData')
              : (t('dashboard.noDataEstimate') || 'Sin datos en el rango; mostrando estimación por dispositivos. Registra consumos para ver datos reales.')}
          </div>
        )}

        {!hasConsumption && topDevices.length > 0 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
              {t('dashboard.deviceEstimateBreakdown') || 'Desglose estimado por dispositivo'}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {topDevices.map((dev) => {
                const pct = totalEstimate > 0 ? (dev.kwh / totalEstimate) * 100 : 0;
                return (
                  <div key={dev.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{dev.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pct.toFixed(0)}% del estimado</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{dev.kwh.toFixed(2)} kWh</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.topDevices') || 'Dispositivos destacados'}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.estimateRange') || 'Estimado en rango'}</span>
          </div>
          {topDevices.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topDevices.map((dev) => {
                const pct = totalEstimate > 0 ? (dev.kwh / totalEstimate) * 100 : 0;
                return (
                  <div key={dev.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{dev.name}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{dev.kwh.toFixed(2)} kWh</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{pct.toFixed(0)}% del estimado</p>
                    <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">{t('dashboard.noDevicesData') || 'Sin estimaciones en este rango'}</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('dashboard.goalsProgress') || 'Metas activas'}</h3>
          {goalsProgress.length > 0 ? (
            <div className="space-y-3">
              {goalsProgress.map((goal) => {
                const pct = Math.min(goal.progress * 100, 200);
                const toneClasses = {
                  success: 'bg-emerald-500',
                  warning: 'bg-amber-500',
                  danger: 'bg-red-500',
                } as const;
                const freqLabel =
                  goal.frequency === 'weekly'
                    ? t('dashboard.goalLabel.weekly')
                    : goal.frequency === 'monthly'
                      ? t('dashboard.goalLabel.monthly')
                      : t('dashboard.goalLabel.custom');
                return (
                  <div key={goal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{new Date(goal.start).toLocaleDateString()} - {new Date(goal.end).toLocaleDateString()}</span>
                      <span>{(goal.progress * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.consumed.toFixed(1)} / {goal.target.toFixed(1)} kWh</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{freqLabel}</p>
                    <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-2 rounded-full ${toneClasses[goal.tone]}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">{t('dashboard.noGoals') || 'Sin metas activas'}</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('dashboard.alertsTitle') || 'Avisos rápidos'}</h3>
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`text-sm px-3 py-2 rounded-lg border ${
                alert.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100'
              }`}
            >
              {alert.text}
            </div>
          ))}
        </div>
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
