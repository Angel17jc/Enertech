import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Plus, Minus, RefreshCcw, Eye, Volume2 } from 'lucide-react';

export default function AccessibilityPanel() {
  const { zoom, increaseZoom, decreaseZoom, resetZoom, highContrast, toggleHighContrast, ttsEnabled, toggleTts, speak } = useAccessibility();

  const readSelection = () => {
    const sel = window.getSelection();
    const text = sel && sel.toString().trim();
    if (text) speak?.(text);
  };

  return (
    <aside aria-label="Accessibility panel" className="fixed right-4 bottom-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 w-64">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Accesibilidad</h3>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-300">Zoom: {Math.round(zoom * 100)}%</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={decreaseZoom} className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200" aria-label="Disminuir zoom"><Minus className="w-4 h-4"/></button>
            <button onClick={resetZoom} className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200" aria-label="Restablecer zoom"><RefreshCcw className="w-4 h-4"/></button>
            <button onClick={increaseZoom} className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200" aria-label="Aumentar zoom"><Plus className="w-4 h-4"/></button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
            <span className="text-sm text-gray-700 dark:text-gray-200">Alto Contraste</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={toggleHighContrast} aria-label="Toggle high contrast" />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
            <span className="text-sm text-gray-700 dark:text-gray-200">Leer texto al click</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!ttsEnabled} onChange={toggleTts} aria-label="Toggle TTS" />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={readSelection} className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Leer selección</button>
          <button onClick={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">Parar</button>
        </div>
      </div>
    </aside>
  );
}
