import React from 'react';
import FeedbackForm from './FeedbackForm';
import { useLanguage } from '../../contexts/LanguageContext';

const Feedback: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('feedback.title')}</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
};

export default Feedback;