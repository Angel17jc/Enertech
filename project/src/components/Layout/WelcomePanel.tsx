import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function WelcomePanel() {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const interpreterRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setMuted] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [showInterpreter, setShowInterpreter] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [visualAlert, setVisualAlert] = useState<string | null>(null);
  const navigate = useNavigate();

  const videoSrc = import.meta.env.VITE_INTRO_VIDEO || '/media/intro.mp4';
  const captionsSrc = import.meta.env.VITE_INTRO_CAPTIONS || '/media/intro.vtt';
  const interpreterSrc = import.meta.env.VITE_INTRO_INTERPRETER || '';
  const transcriptText =
    import.meta.env.VITE_INTRO_TRANSCRIPT ||
    'Esta es una introducción rápida a Enertech: cómo navegar, usar los paneles y configurar accesibilidad.';

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleEnded = () => {
      setPlaying(false);
      setVisualAlert('El video terminó. Puedes reproducirlo de nuevo o leer la transcripción.');
      setTimeout(() => setVisualAlert(null), 6000);
    };
    vid.addEventListener('ended', handleEnded);
    return () => vid.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12l9-8 9 8v7a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('welcome.title')}!</h2>
          {user ? (
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('welcome.welcomeBack')}{profile?.full_name ? `, ${profile.full_name}` : ''}.
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('welcome.subtitle')}</p>
          )}

          {!user && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {t('welcome.cta')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 space-y-6">
        <section>
          <h3 className="font-medium text-gray-900 dark:text-white">{t('welcome.features.title')}</h3>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="/media/devices-card.webp" alt="Dispositivos" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.devices.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.devices.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=60" alt="Consumo" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.consumption.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.consumption.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=60" alt="Metas" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.goals.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.goals.desc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex items-center justify-center">
                <img src="/media/recommendations-card.webp" alt="Recomendaciones" className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-sm font-medium">{t('welcome.features.recommendations.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('welcome.features.recommendations.desc')}</div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <h3 className="font-medium text-gray-900 dark:text-white">{t('welcome.howto.title')}</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>{t('welcome.howto.step1')}</li>
            <li>{t('welcome.howto.step2')}</li>
            <li>{t('welcome.howto.step3')}</li>
          </ul>
        </section>
      </div>

      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p>Si quieres ayuda detallada, visita Ajustes → Documentación o contáctanos.</p>
      </div>

      {user && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Te gustaría compartir tu opinión? Ve a la sección de Comentarios.
          </p>
        </div>
      )}

      {/* Bloque de introducción en video con accesibilidad multimedia */}
      <section className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Introducción en video</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
              aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
            >
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>
            <button
              onClick={toggleMute}
              className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm"
              aria-label={isMuted ? 'Activar audio' : 'Silenciar audio'}
            >
              {isMuted ? 'Activar audio' : 'Silenciar'}
            </button>
          </div>
        </div>

        {visualAlert && (
          <div className="rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 px-4 py-2 text-sm" role="status">
            {visualAlert}
          </div>
        )}

        <div className="mx-auto max-w-2xl relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md bg-black/80">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              aria-label="Video introductorio de Enertech"
              poster="/media/intro-poster.jpg"
            >
              <source src={videoSrc} type="video/mp4" />
              <track kind="captions" src={captionsSrc} srcLang="es" label="Español" default />
              Tu navegador no soporta la reproducción de video.
            </video>
          </div>

          {/* Intérprete: overlay en pantallas >= sm, bloque debajo en móviles */}
          {showInterpreter && interpreterSrc && (
            <>
              <div id="intro-interpreter" className="hidden sm:block absolute bottom-4 right-4 w-44 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-emerald-500 bg-black">
                <video
                  ref={interpreterRef}
                  src={interpreterSrc}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  aria-label="Intérprete en lengua de señas"
                />
              </div>

              <div className="sm:hidden mt-3 mx-auto w-full h-28 rounded-lg overflow-hidden shadow-md border-2 border-emerald-500 bg-black">
                <video
                  src={interpreterSrc}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  aria-label="Intérprete en lengua de señas"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            aria-expanded={showTranscript}
            aria-controls="intro-transcript"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/80 border shadow-sm text-sm text-gray-800 dark:text-gray-200 hover:shadow transition"
          >
            {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
          </button>
          <button
            onClick={() => setShowInterpreter((v) => !v)}
            aria-expanded={showInterpreter}
            aria-controls="intro-interpreter"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/80 border shadow-sm text-sm text-gray-800 dark:text-gray-200 hover:shadow transition"
          >
            {showInterpreter ? 'Ocultar intérprete' : 'Mostrar intérprete'}
          </button>
          <button
            onClick={() => {
              const vid = videoRef.current;
              if (!vid) return;
              vid.currentTime = 0;
              vid.pause();
              setPlaying(false);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/70 border shadow-sm text-sm text-gray-800 dark:text-gray-200 hover:shadow transition"
          >
            Reiniciar
          </button>
        </div>

        <div
          id="intro-transcript"
          className={`rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-300 overflow-hidden ${
            showTranscript ? 'max-h-96 px-4 py-3' : 'max-h-0 px-4 py-0'
          }`}
          aria-hidden={!showTranscript}
        >
          <div className="font-semibold text-gray-900 dark:text-white mb-1">Transcripción</div>
          <div className="leading-relaxed">{transcriptText}</div>
        </div>
      </section>
    </div>
  );
}
