import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RefreshKeyProvider } from './hooks/RefreshKeyContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';

// Raíz: configura el router, el provider de auth y el provider de refresco global
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RefreshKeyProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            {/* / redirige a /dashboard (ProtectedRoute se encarga de /login si no hay sesión) */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </RefreshKeyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
