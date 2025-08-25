// Configuración global de la aplicación
export const APP_CONFIG = {
  // Configuración de API
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 120000, // 2 minutos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  
  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: 'token',
    REFRESH_TOKEN_KEY: 'refreshToken',
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  },
  
  // Configuración de fechas
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    AUTO_HIDE_DURATION: 6000, // 6 segundos
    MAX_SNACK: 3,
  },
  
  // Configuración de gráficos
  CHARTS: {
    COLORS: {
      PRIMARY: '#3B82F6',
      SECONDARY: '#10B981',
      SUCCESS: '#22C55E',
      WARNING: '#F59E0B',
      ERROR: '#EF4444',
      INFO: '#06B6D4',
    },
    ANIMATION_DURATION: 1000,
  },
  
  // Configuración de desarrollo
  DEVELOPMENT: {
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
  },
};

// Configuración de Material-UI
export const MUI_CONFIG = {
  theme: {
    palette: {
      primary: {
        main: APP_CONFIG.CHARTS.COLORS.PRIMARY,
      },
      secondary: {
        main: APP_CONFIG.CHARTS.COLORS.SECONDARY,
      },
      success: {
        main: APP_CONFIG.CHARTS.COLORS.SUCCESS,
      },
      warning: {
        main: APP_CONFIG.CHARTS.COLORS.WARNING,
      },
      error: {
        main: APP_CONFIG.CHARTS.COLORS.ERROR,
      },
      info: {
        main: APP_CONFIG.CHARTS.COLORS.INFO,
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: 'white',
          },
        },
      },
    },
  },
};

// Configuración de errores
export const ERROR_CONFIG = {
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado en completarse.',
  UNAUTHORIZED_ERROR: 'No tiene permisos para acceder a este recurso.',
  FORBIDDEN_ERROR: 'Acceso denegado.',
  NOT_FOUND_ERROR: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
};

export default APP_CONFIG;

