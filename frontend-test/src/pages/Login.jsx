import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../context/ResponsiveContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-rionegro.png';


export default function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6fafd 0%, #e8f4f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(62, 214, 214, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)',
          zIndex: 0
        }}
      />
      
      <Fade in timeout={800}>
        <Paper
          elevation={isMobile ? 2 : 4}
          sx={{
            maxWidth: { xs: '100%', sm: 400, md: 450 },
            width: '100%',
            mx: 'auto',
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            boxShadow: isMobile 
              ? '0 2px 16px 0 rgba(62, 214, 214, 0.12)' 
              : '0 4px 32px 0 rgba(62, 214, 214, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2, sm: 3 },
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Logo y título */}
          <Box sx={{ 
            mb: { xs: 2, sm: 3 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Box
              component="img"
              src={logo}
              alt="Logo Río Negro"
              sx={{
                width: { xs: 50, sm: 60, md: 70 },
                height: 'auto',
                mb: { xs: 1, sm: 1.5 },
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ 
                fontWeight: 700, 
                color: '#222', 
                mb: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
              }}
            >
              Iniciar sesión
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#888', 
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Accede a tu cuenta
            </Typography>
          </Box>

          {/* Formulario */}
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%', 
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 }
            }}
          >
            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
              variant="outlined"
              autoComplete="email"
              autoFocus
              size={isMobile ? "small" : "medium"}
              sx={{ 
                borderRadius: 2, 
                background: '#fafbfc',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3ed6d6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3ed6d6',
                    borderWidth: 2,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#3ed6d6', fontSize: { xs: 20, sm: 24 } }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              variant="outlined"
              autoComplete="current-password"
              size={isMobile ? "small" : "medium"}
              sx={{ 
                borderRadius: 2, 
                background: '#fafbfc',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3ed6d6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3ed6d6',
                    borderWidth: 2,
                  },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#3ed6d6', fontSize: { xs: 20, sm: 24 } }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? 'ocultar contraseña' : 'mostrar contraseña'}
                      sx={{ 
                        color: '#3ed6d6',
                        '&:hover': {
                          backgroundColor: 'rgba(62, 214, 214, 0.1)',
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2, 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  textAlign: 'center',
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                {error}
              </Alert>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 3 },
                borderRadius: 2,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600,
                textTransform: 'none',
                background: 'linear-gradient(90deg, #3ed6d6 0%, #667eea 100%)',
                color: '#fff',
                boxShadow: '0 2px 12px 0 rgba(62, 214, 214, 0.3)',
                minHeight: { xs: 48, sm: 56 },
                '&:hover': {
                  background: 'linear-gradient(90deg, #2bb8b8 0%, #5a6fd8 100%)',
                  boxShadow: '0 4px 20px 0 rgba(62, 214, 214, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: '#bdbdbd',
                  color: '#fff',
                  transform: 'none',
                },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={isMobile ? 20 : 24} 
                  sx={{ color: 'white' }} 
                />
              ) : (
                'Entrar'
              )}
            </Button>
          </Box>

          {/* Información adicional */}
          <Box sx={{ 
            mt: { xs: 2, sm: 3 },
            textAlign: 'center',
            opacity: 0.7
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Sistema de Control de Producción
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
} 