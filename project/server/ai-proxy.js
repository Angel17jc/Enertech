import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '64kb' }));

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
// Por defecto probamos con gemini-2.5-flash (ajusta vía GEMINI_MODEL si tu key soporta otro nombre)
const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genAI = null;
if (!API_KEY) {
  console.warn('GEMINI_API_KEY not set — API proxy will return 500 for requests until configured.');
} else {
  console.log('GEMINI_API_KEY loaded from environment');
  genAI = new GoogleGenerativeAI(API_KEY);
}

app.post('/api/ai-chat', async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: 'Server not configured with GEMINI_API_KEY' });
    const { message, profile, devices, language, isAuthenticated } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    // Build a concise prompt with user context
    const profileText = profile
      ? `${profile.full_name || profile.email || 'usuario'} (${profile.role || 'user'})`
      : isAuthenticated
        ? 'Usuario autenticado sin perfil completo'
        : 'Usuario anónimo';

    const devicesText = Array.isArray(devices) && devices.length > 0
      ? devices.map((d) => `${d.name || d.device_type || 'dispositivo'} ${d.watts ? `${d.watts}W` : ''} ${d.hours_per_day ? `${d.hours_per_day}h/d` : ''}`.trim()).join('; ')
      : 'Sin dispositivos registrados';

    const userLang = language === 'en' ? 'en' : 'es';

    const prompt = `Eres Enertech Assistant. Contexto usuario: ${profileText}. Dispositivos: ${devicesText}.
  Estilo base: responde breve (máx 3 frases o 3 viñetas), pasos accionables, 1 emoji si encaja, sin bloques largos.
  Permite respuestas más completas (4-6 pasos o viñetas) cuando el usuario pida explicaciones, "cómo funciona", guías o detalles de gráficos/estadísticas; aún así sé concreto y evita paja.
  Usa todos los dispositivos listados (no solo el primero) para personalizar el consejo.
  No prometas instalaciones de energías renovables; enfoca en gestión y optimización de consumo.
  Si falta info, pide 1-2 datos concretos (sin llamar anónimo si isAuthenticated es true).
  Pregunta del usuario: ${message}`;

    // Log incoming request summary (avoid logging sensitive fields like API keys)
    try {
      console.log('AI proxy request:', {
        msgLen: String((message || '').length),
        user: profile ? (profile.email ? `${String(profile.email).slice(0, 4)}...` : 'known') : 'anon',
        devicesCount: Array.isArray(devices) ? devices.length : 0,
      });
    } catch (e) {
      // ignore logging errors
    }

    // Use Google Generative AI SDK (generateContent)
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_ID });
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      const candidate = result?.response?.candidates?.[0];
      const reply = candidate?.content?.parts?.map((p) => p.text || '').join('\n').trim();

      // Log provider response status summary
      try {
        console.log('AI provider response via SDK (model=', MODEL_ID, ')');
      } catch (e) {}

      if (!reply) {
        return res.status(502).json({ error: 'provider_error', raw: result });
      }

      return res.json({ reply, raw: result });
    } catch (sdkErr) {
      console.error('AI SDK error', sdkErr);
      // surfacing the message helps diagnose 404 o permisos
      const msg = sdkErr?.message || sdkErr;
      return res.status(500).json({ error: 'provider_error', raw: msg, model: MODEL_ID });
    }
  } catch (err) {
    console.error('AI proxy error', err);
    return res.status(500).json({ error: 'server_error' });
  }
});

app.get('/health', (req, res) => {
  return res.json({ ok: true, apiKeyLoaded: !!API_KEY });
});

app.listen(PORT, () => console.log(`AI proxy running on http://localhost:${PORT}`));
