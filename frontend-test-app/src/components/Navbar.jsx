import React from 'react';
import { AppBar, Toolbar, Typography, Avatar } from '@mui/material';
import logo from '../assets/logo-rionegro.png';

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        zIndex: 1300,
        marginLeft: '280px',
        width: 'calc(100% - 280px)'
      }}
    >
      <Toolbar>
        <Avatar 
          src={logo} 
          alt="Logo Río Negro" 
          sx={{ width: 36, height: 36, mr: 2 }} 
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Panel de Control de Producción
        </Typography>
      </Toolbar>
    </AppBar>
  );
} 