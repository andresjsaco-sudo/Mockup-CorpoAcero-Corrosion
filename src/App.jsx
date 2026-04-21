import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RefreshKeyProvider } from './hooks/RefreshKeyContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import GaleriaPage from './pages/GaleriaPage';
import MedicionDetailPage from './pages/MedicionDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ReportsPage from './pages/ReportsPage';
import PlantsPage from './pages/PlantsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RefreshKeyProvider>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas autenticadas dentro del layout con sidebar */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/upload"       element={<UploadPage />} />
              <Route path="/galeria"      element={<GaleriaPage />} />
              <Route path="/galeria/:idMedicion" element={<MedicionDetailPage />} />
              <Route path="/reportes"     element={<ReportsPage />} />
              <Route path="/plantas"      element={<PlantsPage />} />
              <Route path="/usuarios"     element={<UsersPage />} />
              <Route path="/perfil"       element={<ProfilePage />} />
              <Route path="/configuracion" element={<PlaceholderPage titulo="Configuración" />} />
            </Route>

            {/* / y cualquier ruta desconocida redirigen al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </RefreshKeyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
