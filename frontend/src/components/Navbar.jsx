import React from 'react';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/logo-rionegro.png';
import { useResponsive } from '../context/ResponsiveContext';

export default function Navbar() {
  const { isMobile, toggleSidebar } = useResponsive();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        zIndex: 1300,
        marginLeft: isMobile ? 0 : '280px',
        width: isMobile ? '100%' : 'calc(100% - 280px)',
        transition: 'margin-left 0.3s ease, width 0.3s ease'
      }}
    >
      <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Avatar 
            src={logo} 
            alt="Logo Río Negro" 
            sx={{ 
              width: isMobile ? 32 : 36, 
              height: isMobile ? 32 : 36, 
              mr: 2 
            }} 
          />
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ 
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Panel de Control de Producción
          </Typography>
          <Typography 
            variant="subtitle2" 
            component="div" 
            sx={{ 
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Río Negro
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 