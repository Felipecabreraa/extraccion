import React from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper 
} from '@mui/material';
import { 
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../context/ResponsiveContext';
import { getRoutesByRole } from '../config/routes';

export default function MobileNavigation() {
  const { usuario } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener rutas según el rol del usuario
  const navItems = getRoutesByRole(usuario?.rol || 'operador');

  // Filtrar solo las rutas principales para la navegación móvil
  const mobileNavItems = navItems.filter(item => 
    ['/dashboard', '/planillas', '/danos', '/usuarios', '/zonas', '/sectores'].includes(item.path)
  ).slice(0, 4); // Máximo 4 elementos para la navegación móvil

  // Mapeo de iconos para navegación móvil
  const getMobileIcon = (path) => {
    switch (path) {
      case '/dashboard': return <HomeIcon />;
      case '/planillas': return <AssignmentIcon />;
      case '/danos': return <SettingsIcon />;
      case '/usuarios': return <PeopleIcon />;
      case '/zonas': return <SettingsIcon />;
      case '/sectores': return <SettingsIcon />;
      default: return <HomeIcon />;
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Solo mostrar en móvil
  if (!isMobile) {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: { xs: 'block', md: 'none' }
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => {
          handleNavigation(newValue);
        }}
        showLabels
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        {mobileNavItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={getMobileIcon(item.path)}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                lineHeight: 1.2,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
} 