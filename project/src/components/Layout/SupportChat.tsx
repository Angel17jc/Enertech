import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  at: number;
};

const STORAGE_KEY = 'app_support_chat';

const cannedReplies = [
  'Entendido. ¿Puedes darme más contexto?',
  'Aquí para ayudar. ¿Qué necesitas ajustar?',
  'Te recomiendo revisar el panel de accesibilidad a la derecha.',
  'Si algo no responde, recarga la página y vuelve a intentarlo.',
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ChatMessage[]) : [
      { id: 'hello', from: 'bot', text: '¡Hola! Soy tu asistente. Pregunta sobre accesibilidad o navegación.', at: Date.now() },
    ];
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), from: 'user', text, at: Date.now() };
    const botMsg: ChatMessage = {
      id: crypto.randomUUID(),
      from: 'bot',
      text: cannedReplies[Math.floor(Math.random() * cannedReplies.length)],
      at: Date.now() + 1,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const placeholder = useMemo(
    () => 'Escribe tu duda: “¿Cómo activo el contraste?”',
    []
  );

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
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
