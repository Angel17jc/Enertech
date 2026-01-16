import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { withTimeout } from '../../utils/withTimeout';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  at: number;
};

const STORAGE_KEY = 'app_support_chat';
const SUPABASE_CHAT_TABLE = 'support_chat_messages';

const defaultGreeting: ChatMessage = {
  id: 'hello',
  from: 'bot',
  text: '¡Hola! Soy tu asistente. Pregunta sobre accesibilidad o navegación.',
  at: Date.now(),
};

function generateId() {
  try {
    // prefer native UUID when available
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch (e) {
    // ignore and fallback
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const cannedReplies = [
  'Entendido. ¿Puedes darme más contexto?',
  'Aquí para ayudar. ¿Qué necesitas ajustar?',
  'Te recomiendo revisar el panel de accesibilidad a la derecha.',
  'Si algo no responde, recarga la página y vuelve a intentarlo.',
];

export default function SupportChat() {
  const { user, profile } = useAuth();
  const { t, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([defaultGreeting]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);

  useEffect(() => {
    try {
      if (!user && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [messages, user]);

  // Reset messages when cambia el usuario: si no hay user, carga localStorage; si hay user, arranca con saludo y dejará que cargue DB
  useEffect(() => {
    if (!user) {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
          setMessages(JSON.parse(saved) as ChatMessage[]);
          return;
        }
      } catch (e) {
        // ignore
      }
      setMessages([defaultGreeting]);
    } else {
      setMessages([defaultGreeting]);
    }
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;
    // load user devices as context for the AI
    (async () => {
      setLoadingContext(true);
      try {
        const res = (await withTimeout(
          // cast to any to preserve Supabase response typing at runtime
          supabase.from('devices').select('*').eq('user_id', user.id) as any,
          8000
        )) as { data?: any[] | null; error?: any };
        setDevices(res?.data ?? []);
      } catch (e) {
        console.error('Error loading chat context', e);
      } finally {
        setLoadingContext(false);
      }
    })();
  }, [open, user]);

  // When opening the chat for authenticated user, load last messages from Supabase
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      try {
        const res = (await withTimeout(
          supabase.from(SUPABASE_CHAT_TABLE).select('*').eq('user_id', user.id).order('at', { ascending: true }).limit(200) as any,
          8000
        )) as { data?: any[] | null; error?: any };
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const rows = (res.data as any[]).map((r) => ({ id: r.id || generateId(), from: r.sender === 'user' ? 'user' : 'bot', text: r.text || '', at: r.at || Date.now() }));
          setMessages(rows as ChatMessage[]);
        } else {
          setMessages([defaultGreeting]);
        }
      } catch (e) {
        console.error('Error loading chat history', e);
      }
    })();
  }, [open, user]);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: generateId(), from: 'user', text, at: Date.now() };
    const loadingBotId = `bot-${generateId()}`;
    const loadingText = (typeof t === 'function' ? t('common.loading') : undefined) || 'Cargando...';
    const botLoadingMsg: ChatMessage = { id: loadingBotId, from: 'bot', text: loadingText, at: Date.now() };

    setMessages((prev) => [...prev, userMsg, botLoadingMsg]);
    setInput('');

    try {
      const payload = { message: text, profile, devices, language, isAuthenticated: !!user };

      const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '';
      const resp = await fetch(`${apiBase}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // parse JSON safely; if parsing fails, keep raw text
      let body: any = null;
      try {
        body = await resp.json();
      } catch (e) {
        const txt = await resp.text().catch(() => '');
        body = { rawText: txt };
      }

      let reply = '';
      if (resp.ok) {
        reply = body?.reply || ((typeof t === 'function' ? t('common.error') : undefined) || 'Error al generar respuesta');
      } else {
        console.error('AI proxy error', body);
        reply = (typeof t === 'function' ? t('common.error') : undefined) || 'Error al generar respuesta';
      }

      // replace loading bot message with actual reply
      setMessages((prev) => prev.map((m) => (m.id === loadingBotId ? { ...m, text: reply } : m)));

      // Persist messages to Supabase for authenticated users; fallback to localStorage for anonymous
      try {
        if (user) {
          const botMsgId = generateId();
          const inserts = [
            { id: userMsg.id, user_id: user.id, sender: 'user', text: userMsg.text, at: userMsg.at },
            { id: botMsgId, user_id: user.id, sender: 'bot', text: reply, at: Date.now() },
          ];
          const insertRes = await withTimeout(supabase.from(SUPABASE_CHAT_TABLE).insert(inserts) as any, 8000);
          if ((insertRes as any)?.error) {
            console.error('Supabase insert error', (insertRes as any).error);
          }
        } else {
          // anonymous users already persisted in localStorage by effect
        }
      } catch (e) {
        console.error('Error saving chat to Supabase', e);
      }

      // Solo mostrar raw si hay error real
      if (!resp.ok || body?.error) {
        const rawText = body?.raw || body?.error || body?.rawText || body;
        try {
          const rawMsg: ChatMessage = { id: generateId(), from: 'bot', text: `RAW: ${JSON.stringify(rawText)}`, at: Date.now() };
          setMessages((prev) => [...prev, rawMsg]);
          if (user) {
            await withTimeout(supabase.from(SUPABASE_CHAT_TABLE).insert([{ id: rawMsg.id, user_id: user.id, sender: 'bot', text: rawMsg.text, at: rawMsg.at }]) as any, 8000);
          }
        } catch (e) {
          // ignore raw persistence errors
        }
      }
    } catch (err) {
      console.error('Chat send error', err);
      const errText = (typeof t === 'function' ? t('common.error') : undefined) || 'Error al generar respuesta';
      setMessages((prev) => prev.map((m) => (m.id === loadingBotId ? { ...m, text: errText } : m)));
    }
  };

  const placeholder = useMemo(
    () => 'Escribe tu duda: “¿Cómo activo el contraste?”',
    []
  );

  // Cerrar con ESC desde cualquier parte de la página
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [open]);

  // Oculta burbuja/chat para usuarios no autenticados
  if (!user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat de ayuda"
        className="fixed bottom-5 left-5 z-40 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        className={`fixed bottom-24 left-5 z-40 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl transition-transform ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-label="Chat de soporte"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Asistente Enertech</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">En línea</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Cerrar chat" className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-xl px-3 py-2 text-sm max-w-[80%] ${
                  m.from === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
                aria-label={m.from === 'user' ? 'Mensaje de usuario' : 'Respuesta del asistente'}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-keyshortcuts="Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
