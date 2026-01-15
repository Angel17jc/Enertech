import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConsumptionRecord, Device } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

function formatDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getDatesBetween(start: Date, end: Date) {
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(formatDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

interface Props {
  records: ConsumptionRecord[];
}

export default function ConsumptionDashboard({ records }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!user) return;
    setLoadingDevices(true);
    (async () => {
      try {
        const { data: devs } = await supabase
          .from('devices')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
        setDevices((devs as Device[]) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDevices(false);
      }
    })();
  }, [user]);

  // auto fit date range to available records
  useEffect(() => {
    if (!records || records.length === 0) return;
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setStartDate(sorted[0].date.slice(0, 10));
    setEndDate(sorted[sorted.length - 1].date.slice(0, 10));
  }, [records]);

  const start = useMemo(() => new Date(startDate), [startDate]);
  const end = useMemo(() => new Date(endDate), [endDate]);

  const dateRange = useMemo(() => getDatesBetween(start, end), [start, end]);

  // Aggregate records by date
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dateRange) map.set(d, 0);
    for (const r of records) {
      const key = r.date.slice(0, 10);
      if (!map.has(key)) continue;
      map.set(key, (map.get(key) || 0) + Number(r.kwh_consumed));
    }
    return dateRange.map((d) => ({ date: d, kwh: Number((map.get(d) || 0).toFixed(3)) }));
  }, [records, dateRange]);

  // Device estimates for the selected period: watts * hours_per_day * days / 1000
  const deviceEstimates = useMemo(() => {
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    return devices.map((dev) => ({
      id: dev.id,
      name: dev.name,
      kwh: Number(((dev.watts * (dev.hours_per_day || 0) * days) / 1000).toFixed(3)),
    }));
  }, [devices, start, end]);

  const totalEstimated = useMemo(() => deviceEstimates.reduce((s, d) => s + d.kwh, 0), [deviceEstimates]);
  const totalRecorded = useMemo(() => records.reduce((s, r) => s + Number(r.kwh_consumed), 0), [records]);

  const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f97316', '#ef4444', '#a78bfa'];

  if (loadingDevices) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Panel de Consumo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Resumen visual de tus consumos y estimación por dispositivos</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Desde</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2 py-1 border rounded-md" />
          <label className="text-sm text-gray-600">Hasta</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2 py-1 border rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tendencia (kWh)</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="kwh" stroke="#34d399" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimación por dispositivo</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceEstimates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kwh" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">Total estimado periodo: <strong>{totalEstimated.toFixed(3)} kWh</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border col-span-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registros de consumo</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">kWh Consumidos</th>
                  <th className="px-4 py-2 text-left">Costo</th>
                  <th className="px-4 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {records
                  .filter((r) => r.date.slice(0, 10) >= startDate && r.date.slice(0, 10) <= endDate)
                  .map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{Number(r.kwh_consumed).toFixed(3)} kWh</td>
                      <td className="px-4 py-2">{r.cost != null ? `$${Number(r.cost).toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-2">{r.notes || '-'}</td>
                    </tr>
                  ))}
                {records.filter((r) => r.date.slice(0, 10) >= startDate && r.date.slice(0, 10) <= endDate).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      {t('consumption.noRecords')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participación estimada</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceEstimates} dataKey="kwh" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {deviceEstimates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-600">Consumo registrado total: <strong>{totalRecorded.toFixed(3)} kWh</strong></div>
        </div>
      </div>
    </div>
  );
}
