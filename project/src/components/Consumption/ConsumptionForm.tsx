import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { ConsumptionRecord } from '../../types';
import { X } from 'lucide-react';
import ConsumptionCalculator from './ConsumptionCalculator';

interface ConsumptionFormProps {
  record: ConsumptionRecord | null;
  onClose: () => void;
}

export default function ConsumptionForm({ record, onClose }: ConsumptionFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    kwh_consumed: '',
    cost: '',
    notes: '',
  });

  // user profile price per kwh if exists
  const [userPrice, setUserPrice] = useState<number | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({
        date: record.date,
        kwh_consumed: record.kwh_consumed.toString(),
        cost: record.cost.toString(),
        notes: record.notes || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        kwh_consumed: '',
        cost: '',
        notes: '',
      });
    }
    // load user profile price if available
    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('price_per_kwh').eq('id', user?.id).single();
        if (!error && data) {
          setUserPrice(data.price_per_kwh ?? null);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [record]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const kwh = parseFloat(formData.kwh_consumed);
    if (!Number.isFinite(kwh) || kwh < 0) {
      setLoading(false);
      alert('Por favor calcula el consumo con la "Calculadora rápida" antes de guardar.');
      return;
    }

    const costVal = formData.cost ? parseFloat(formData.cost) : null;

    const data = {
      date: formData.date,
      kwh_consumed: kwh,
      cost: costVal,
      notes: formData.notes || null,
      user_id: user!.id,
    };

    if (record) {
      await supabase.from('consumption_records').update(data).eq('id', record.id);
    } else {
      await supabase.from('consumption_records').insert(data);
    }

    setLoading(false);
    onClose();
  };

  function handleApplyCalculated({ kwh, cost }: { kwh: number; cost?: number | null }) {
    setFormData((s) => ({ ...s, kwh_consumed: String(kwh), cost: cost != null ? String(cost) : '' }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {record ? t('consumption.form.edit') : t('consumption.form.title')}
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
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimador por dispositivo</div>
            <ConsumptionCalculator onApply={handleApplyCalculated} defaultPricePerKwh={userPrice ?? null} />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('consumption.date')}
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* kWh and cost inputs removed — values come from the Calculadora rápida */}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('consumption.notes')}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
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
