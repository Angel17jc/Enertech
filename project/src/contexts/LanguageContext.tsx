import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'app.title': 'Enertech',
    'app.tagline': 'Optimiza tu Consumo Energético',
  'nav.home': 'Inicio',
    'nav.dashboard': 'Panel',
    'nav.devices': 'Dispositivos',
    'nav.consumption': 'Consumo',
    'nav.goals': 'Metas',
    'nav.recommendations': 'Recomendaciones',
    'nav.admin': 'Administración',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',
    'auth.signin': 'Iniciar Sesión',
    'auth.signup': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
  'auth.showPassword': 'Mostrar contraseña',
  'auth.hidePassword': 'Ocultar contraseña',
    'auth.fullname': 'Nombre Completo',
    'auth.already': '¿Ya tienes cuenta?',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.signInHere': 'Inicia sesión aquí',
    'auth.signUpHere': 'Regístrate aquí',
    'auth.error': 'Error de autenticación',
    'dashboard.welcome': 'Bienvenido',
  'welcome.title': 'Bienvenido',
  'welcome.subtitle': 'Empieza aquí para conocer las funciones principales de Enertech.',
  'welcome.cta': 'Comenzar',
  'welcome.features.title': 'Funciones principales',
  'welcome.features.devices.title': 'Dispositivos',
  'welcome.features.devices.desc': 'Agrega y gestiona tus electrodomésticos y equipos.',
  'welcome.features.consumption.title': 'Consumo',
  'welcome.features.consumption.desc': 'Registra consumo diario y analiza tendencias.',
  'welcome.features.goals.title': 'Metas',
  'welcome.features.goals.desc': 'Crea metas de ahorro y monitorea el progreso.',
  'welcome.features.recommendations.title': 'Recomendaciones',
  'welcome.features.recommendations.desc': 'Sugerencias prácticas para reducir tu factura eléctrica.',
  'welcome.howto.title': 'Cómo empezar',
  'welcome.howto.step1': 'Visita Dispositivos y agrega tus equipos.',
  'welcome.howto.step2': 'Registra consumos en Consumo para obtener análisis.',
  'welcome.howto.step3': 'Define metas en Metas y recibe recomendaciones.',
    'dashboard.totalConsumption': 'Consumo Total',
    'dashboard.thisMonth': 'Este Mes',
    'dashboard.avgDaily': 'Promedio Diario',
    'dashboard.activeDevices': 'Dispositivos Activos',
    'dashboard.activeGoals': 'Metas Activas',
    'dashboard.consumptionTrend': 'Tendencia de Consumo (últimos 30 días)',
    'dashboard.noData': 'No hay datos disponibles. Comienza registrando tu consumo.',
    'devices.title': 'Mis Dispositivos',
    'devices.add': 'Agregar Dispositivo',
    'devices.name': 'Nombre',
    'devices.type': 'Tipo',
    'devices.watts': 'Potencia (W)',
    'devices.hours': 'Horas/Día',
    'devices.dailyConsumption': 'Consumo Diario',
    'devices.monthlyCost': 'Costo Mensual',
    'devices.actions': 'Acciones',
    'devices.edit': 'Editar',
    'devices.delete': 'Eliminar',
    'devices.noDevices': 'No tienes dispositivos registrados.',
    'devices.form.title': 'Agregar Nuevo Dispositivo',
    'devices.form.edit': 'Editar Dispositivo',
    'devices.save': 'Guardar',
    'devices.cancel': 'Cancelar',
    'devices.type.refrigerator': 'Refrigerador',
    'devices.type.air_conditioner': 'Aire Acondicionado',
    'devices.type.washing_machine': 'Lavadora',
    'devices.type.dryer': 'Secadora',
    'devices.type.dishwasher': 'Lavavajillas',
    'devices.type.television': 'Televisión',
    'devices.type.computer': 'Computadora',
    'devices.type.water_heater': 'Calentador de Agua',
    'devices.type.lighting': 'Iluminación',
    'devices.type.oven': 'Horno',
    'devices.type.microwave': 'Microondas',
    'devices.type.other': 'Otro',
    'consumption.title': 'Registro de Consumo',
    'consumption.add': 'Agregar Registro',
    'consumption.date': 'Fecha',
    'consumption.kwh': 'kWh Consumidos',
    'consumption.cost': 'Costo',
    'consumption.notes': 'Notas',
    'consumption.actions': 'Acciones',
    'consumption.noRecords': 'No hay registros de consumo.',
    'consumption.form.title': 'Agregar Registro de Consumo',
    'consumption.form.edit': 'Editar Registro',
    'goals.title': 'Mis Metas de Ahorro',
    'goals.add': 'Crear Meta',
    'goals.target': 'Objetivo',
    'goals.period': 'Período',
    'goals.status': 'Estado',
    'goals.progress': 'Progreso',
    'goals.actions': 'Acciones',
    'goals.noGoals': 'No tienes metas de ahorro.',
    'goals.status.active': 'Activa',
    'goals.status.completed': 'Completada',
    'goals.status.failed': 'No Alcanzada',
    'goals.form.title': 'Crear Nueva Meta',
    'goals.form.targetKwh': 'kWh Objetivo',
    'goals.form.startDate': 'Fecha Inicio',
    'goals.form.endDate': 'Fecha Fin',
    'recommendations.title': 'Recomendaciones de Ahorro',
    'recommendations.category': 'Categoría',
    'recommendations.savings': 'Ahorro Potencial',
    'recommendations.status': 'Estado',
    'recommendations.markApplied': 'Marcar Aplicada',
    'recommendations.dismiss': 'Descartar',
    'recommendations.noRecommendations': 'No hay recomendaciones disponibles.',
    'recommendations.category.heating': 'Calefacción',
    'recommendations.category.cooling': 'Refrigeración',
    'recommendations.category.lighting': 'Iluminación',
    'recommendations.category.appliances': 'Electrodomésticos',
    'recommendations.category.general': 'General',
    'admin.title': 'Panel de Administración',
    'admin.users': 'Usuarios Registrados',
    'admin.totalUsers': 'Total de Usuarios',
    'admin.totalConsumption': 'Consumo Total del Sistema',
    'admin.recommendations': 'Gestionar Recomendaciones',
    'admin.rates': 'Tarifas Eléctricas',
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.save': 'Guardar Cambios',
    'settings.saved': 'Configuración guardada correctamente',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.kwh': 'kWh',
    'common.from': 'Desde',
    'common.to': 'Hasta',
  },
  en: {
    'app.title': 'Enertech',
    'app.tagline': 'Optimize Your Energy Consumption',
  'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.devices': 'Devices',
    'nav.consumption': 'Consumption',
    'nav.goals': 'Goals',
    'nav.recommendations': 'Recommendations',
    'nav.admin': 'Administration',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
    'auth.fullname': 'Full Name',
    'auth.already': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.signInHere': 'Sign in here',
    'auth.signUpHere': 'Sign up here',
    'auth.error': 'Authentication error',
    'dashboard.welcome': 'Welcome',
  'welcome.title': 'Welcome',
  'welcome.subtitle': 'Start here to learn the main features of Enertech.',
  'welcome.cta': 'Get started',
  'welcome.features.title': 'Main features',
  'welcome.features.devices.title': 'Devices',
  'welcome.features.devices.desc': 'Add and manage your appliances and equipment.',
  'welcome.features.consumption.title': 'Consumption',
  'welcome.features.consumption.desc': 'Record daily consumption and analyze trends.',
  'welcome.features.goals.title': 'Goals',
  'welcome.features.goals.desc': 'Create saving goals and track progress.',
  'welcome.features.recommendations.title': 'Recommendations',
  'welcome.features.recommendations.desc': 'Practical tips to lower your energy bill.',
  'welcome.howto.title': 'How to get started',
  'welcome.howto.step1': 'Go to Devices and add your equipment.',
  'welcome.howto.step2': 'Record consumption in Consumption to get analysis.',
  'welcome.howto.step3': 'Set goals in Goals and receive recommendations.',
    'dashboard.totalConsumption': 'Total Consumption',
    'dashboard.thisMonth': 'This Month',
    'dashboard.avgDaily': 'Daily Average',
    'dashboard.activeDevices': 'Active Devices',
    'dashboard.activeGoals': 'Active Goals',
    'dashboard.consumptionTrend': 'Consumption Trend (last 30 days)',
    'dashboard.noData': 'No data available. Start by recording your consumption.',
    'devices.title': 'My Devices',
    'devices.add': 'Add Device',
    'devices.name': 'Name',
    'devices.type': 'Type',
    'devices.watts': 'Power (W)',
    'devices.hours': 'Hours/Day',
    'devices.dailyConsumption': 'Daily Consumption',
    'devices.monthlyCost': 'Monthly Cost',
    'devices.actions': 'Actions',
    'devices.edit': 'Edit',
    'devices.delete': 'Delete',
    'devices.noDevices': 'You have no registered devices.',
    'devices.form.title': 'Add New Device',
    'devices.form.edit': 'Edit Device',
    'devices.save': 'Save',
    'devices.cancel': 'Cancel',
    'devices.type.refrigerator': 'Refrigerator',
    'devices.type.air_conditioner': 'Air Conditioner',
    'devices.type.washing_machine': 'Washing Machine',
    'devices.type.dryer': 'Dryer',
    'devices.type.dishwasher': 'Dishwasher',
    'devices.type.television': 'Television',
    'devices.type.computer': 'Computer',
    'devices.type.water_heater': 'Water Heater',
    'devices.type.lighting': 'Lighting',
    'devices.type.oven': 'Oven',
    'devices.type.microwave': 'Microwave',
    'devices.type.other': 'Other',
    'consumption.title': 'Consumption Records',
    'consumption.add': 'Add Record',
    'consumption.date': 'Date',
    'consumption.kwh': 'kWh Consumed',
    'consumption.cost': 'Cost',
    'consumption.notes': 'Notes',
    'consumption.actions': 'Actions',
    'consumption.noRecords': 'No consumption records.',
    'consumption.form.title': 'Add Consumption Record',
    'consumption.form.edit': 'Edit Record',
    'goals.title': 'My Saving Goals',
    'goals.add': 'Create Goal',
    'goals.target': 'Target',
    'goals.period': 'Period',
    'goals.status': 'Status',
    'goals.progress': 'Progress',
    'goals.actions': 'Actions',
    'goals.noGoals': 'You have no saving goals.',
    'goals.status.active': 'Active',
    'goals.status.completed': 'Completed',
    'goals.status.failed': 'Not Achieved',
    'goals.form.title': 'Create New Goal',
    'goals.form.targetKwh': 'Target kWh',
    'goals.form.startDate': 'Start Date',
    'goals.form.endDate': 'End Date',
    'recommendations.title': 'Saving Recommendations',
    'recommendations.category': 'Category',
    'recommendations.savings': 'Potential Savings',
    'recommendations.status': 'Status',
    'recommendations.markApplied': 'Mark as Applied',
    'recommendations.dismiss': 'Dismiss',
    'recommendations.noRecommendations': 'No recommendations available.',
    'recommendations.category.heating': 'Heating',
    'recommendations.category.cooling': 'Cooling',
    'recommendations.category.lighting': 'Lighting',
    'recommendations.category.appliances': 'Appliances',
    'recommendations.category.general': 'General',
    'admin.title': 'Administration Panel',
    'admin.users': 'Registered Users',
    'admin.totalUsers': 'Total Users',
    'admin.totalConsumption': 'System Total Consumption',
    'admin.recommendations': 'Manage Recommendations',
    'admin.rates': 'Electricity Rates',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.save': 'Save Changes',
    'settings.saved': 'Settings saved successfully',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.kwh': 'kWh',
    'common.from': 'From',
    'common.to': 'To',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language);
    }
  }, [profile]);

  useEffect(() => {
    try {
      document.documentElement.lang = language === 'en' ? 'en-US' : 'es-ES';
    } catch (e) {}
  }, [language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    // aplicar atributo lang en el documento para TTS y SEO
    try {
      document.documentElement.lang = lang === 'en' ? 'en-US' : 'es-ES';
    } catch (e) {
      // ignore in environments without DOM
    }

    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('id', user.id);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
