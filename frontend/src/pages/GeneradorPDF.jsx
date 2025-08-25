import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import GeneradorPDFPanel from '../components/GeneradorPDFPanel';

const GeneradorPDF = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link color="inherit" href="/dashboard">
            Dashboard
          </Link>
          <Typography color="text.primary">Generador de PDF</Typography>
        </Breadcrumbs>

        {/* Contenido principal */}
        <GeneradorPDFPanel />
      </Box>
    </Container>
  );
};

export default GeneradorPDF;


