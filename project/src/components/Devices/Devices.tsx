import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Device } from '../../types';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import DeviceForm from './DeviceForm';
import { withTimeout } from '../../utils/withTimeout';

export default function Devices() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [ratePerKwh, setRatePerKwh] = useState(0.12);

  useEffect(() => {
    if (user) {
      loadDevices();
      loadRate();
    }
  }, [user]);

  const loadDevices = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('devices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        10000
      );

      if (!error && data) {
        setDevices(data);
      }
    } catch (err) {
      console.error('Error loading devices', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const loadRate = async () => {
    if (!user) return;
    try {
      const { data } = await withTimeout(
        supabase
          .from('electricity_rates')
          .select('cost_per_kwh')
          .eq('is_default', true)
          .maybeSingle(),
        10000
      );

      if (data) {
        setRatePerKwh(Number(data.cost_per_kwh));
      }
    } catch (err) {
      console.error('Error loading rate', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('devices.delete') + '?')) {
      await supabase.from('devices').delete().eq('id', id);
      loadDevices();
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDevice(null);
    loadDevices();
  };

  const calculateDailyKwh = (watts: number, hours: number) => {
    return (watts * hours) / 1000;
  };

  const calculateMonthlyCost = (watts: number, hours: number) => {
    const dailyKwh = calculateDailyKwh(watts, hours);
    return dailyKwh * 30 * ratePerKwh;
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('devices.title')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('devices.add')}
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Power className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 dark:text-gray-400">{t('devices.noDevices')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.type')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.watts')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.hours')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.dailyConsumption')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.monthlyCost')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('devices.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {device.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {t(`devices.type.${device.device_type}`)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {device.watts} W
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {device.hours_per_day} h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {calculateDailyKwh(device.watts, Number(device.hours_per_day)).toFixed(2)} kWh
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${calculateMonthlyCost(device.watts, Number(device.hours_per_day)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(device)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 mr-3 focus:outline-none focus:underline"
                        aria-label={`${t('devices.edit')} ${device.name}`}
                      >
                        <Edit2 className="w-4 h-4 inline" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none focus:underline"
                        aria-label={`${t('devices.delete')} ${device.name}`}
                      >
                        <Trash2 className="w-4 h-4 inline" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <DeviceForm
          device={editingDevice}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
