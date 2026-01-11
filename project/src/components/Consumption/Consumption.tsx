import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { ConsumptionRecord } from '../../types';
import ConsumptionForm from './ConsumptionForm';
import ConsumptionDashboard from './ConsumptionDashboard';
import { withTimeout } from '../../utils/withTimeout';

export default function Consumption() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConsumptionRecord | null>(null);

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  const loadRecords = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('consumption_records')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        10000
      );

      if (!error && data) {
        setRecords(data);
      }
    } catch (err) {
      console.error('Error loading consumption records', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('consumption.delete') + '?')) {
      await supabase.from('consumption_records').delete().eq('id', id);
      loadRecords();
    }
  };

  const handleEdit = (record: ConsumptionRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(null);
    loadRecords();
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
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('consumption.title')}</h1>
      </div>

      <div>
        <ConsumptionDashboard />
      </div>

      {showForm && (
        <ConsumptionForm
          record={editingRecord}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
