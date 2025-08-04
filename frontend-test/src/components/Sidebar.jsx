import React from 'react';
import { 
  Box, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../config/routes';
import logo from '../assets/logo-rionegro.png';

// Mapeo de iconos para las rutas
const iconMap = {
  'DashboardIcon': <DashboardIcon />,
  'AssignmentIcon': <AssignmentIcon />,
  'PeopleIcon': <PeopleIcon />,
  'ApartmentIcon': <ApartmentIcon />,
  'ViewModuleIcon': <ViewModuleIcon />,
  'CleaningServicesIcon': <CleaningServicesIcon />,
  'PrecisionManufacturingIcon': <PrecisionManufacturingIcon />,
  'EngineeringIcon': <EngineeringIcon />,
  'CloudUploadIcon': <CloudUploadIcon />,
  'WarningIcon': <WarningIcon />,
  'HistoryIcon': <HistoryIcon />,
  'AssessmentIcon': <AssessmentIcon />,
  'BugReportIcon': <BugReportIcon />,
  'LocalGasStationIcon': <LocalGasStationIcon />
};

export default function Sidebar() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener rutas según el rol del usuario
  const userRole = usuario?.rol || 'operador';
  const availableRoutes = NAV_ITEMS.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('administrador')
  );

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
        <Avatar 
          src={logo} 
          alt="Logo Río Negro" 
          sx={{ width: 48, height: 48, mx: 'auto', mb: 1 }} 
        />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Río Negro
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Transporte de Residuos
        </Typography>
      </Box>
      
      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 1 }}>
        {availableRoutes.map((item) => {
          const active = location.pathname === item.path;
          const icon = iconMap[item.icon] || <DashboardIcon />;
          
          return (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: active ? 'primary.light' : 'transparent',
                color: active ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: active ? 'primary.light' : 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ color: active ? 'primary.contrastText' : 'text.secondary' }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      
      {/* User Info and Logout */}
      <Box>
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Salir" />
          </ListItemButton>
        </List>
        
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {usuario?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {usuario?.rol || 'Rol'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 