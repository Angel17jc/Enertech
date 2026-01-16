import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Plus, Minus, Volume2, ChevronLeft, SunMoon, Keyboard, Hand, Mic, Ban, Type, Accessibility, Link2, AlignJustify, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AccessibilityPanel() {
  const {
    zoom,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    highContrast,
    toggleHighContrast,
    ttsEnabled,
    toggleTts,
    speak,
    setZoom,
    keyboardNavEnabled,
    toggleKeyboardNav,
    largeButtons,
    toggleLargeButtons,
    customShortcut,
    setCustomShortcut,
    shortcutMatches,
    blockAutoActions,
    toggleBlockAutoActions,
    voiceControlEnabled,
    voiceControlSupported,
    toggleVoiceControl,
    lastVoiceTranscript,
    linkHighlight,
    toggleLinkHighlight,
    letterSpacing,
    lineHeight,
    setLetterSpacing,
    setLineHeight,
  } = useAccessibility();
  const { toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [open, setOpen] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [shortcutInput, setShortcutInput] = useState(customShortcut);

  const readSelection = () => {
    const sel = window.getSelection();
    const text = sel && sel.toString().trim();
    if (text) speak?.(text);
  };

  // slider handler: range 80..160 -> 0.8..1.6
  const handleSlider = (val: number) => {
    const z = Math.round((val / 100) * 10) / 10;
    setZoom(z);
  };

  // small scroll listener to move the floating tab slightly as user scrolls
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      // map scroll to -80..80 px offset for the button
      const offset = Math.max(-80, Math.min(80, Math.round(y * 0.06)));
      setScrollOffset(offset);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Atajo personalizado para abrir/cerrar panel y cerrar con ESC desde cualquier lugar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (shortcutMatches(e)) {
        e.preventDefault();
        setOpen((s) => !s);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [shortcutMatches, open]);

  useEffect(() => {
    setShortcutInput(customShortcut);
  }, [customShortcut]);

  return (
    <>
      {/* Floating tab */}
      <button
        aria-label="Abrir opciones de accesibilidad"
        onClick={() => setOpen((s) => !s)}
        className="fixed right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-top"
        style={{ top: `calc(50% + ${scrollOffset}px)`, transition: 'top 120ms linear' }}
      >
        <Accessibility className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      </button>

      {/* Drawer */}
      <aside aria-label="Panel de accesibilidad" className={`fixed right-0 top-0 h-full z-50 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-80 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accesibilidad</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleTheme()} className="p-2 rounded-md text-gray-600 dark:text-gray-200" aria-label="Toggle theme">
                <SunMoon className="w-5 h-5" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Cerrar panel" className="p-2 rounded-md text-gray-600 dark:text-gray-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            {/* Resaltado de enlaces / foco visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Resaltado de enlaces</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Subrayado y foco visible en links</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={linkHighlight} onChange={toggleLinkHighlight} aria-label="Resaltar enlaces" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Espaciado entre letras y líneas */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlignJustify className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Espaciado de texto</span>
              </div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Letras ({letterSpacing.toFixed(1)}px)</label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(Number(e.target.value))}
                className="w-full"
                aria-label="Ajustar espaciado de letras"
              />
              <label className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">Líneas ({lineHeight.toFixed(1)}x)</label>
              <input
                type="range"
                min={1.2}
                max={2}
                step={0.1}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full"
                aria-label="Ajustar espaciado entre líneas"
              />
            </div>

            {/* Navegación por teclado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Navegación por teclado</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Activa/desactiva Tab, Enter y Esc</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={keyboardNavEnabled} onChange={toggleKeyboardNav} aria-label="Activar navegación por teclado" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Botones grandes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hand className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Botones grandes</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aumenta tamaño de botones y controles</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={largeButtons} onChange={toggleLargeButtons} aria-label="Activar botones grandes" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="Cambiar idioma"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cambia el idioma de la interfaz</p>
            </div>

            {/* Zoom controls with slider */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom</label>
                <div className="text-xs text-gray-500">{Math.round(zoom * 100)}%</div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={decreaseZoom} aria-label="Disminuir zoom" className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"><Minus className="w-4 h-4"/></button>
                <input
                  type="range"
                  min={80}
                  max={160}
                  value={Math.round(zoom * 100)}
                  onChange={(e) => handleSlider(Number(e.target.value))}
                  className="flex-1"
                  aria-label="Ajustar zoom"
                />
                <button onClick={increaseZoom} aria-label="Aumentar zoom" className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"><Plus className="w-4 h-4"/></button>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={resetZoom} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">Restablecer</button>
                <button onClick={() => { setZoom(1); resetZoom(); }} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">100%</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mueve la barra para ajustar el tamaño del texto en toda la aplicación.</p>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Alto contraste</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aumenta el contraste de colores para mejor legibilidad</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={toggleHighContrast} aria-label="Activar alto contraste" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* TTS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Leer texto al click</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Haz clic en cualquier texto para que el sistema lo lea en voz alta</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={!!ttsEnabled} onChange={toggleTts} aria-label="Activar lectura" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={readSelection} className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Leer selección</button>
              <button onClick={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">Parar</button>
            </div>

            {/* Atajo de teclado personalizado */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Type className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Atajo personalizado</label>
              </div>
              <input
                type="text"
                value={shortcutInput}
                onChange={(e) => setShortcutInput(e.target.value)}
                onBlur={() => setCustomShortcut(shortcutInput)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ej: Alt+Shift+A"
                aria-label="Configurar atajo para abrir el panel"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Usa combinaciones como Ctrl+Alt+K. Presiónalo en cualquier vista para abrir/cerrar este panel.</p>
            </div>

            {/* Control por voz / dictado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Control por voz / dictado</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{voiceControlSupported ? 'Arriba/abajo, Tab, Enter, Esc' : 'No soportado en este navegador'}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={voiceControlEnabled && voiceControlSupported} onChange={toggleVoiceControl} aria-label="Activar control por voz" disabled={!voiceControlSupported} />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            {voiceControlEnabled && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Última frase: <span className="font-medium text-gray-700 dark:text-gray-200">{lastVoiceTranscript || 'Esperando dictado...'}</span>
              </div>
            )}

            {/* Bloqueo de auto-scroll / auto-reproducción */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Bloquear auto-scroll / auto-play</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Evita scrolls o reproducciones sin tu acción</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={blockAutoActions} onChange={toggleBlockAutoActions} aria-label="Bloquear auto-scroll" />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-auto text-xs text-gray-500 dark:text-gray-400">
            <p>Consejo: usa el atajo del panel para acceder rápidamente a las opciones de accesibilidad.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
