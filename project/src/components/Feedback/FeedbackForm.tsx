import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    isFirstVisit: null as boolean | null,
    foundNeeded: null as boolean | null,
    visitReason: '',
    notFoundInfo: '',
    easeOfUse: '',
    deviceUsage: '',
    energySavingsExperience: '',
    recommendations: '',
    generalComments: ''
  });
  
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'yes'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para enviar feedback');
      return;
    }

    // Validar campos requeridos
    if (formData.isFirstVisit === null || formData.foundNeeded === null) {
      setError('Por favor responde las preguntas de Sí/No');
      return;
    }

    if (!formData.easeOfUse || !formData.deviceUsage || !formData.energySavingsExperience) {
      setError('Por favor completa todas las preguntas de selección');
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: user.id,
            ...formData,
            submitted_at: new Date().toISOString()
          }
        ]);

      if (supabaseError) throw supabaseError;
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Hubo un error al enviar el formulario. Por favor intenta de nuevo.');
    }
  };

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('feedback.thankYou')}</h2>
        <p>{t('feedback.responseRecorded')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-6">{t('feedback.title')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Primera visita */}
        <div>
          <p className="mb-2">{t('feedback.isFirstVisit')}</p>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="isFirstVisit"
                value="yes"
                onChange={handleInputChange}
                className="mr-2"
              />
              {t('common.yes')}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isFirstVisit"
                value="no"
                onChange={handleInputChange}
                className="mr-2"
              />
              {t('common.no')}
            </label>
          </div>
        </div>

        {/* Encontró lo que necesitaba */}
        <div>
          <p className="mb-2">{t('feedback.foundNeeded')}</p>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="foundNeeded"
                value="yes"
                onChange={handleInputChange}
                className="mr-2"
              />
              {t('common.yes')}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="foundNeeded"
                value="no"
                onChange={handleInputChange}
                className="mr-2"
              />
              {t('common.no')}
            </label>
          </div>
        </div>

        {/* Razón de la visita */}
        <div>
          <label className="block mb-2">
            {t('feedback.visitReason')}
            <textarea
              name="visitReason"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </label>
        </div>

        {/* Información no encontrada */}
        <div>
          <label className="block mb-2">
            {t('feedback.notFoundInfo')}
            <textarea
              name="notFoundInfo"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </label>
        </div>

        {/* Facilidad de uso */}
        <div>
          <label className="block mb-2">
            {t('feedback.easeOfUse')}
            <select
              name="easeOfUse"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">{t('feedback.selectOption')}</option>
              <option value="veryEasy">{t('feedback.veryEasy')}</option>
              <option value="easy">{t('feedback.easy')}</option>
              <option value="neutral">{t('feedback.neutral')}</option>
              <option value="difficult">{t('feedback.difficult')}</option>
              <option value="veryDifficult">{t('feedback.veryDifficult')}</option>
            </select>
          </label>
        </div>

        {/* Uso de dispositivos */}
        <div>
          <label className="block mb-2">
            {t('feedback.deviceUsage')}
            <select
              name="deviceUsage"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">{t('feedback.selectOption')}</option>
              <option value="1-2">{t('feedback.devices12')}</option>
              <option value="3-5">{t('feedback.devices35')}</option>
              <option value="6-10">{t('feedback.devices610')}</option>
              <option value="10+">{t('feedback.devices10Plus')}</option>
            </select>
          </label>
        </div>

        {/* Experiencia de ahorro de energía */}
        <div>
          <label className="block mb-2">
            {t('feedback.energySavingsExperience')}
            <select
              name="energySavingsExperience"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">{t('feedback.selectOption')}</option>
              <option value="excellent">{t('feedback.excellent')}</option>
              <option value="good">{t('feedback.good')}</option>
              <option value="fair">{t('feedback.fair')}</option>
              <option value="poor">{t('feedback.poor')}</option>
              <option value="veryPoor">{t('feedback.veryPoor')}</option>
            </select>
          </label>
        </div>

        {/* Recomendaciones */}
        <div>
          <label className="block mb-2">
            {t('feedback.recommendations')}
            <textarea
              name="recommendations"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </label>
        </div>

        {/* Comentarios generales */}
        <div>
          <label className="block mb-2">
            {t('feedback.generalComments')}
            <textarea
              name="generalComments"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <span>{t('feedback.submit')}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Mensaje de éxito */}
      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{t('feedback.thankYou')}</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{t('feedback.responseRecorded')}</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default FeedbackForm;