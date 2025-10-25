import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Accessibility = {
  zoom: number; // factor (1 = 100%)
  highContrast: boolean;
  ttsEnabled?: boolean;
  toggleTts?: () => void;
  speak?: (text: string) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
  toggleHighContrast: () => void;
  setZoom: (z: number) => void;
};

const defaultState: Accessibility = {
  zoom: 1,
  highContrast: false,
  increaseZoom: () => {},
  decreaseZoom: () => {},
  resetZoom: () => {},
  toggleHighContrast: () => {},
  setZoom: () => {},
};

const AccessibilityContext = createContext<Accessibility>(defaultState);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoomState] = useState<number>(() => {
    const saved = localStorage.getItem('app_zoom');
    return saved ? Number(saved) : 1;
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_high_contrast');
    return saved === '1';
  });
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => localStorage.getItem('app_tts_enabled') === '1');

  useEffect(() => {
    // Aplicar zoom como tamaño de fuente en root
    const root = document.documentElement;
    root.style.setProperty('--app-font-scale', String(zoom));
    root.style.fontSize = `${100 * zoom}%`;
    localStorage.setItem('app_zoom', String(zoom));
  }, [zoom]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    localStorage.setItem('app_high_contrast', highContrast ? '1' : '0');
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('app_tts_enabled', ttsEnabled ? '1' : '0');
  }, [ttsEnabled]);

  // Text-to-speech helper
  const speak = (text: string) => {
    if (!text) return;
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = document.documentElement.lang || 'es-ES';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // If TTS enabled, attach click listener to read single words on click
  useEffect(() => {
    if (!ttsEnabled) return;

    const handleClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      // prefer selection if any
      const sel = window.getSelection();
      const selected = sel && sel.toString().trim();
      if (selected) {
        speak(selected);
        return;
      }

      // on click, get closest text node and the word clicked
      const text = target.innerText || target.textContent || '';
      if (!text) return;
      // attempt to extract the word at the clicked position using range
      // fallback: read the whole element text
      speak(text.trim());
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ttsEnabled]);

  const increaseZoom = () => setZoomState((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10));
  const decreaseZoom = () => setZoomState((z) => Math.max(0.8, Math.round((z - 0.1) * 10) / 10));
  const resetZoom = () => setZoomState(1);
  const toggleHighContrast = () => setHighContrast((v) => !v);
  const toggleTts = () => setTtsEnabled((v) => !v);

  return (
    <AccessibilityContext.Provider value={{ zoom, highContrast, increaseZoom, decreaseZoom, resetZoom, toggleHighContrast, setZoom: setZoomState, ttsEnabled, toggleTts, speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
