import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

type Accessibility = {
  zoom: number; // factor (1 = 100%)
  highContrast: boolean;
  ttsEnabled?: boolean;
  toggleTts?: () => void;
  speak?: (text: string) => void;
  linkHighlight: boolean;
  toggleLinkHighlight: () => void;
  letterSpacing: number; // px
  lineHeight: number; // factor
  setLetterSpacing: (v: number) => void;
  setLineHeight: (v: number) => void;
  keyboardNavEnabled: boolean;
  toggleKeyboardNav: () => void;
  largeButtons: boolean;
  toggleLargeButtons: () => void;
  customShortcut: string;
  setCustomShortcut: (combo: string) => void;
  shortcutMatches: (e: KeyboardEvent) => boolean;
  blockAutoActions: boolean;
  toggleBlockAutoActions: () => void;
  voiceControlEnabled: boolean;
  voiceControlSupported: boolean;
  toggleVoiceControl: () => void;
  lastVoiceTranscript?: string;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
  toggleHighContrast: () => void;
  setZoom: (z: number) => void;
};

type RecognitionEvent = Event & { results: SpeechRecognitionResultList; resultIndex: number };

const defaultState: Accessibility = {
  zoom: 1,
  highContrast: false,
  keyboardNavEnabled: true,
  toggleKeyboardNav: () => {},
  largeButtons: false,
  toggleLargeButtons: () => {},
  customShortcut: 'Alt+Shift+A',
  setCustomShortcut: () => {},
  shortcutMatches: () => false,
  blockAutoActions: false,
  toggleBlockAutoActions: () => {},
  voiceControlEnabled: false,
  voiceControlSupported: false,
  toggleVoiceControl: () => {},
  lastVoiceTranscript: '',
  linkHighlight: false,
  toggleLinkHighlight: () => {},
  letterSpacing: 0,
  lineHeight: 1.5,
  setLetterSpacing: () => {},
  setLineHeight: () => {},
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
  const [linkHighlight, setLinkHighlight] = useState<boolean>(() => localStorage.getItem('app_link_highlight') === '1');
  const [letterSpacing, setLetterSpacingState] = useState<number>(() => {
    const saved = localStorage.getItem('app_letter_spacing');
    return saved ? Number(saved) : 0;
  });
  const [lineHeight, setLineHeightState] = useState<number>(() => {
    const saved = localStorage.getItem('app_line_height');
    return saved ? Number(saved) : 1.5;
  });
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState<boolean>(() => localStorage.getItem('app_keyboard_nav') !== '0');
  const [largeButtons, setLargeButtons] = useState<boolean>(() => localStorage.getItem('app_large_buttons') === '1');
  const [customShortcut, setCustomShortcutState] = useState<string>(() => localStorage.getItem('app_custom_shortcut') || 'Alt+Shift+A');
  const [blockAutoActions, setBlockAutoActions] = useState<boolean>(() => localStorage.getItem('app_block_auto') === '1');
  const [voiceControlEnabled, setVoiceControlEnabled] = useState<boolean>(() => localStorage.getItem('app_voice_ctrl') === '1');
  const [voiceControlSupported, setVoiceControlSupported] = useState<boolean>(false);
  const [lastVoiceTranscript, setLastVoiceTranscript] = useState<string>('');
  const lastUserInteractionRef = useRef<number>(Date.now());
  const speechRecognitionRef = useRef<any>(null);

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

  useEffect(() => {
    document.body.classList.toggle('a11y-link-highlight', linkHighlight);
    localStorage.setItem('app_link_highlight', linkHighlight ? '1' : '0');
  }, [linkHighlight]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-letter-spacing', `${letterSpacing}px`);
    localStorage.setItem('app_letter_spacing', String(letterSpacing));
  }, [letterSpacing]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-line-height', String(lineHeight));
    localStorage.setItem('app_line_height', String(lineHeight));
  }, [lineHeight]);

  useEffect(() => {
    localStorage.setItem('app_keyboard_nav', keyboardNavEnabled ? '1' : '0');
    document.body.classList.toggle('a11y-keyboard-nav', keyboardNavEnabled);
    const handler = (e: KeyboardEvent) => {
      if (keyboardNavEnabled) return;
      if (['Tab', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [keyboardNavEnabled]);

  useEffect(() => {
    document.body.classList.toggle('a11y-large-buttons', largeButtons);
    localStorage.setItem('app_large_buttons', largeButtons ? '1' : '0');
  }, [largeButtons]);

  useEffect(() => {
    localStorage.setItem('app_block_auto', blockAutoActions ? '1' : '0');
  }, [blockAutoActions]);

  useEffect(() => {
    localStorage.setItem('app_voice_ctrl', voiceControlEnabled ? '1' : '0');
  }, [voiceControlEnabled]);

  // Helpers para atajos
  const normalizeShortcut = (combo: string) =>
    combo
      .split('+')
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);

  const shortcutMatches = (e: KeyboardEvent) => {
    const parts = normalizeShortcut(customShortcut);
    if (!parts.length) return false;
    const key = e.key.toLowerCase();
    const wantsCtrl = parts.includes('ctrl') || parts.includes('control');
    const wantsAlt = parts.includes('alt');
    const wantsShift = parts.includes('shift');
    const wantsMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
    const main = parts.find((p) => !['ctrl', 'control', 'alt', 'shift', 'meta', 'cmd', 'command'].includes(p));

    return (
      (!!main ? main === key : true) &&
      e.ctrlKey === wantsCtrl &&
      e.altKey === wantsAlt &&
      e.shiftKey === wantsShift &&
      e.metaKey === wantsMeta
    );
  };

  const setCustomShortcut = (combo: string) => {
    const cleaned = combo
      .split('+')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.length === 1 ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
      .join('+');
    localStorage.setItem('app_custom_shortcut', cleaned);
    setCustomShortcutState(cleaned || 'Alt+Shift+A');
  };

  // Registrar interacción de usuario para permitir acciones que bloquean auto-comportamientos
  const markUserInteraction = () => {
    lastUserInteractionRef.current = Date.now();
  };

  useEffect(() => {
    const mark = () => markUserInteraction();
    window.addEventListener('pointerdown', mark, true);
    window.addEventListener('keydown', mark, true);
    window.addEventListener('wheel', mark, true);
    window.addEventListener('touchstart', mark, true);
    return () => {
      window.removeEventListener('pointerdown', mark, true);
      window.removeEventListener('keydown', mark, true);
      window.removeEventListener('wheel', mark, true);
      window.removeEventListener('touchstart', mark, true);
    };
  }, []);

  // Bloqueo de auto-scroll y auto-reproducción (solo permite tras interacción reciente)
  useEffect(() => {
    if (!blockAutoActions) return;

    const allowBecauseUser = () => Date.now() - lastUserInteractionRef.current < 1200;

    const originalScrollTo = window.scrollTo.bind(window);
    const originalScrollBy = window.scrollBy.bind(window);
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const originalPlay = HTMLMediaElement.prototype.play;

    window.scrollTo = (...args: Parameters<typeof window.scrollTo>) => {
      if (!allowBecauseUser()) return;
      return originalScrollTo(...args);
    };
    window.scrollBy = (...args: Parameters<typeof window.scrollBy>) => {
      if (!allowBecauseUser()) return;
      return originalScrollBy(...args);
    };
    Element.prototype.scrollIntoView = function (...args: Parameters<Element['scrollIntoView']>) {
      if (!allowBecauseUser()) return;
      return originalScrollIntoView.apply(this, args);
    };
    HTMLMediaElement.prototype.play = function (...args: unknown[]) {
      if (!allowBecauseUser()) {
        console.warn('Auto-reproducción bloqueada por accesibilidad', this);
        return Promise.resolve();
      }
      return originalPlay.apply(this, args as []);
    };

    return () => {
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      Element.prototype.scrollIntoView = originalScrollIntoView;
      HTMLMediaElement.prototype.play = originalPlay;
    };
  }, [blockAutoActions]);

  // Detección de soporte de reconocimiento de voz
  useEffect(() => {
    // @ts-expect-error webkitSpeechRecognition existe en navegadores basados en Chromium
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceControlSupported(!!SpeechRecognition);
  }, []);

  const focusNextElement = () => {
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

    if (!focusables.length) return;
    const current = document.activeElement as HTMLElement | null;
    const idx = current ? focusables.indexOf(current) : -1;
    const next = focusables[(idx + 1) % focusables.length];
    next.focus();
  };

  const triggerEnterOnFocus = () => {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    active.click();
    active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  };

  const handleVoiceCommand = (phrase: string) => {
    const text = phrase.toLowerCase();
    if (!text) return;
    markUserInteraction();
    if (text.includes('arriba') || text.includes('up')) {
      window.scrollBy({ top: -200, behavior: 'smooth' });
    } else if (text.includes('abajo') || text.includes('down')) {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    } else if (text.includes('tab')) {
      focusNextElement();
    } else if (text.includes('enter')) {
      triggerEnterOnFocus();
    } else if (text.includes('escape') || text.includes('esc')) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  };

  // Control por voz/dictado
  useEffect(() => {
    if (!voiceControlEnabled) {
      speechRecognitionRef.current?.stop();
      return;
    }
    // @ts-expect-error webkitSpeechRecognition existe en navegadores basados en Chromium
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceControlEnabled(false);
      return;
    }

    // @ts-expect-error compatibilidad con webkitSpeechRecognition
    const recognition: SpeechRecognition = new SpeechRecognition() as SpeechRecognition;
    recognition.lang = document.documentElement.lang || 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: RecognitionEvent) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r) => r[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setLastVoiceTranscript(transcript);

      const latest = event.results?.[event.resultIndex]?.[0]?.transcript;
      if (latest) handleVoiceCommand(latest);
    };
    recognition.onend = () => {
      if (voiceControlEnabled) recognition.start();
    };
    recognition.onerror = (err: SpeechRecognitionErrorEvent) => {
      console.warn('Reconocimiento de voz error', err.error || err.message || err.type);
    };

    speechRecognitionRef.current = recognition;
    recognition.start();

    return () => recognition.stop();
  }, [voiceControlEnabled]);

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
  const toggleKeyboardNav = () => setKeyboardNavEnabled((v) => !v);
  const toggleLargeButtons = () => setLargeButtons((v) => !v);
  const toggleBlockAutoActions = () => setBlockAutoActions((v) => !v);
  const toggleVoiceControl = () => setVoiceControlEnabled((v) => !v);
  const toggleLinkHighlight = () => setLinkHighlight((v) => !v);
  const setLetterSpacing = (v: number) => setLetterSpacingState(Math.min(3, Math.max(0, Number(v))));
  const setLineHeight = (v: number) => setLineHeightState(Math.min(2, Math.max(1.2, Number(v))));

  return (
    <AccessibilityContext.Provider
      value={{
        zoom,
        highContrast,
        increaseZoom,
        decreaseZoom,
        resetZoom,
        toggleHighContrast,
        setZoom: setZoomState,
        ttsEnabled,
        toggleTts,
        speak,
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
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
