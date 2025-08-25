import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, IconButton, Collapse,
  Alert, AlertTitle, Badge, Fade, Zoom
} from '@mui/material';
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const AlertasInteligentes = ({ alertas = [], onAlertClick }) => {
  const [expanded, setExpanded] = useState(true);

  if (!alertas || alertas.length === 0) {
    return (
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={2}>
            <InfoIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body1" color="textSecondary">
              No hay alertas activas en este momento
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Funciones auxiliares comentadas para evitar warnings
  // const getAlertIcon = (tipo) => {
  //   switch (tipo) {
  //     case 'error':
  //       return <ErrorIcon color="error" />;
  //     case 'warning':
  //       return <WarningIcon color="warning" />;
  //     case 'info':
  //       return <InfoIcon color="info" />;
  //     default:
  //       return <InfoIcon color="primary" />;
  //   }
  // };

  // const getAlertColor = (tipo) => {
  //   switch (tipo) {
  //     case 'error':
  //       return 'error';
  //     case 'warning':
  //       return 'warning';
  //     case 'info':
  //       return 'info';
  //     default:
  //       return 'primary';
  //   }
  // };

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'tendencia':
        return <TrendingUpIcon />;
      case 'zona':
        return <LocationIcon />;
      case 'eficiencia':
        return <AssessmentIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // const getPrioridadColor = (prioridad) => {
  //   switch (prioridad) {
  //     case 'alta':
  //       return 'error';
  //     case 'media':
  //       return 'warning';
  //     case 'baja':
  //       return 'info';
  //     default:
  //       return 'default';
  //   }
  // };

  const handleAlertClick = (alerta) => {
    if (onAlertClick) {
      onAlertClick(alerta);
    }
  };

  const alertasPorPrioridad = {
    alta: alertas.filter(a => a.prioridad === 'alta'),
    media: alertas.filter(a => a.prioridad === 'media'),
    baja: alertas.filter(a => a.prioridad === 'baja')
  };

  return (
    <Fade in timeout={800}>
      <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Badge badgeContent={alertas.length} color="error" sx={{ mr: 2 }}>
                <NotificationsIcon color="primary" />
              </Badge>
              <Typography variant="h6" fontWeight="bold">
                Alertas Inteligentes
              </Typography>
            </Box>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box>
              {/* Alertas de Prioridad Alta */}
              {alertasPorPrioridad.alta.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="error" fontWeight="bold" mb={1}>
                    🔴 Críticas ({alertasPorPrioridad.alta.length})
                  </Typography>
                  {alertasPorPrioridad.alta.map((alerta, index) => (
                    <Zoom in timeout={300 + index * 100} key={alerta.id}>
                      <Alert
                        severity="error"
                        sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => handleAlertClick(alerta)}
                        action={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              icon={getCategoriaIcon(alerta.categoria)}
                              label={alerta.categoria}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                            <Chip
                              label={alerta.prioridad}
                              size="small"
                              color="error"
                            />
                          </Box>
                        }
                      >
                        <AlertTitle>{alerta.titulo}</AlertTitle>
                        {alerta.mensaje}
                      </Alert>
                    </Zoom>
                  ))}
                </Box>
              )}

              {/* Alertas de Prioridad Media */}
              {alertasPorPrioridad.media.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="warning.main" fontWeight="bold" mb={1}>
                    🟡 Advertencias ({alertasPorPrioridad.media.length})
                  </Typography>
                  {alertasPorPrioridad.media.map((alerta, index) => (
                    <Zoom in timeout={400 + index * 100} key={alerta.id}>
                      <Alert
                        severity="warning"
                        sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => handleAlertClick(alerta)}
                        action={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              icon={getCategoriaIcon(alerta.categoria)}
                              label={alerta.categoria}
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                            <Chip
                              label={alerta.prioridad}
                              size="small"
                              color="warning"
                            />
                          </Box>
                        }
                      >
                        <AlertTitle>{alerta.titulo}</AlertTitle>
                        {alerta.mensaje}
                      </Alert>
                    </Zoom>
                  ))}
                </Box>
              )}

              {/* Alertas de Prioridad Baja */}
              {alertasPorPrioridad.baja.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="info.main" fontWeight="bold" mb={1}>
                    🔵 Informativas ({alertasPorPrioridad.baja.length})
                  </Typography>
                  {alertasPorPrioridad.baja.map((alerta, index) => (
                    <Zoom in timeout={500 + index * 100} key={alerta.id}>
                      <Alert
                        severity="info"
                        sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => handleAlertClick(alerta)}
                        action={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              icon={getCategoriaIcon(alerta.categoria)}
                              label={alerta.categoria}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                            <Chip
                              label={alerta.prioridad}
                              size="small"
                              color="info"
                            />
                          </Box>
                        }
                      >
                        <AlertTitle>{alerta.titulo}</AlertTitle>
                        {alerta.mensaje}
                      </Alert>
                    </Zoom>
                  ))}
                </Box>
              )}

              {/* Resumen de Alertas */}
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Resumen:</strong> {alertas.length} alertas activas • 
                  {alertasPorPrioridad.alta.length} críticas • 
                  {alertasPorPrioridad.media.length} advertencias • 
                  {alertasPorPrioridad.baja.length} informativas
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default AlertasInteligentes; 