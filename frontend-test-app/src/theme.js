import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3ed6d6', // Turquesa del logo
      contrastText: '#fff',
    },
    secondary: {
      main: '#333', // Gris oscuro
    },
    background: {
      default: '#f6fafd', // Fondo claro
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#666',
    },
    info: {
      main: '#667eea', // Azul de gradiente
    },
    success: {
      main: '#3ed6a7',
    },
    error: {
      main: '#e57373',
    },
    warning: {
      main: '#ffb300',
    },
  },
  typography: {
    fontFamily: [
      'Montserrat',
      'Roboto',
      'Segoe UI',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(62, 214, 214, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 