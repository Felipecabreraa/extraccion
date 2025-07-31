// Configuración centralizada de rutas
export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',
  
  // Rutas privadas
  DASHBOARD: '/dashboard',
  PETROLEO_ANALISIS: '/petroleo-analisis',
  METROS_SUPERFICIE: '/metros-superficie',

  DANOS: '/danos',
  DANOS_HISTORICOS: '/danos-historicos',
  DANOS_ACUMULADOS: '/danos-acumulados',
  DANOS_POR_OPERADOR: '/danos-por-operador',
  TEST_DANOS_OPERADOR: '/test-danos-operador',
  DANOS_META: '/danos-meta',
  PLANILLAS: '/planillas',
  USUARIOS: '/usuarios',
  ZONAS: '/zonas',
  SECTORES: '/sectores',
  BARREDORES: '/barredores',
  OPERADORES: '/operadores',
  MAQUINAS: '/maquinas',
  BULK_UPLOAD: '/bulk-upload',
  
  // Ruta por defecto
  DEFAULT: '/dashboard'
};

// Configuración de navegación
export const NAV_ITEMS = [
  { 
    label: 'Dashboard', 
    path: ROUTES.DASHBOARD, 
    icon: 'DashboardIcon',
    roles: ['administrador', 'supervisor', 'operador']
  },
  { 
    label: 'Análisis Petróleo', 
    path: ROUTES.PETROLEO_ANALISIS, 
    icon: 'LocalGasStationIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Metros Superficie', 
    path: ROUTES.METROS_SUPERFICIE, 
    icon: 'AssessmentIcon',
    roles: ['administrador']
  },

  { 
    label: 'Daños', 
    path: ROUTES.DANOS, 
    icon: 'WarningIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Daños Históricos', 
    path: ROUTES.DANOS_HISTORICOS, 
    icon: 'HistoryIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Daños Acumulados', 
    path: ROUTES.DANOS_ACUMULADOS, 
    icon: 'TrendingUpIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Daños por Operador', 
    path: ROUTES.DANOS_POR_OPERADOR, 
    icon: 'PeopleIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Test Daños Operador', 
    path: ROUTES.TEST_DANOS_OPERADOR, 
    icon: 'BugReportIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Metas de Daños', 
    path: ROUTES.DANOS_META, 
    icon: 'TargetIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Planillas', 
    path: ROUTES.PLANILLAS, 
    icon: 'AssignmentIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Usuarios', 
    path: ROUTES.USUARIOS, 
    icon: 'PeopleIcon',
    roles: ['administrador']
  },
  { 
    label: 'Zonas', 
    path: ROUTES.ZONAS, 
    icon: 'ApartmentIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Sectores', 
    path: ROUTES.SECTORES, 
    icon: 'ViewModuleIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Barredores', 
    path: ROUTES.BARREDORES, 
    icon: 'CleaningServicesIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Operadores', 
    path: ROUTES.OPERADORES, 
    icon: 'EngineeringIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Máquinas', 
    path: ROUTES.MAQUINAS, 
    icon: 'PrecisionManufacturingIcon',
    roles: ['administrador', 'supervisor']
  },
  { 
    label: 'Carga Masiva', 
    path: ROUTES.BULK_UPLOAD, 
    icon: 'CloudUploadIcon',
    roles: ['administrador']
  }
];

// Función para obtener rutas según el rol del usuario
export const getRoutesByRole = (userRole) => {
  return NAV_ITEMS.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('administrador')
  );
};

// Función para verificar si una ruta es accesible
export const isRouteAccessible = (path, userRole) => {
  const route = NAV_ITEMS.find(item => item.path === path);
  return route ? route.roles.includes(userRole) : false;
}; 