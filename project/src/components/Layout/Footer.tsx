export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Enertech</h4>
            <p className="mt-2 text-sm text-gray-600">Optimiza tu consumo energético: registra dispositivos, monitorea kWh y fija metas de ahorro. Proyecto académico con enfoque en accesibilidad.</p>
            <p className="mt-3 text-sm text-gray-500">© {new Date().getFullYear()} Enertech</p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-900">Enlaces rápidos</h5>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a href="#/" className="hover:underline">Panel</a></li>
              <li><a href="#/devices" className="hover:underline">Dispositivos</a></li>
              <li><a href="#/consumption" className="hover:underline">Registro de consumo</a></li>
              <li><a href="#/goals" className="hover:underline">Metas de ahorro</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-900">Documentación</h5>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">README</a></li>
              <li><a href="#" className="hover:underline">USAGE_GUIDE</a></li>
              <li><a href="#" className="hover:underline">SEED_DATA.sql</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-900">Contacto</h5>
            <p className="mt-3 text-sm text-gray-600">Equipo Enertech</p>
            <p className="text-sm text-gray-600">Correo: <a href="mailto:soporte@enertech.example" className="text-emerald-600 hover:underline">soporte@enertech.example</a></p>
            <p className="text-sm text-gray-600 mt-2">Dirección: Av. Del Bombero km 6 1/2 Vía a la Costa Edif. Grace, Manta, Ecuador</p>
            <div className="mt-4 text-sm text-gray-500">Desarrollado por Angel17jc • v0.1.0</div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-500">
          Recursos y material del proyecto disponibles en el repositorio. Para preguntas o soporte, usa el correo de contacto o abre un issue en el repositorio.
        </div>
      </div>
    </footer>
  );
}
