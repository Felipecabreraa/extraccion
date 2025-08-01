import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ResponsiveProvider } from './context/ResponsiveContext';
import RouterWrapper from './components/RouterWrapper';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PetroleoAnalisis from './pages/PetroleoAnalisis';
import MetrosSuperficie from './pages/MetrosSuperficie';

import Danos from './pages/Danos';
import DanosHistoricosTest from './pages/DanosHistoricosTest';
import DanosAcumulados from './pages/DanosAcumulados';
import DanosPorOperador from './components/DanosPorOperador';
import DanosMeta from './pages/DanosMeta';
import Planillas from './pages/Planillas';
import Zonas from './pages/Zonas';
import Usuarios from './pages/Usuarios';
import Sectores from './pages/Sectores';
import Barredores from './pages/Barredores';
import Maquinas from './pages/Maquinas';
import Operadores from './pages/Operadores';
import BulkUpload from './pages/BulkUpload';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }
  
  return token ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="panel-container">
      <Sidebar />
      <Navbar />
      <div className="panel-content">
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/petroleo-analisis" element={<PrivateRoute><AppLayout><PetroleoAnalisis /></AppLayout></PrivateRoute>} />
      <Route path="/metros-superficie" element={<PrivateRoute><AppLayout><MetrosSuperficie /></AppLayout></PrivateRoute>} />

      <Route path="/danos" element={<PrivateRoute><AppLayout><Danos /></AppLayout></PrivateRoute>} />
      <Route path="/danos-historicos" element={<PrivateRoute><AppLayout><DanosHistoricosTest /></AppLayout></PrivateRoute>} />
      <Route path="/danos-acumulados" element={<PrivateRoute><AppLayout><DanosAcumulados /></AppLayout></PrivateRoute>} />
      <Route path="/danos-por-operador" element={<PrivateRoute><AppLayout><DanosPorOperador /></AppLayout></PrivateRoute>} />
      <Route path="/danos-meta" element={<PrivateRoute><AppLayout><DanosMeta /></AppLayout></PrivateRoute>} />
      <Route path="/planillas" element={<PrivateRoute><AppLayout><Planillas /></AppLayout></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute><AppLayout><Usuarios /></AppLayout></PrivateRoute>} />
      <Route path="/zonas" element={<PrivateRoute><AppLayout><Zonas /></AppLayout></PrivateRoute>} />
      <Route path="/sectores" element={<PrivateRoute><AppLayout><Sectores /></AppLayout></PrivateRoute>} />
      <Route path="/barredores" element={<PrivateRoute><AppLayout><Barredores /></AppLayout></PrivateRoute>} />
      <Route path="/operadores" element={<PrivateRoute><AppLayout><Operadores /></AppLayout></PrivateRoute>} />
      <Route path="/maquinas" element={<PrivateRoute><AppLayout><Maquinas /></AppLayout></PrivateRoute>} />
      <Route path="/bulk-upload" element={<PrivateRoute><AppLayout><BulkUpload /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <ResponsiveProvider>
          <RouterWrapper>
            <AppRoutes />
          </RouterWrapper>
        </ResponsiveProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
}
