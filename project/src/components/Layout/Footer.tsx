export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Enertech</strong> — Optimiza tu consumo energético. Proyecto académico para monitorizar consumo, administrar dispositivos y crear metas de ahorro.
        </div>

        <div className="mt-3 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
          <span>Desarrollado por Angel17jc</span>
          <span className="mx-2">•</span>
          <a href="#" className="text-emerald-600 hover:underline">Repositorio</a>
          <span className="mx-2">•</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
