import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Device, DeviceType } from '../../types';
import { X } from 'lucide-react';

interface DeviceFormProps {
  device: Device | null;
  onClose: () => void;
}

const deviceTypes: DeviceType[] = [
  'refrigerator',
  'air_conditioner',
  'washing_machine',
  'dryer',
  'dishwasher',
  'television',
  'computer',
  'water_heater',
  'lighting',
  'oven',
  'microwave',
  'other',
];

export default function DeviceForm({ device, onClose }: DeviceFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    device_type: 'refrigerator' as DeviceType,
    watts: '',
    hours_per_day: '',
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        device_type: device.device_type,
        watts: device.watts.toString(),
        hours_per_day: device.hours_per_day.toString(),
      });
    }
  }, [device]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: formData.name,
      device_type: formData.device_type,
      watts: parseInt(formData.watts),
      hours_per_day: parseFloat(formData.hours_per_day),
      user_id: user!.id,
    };

    if (device) {
      await supabase.from('devices').update(data).eq('id', device.id);
    } else {
      await supabase.from('devices').insert(data);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {device ? t('devices.form.edit') : t('devices.form.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('devices.name')}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('devices.type')}
            </label>
            <select
              id="device_type"
              value={formData.device_type}
              onChange={(e) => setFormData({ ...formData, device_type: e.target.value as DeviceType })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`devices.type.${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="watts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('devices.watts')}
            </label>
            <input
              type="number"
              id="watts"
              value={formData.watts}
              onChange={(e) => setFormData({ ...formData, watts: e.target.value })}
              required
              min="1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="hours_per_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('devices.hours')}
            </label>
            <input
              type="number"
              id="hours_per_day"
              value={formData.hours_per_day}
              onChange={(e) => setFormData({ ...formData, hours_per_day: e.target.value })}
              required
              min="0"
              max="24"
              step="0.1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {t('devices.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('devices.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
