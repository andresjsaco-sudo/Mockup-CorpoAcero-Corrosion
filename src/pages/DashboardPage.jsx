import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import KPIBar from '../components/KPIBar';
import ColombiaMap from '../components/ColombiaMap';
import PlantDetail from '../components/PlantDetail';
import AlertsPanel from '../components/AlertsPanel';
import ChartsRow from '../components/ChartsRow';
import { useAuth } from '../auth/AuthContext';
import { useAlertas } from '../hooks/useAlertas';

// Leaflet CSS y JS vía CDN (reutilizado en ColombiaMap)
function useLeaflet() {
  const [ready, setReady] = useState(!!window.L);
  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [selectedPunto, setSelectedPunto] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const leafletReady = useLeaflet();

  // Alertas para el badge del header
  const { alertas } = useAlertas();
  const alertCount = alertas.length;
  const criticalCount = alertas.filter(a => (a.nivel_corrosion ?? 0) === 3).length;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <Header
        alertCount={alertCount}
        criticalCount={criticalCount}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        user={user}
        onLogout={logout}
      />

      {/* ── KPI BAR ─── */}
      <div className="section-kpi" style={{ borderBottom: '1px solid var(--border)', padding: '16px 20px' }}>
        <KPIBar />
      </div>

      {/* ── MAIN PANEL ─── */}
      <div className="main-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 340px',
        gap: 0, height: 540, minHeight: 0,
      }}>
        {/* Left: Map + Plant Detail */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 320px',
          borderRight: '1px solid var(--border)', height: '100%', minHeight: 0,
        }}>
          {/* Mapa */}
          <div className="section-map" style={{
            borderRight: '1px solid var(--border)', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 8, height: '100%', minHeight: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ background: 'var(--accent-blue)', width: 3, height: 16, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Mapa de Instalaciones
              </span>
            </div>
            <div style={{ flex: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 0 }}>
              {leafletReady ? (
                <ColombiaMap selectedPunto={selectedPunto} onSelectPunto={setSelectedPunto} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Cargando mapa…
                </div>
              )}
            </div>
          </div>

          {/* Detalle de planta */}
          <div className="section-detail" style={{
            padding: '16px', display: 'flex', flexDirection: 'column',
            gap: 8, height: '100%', minHeight: 0, overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ background: 'var(--accent-amber)', width: 3, height: 16, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Detalle de Planta
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <PlantDetail punto={selectedPunto} />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="section-alerts" style={{
          padding: '16px', display: 'flex', flexDirection: 'column',
          gap: 8, height: '100%', minHeight: 0, overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ background: 'var(--accent-red)', width: 3, height: 16, borderRadius: 2, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Centro de Alertas
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <AlertsPanel />
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ─── */}
      <div className="section-charts" style={{ borderTop: '2px solid var(--border)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ background: 'var(--accent-green)', width: 3, height: 16, borderRadius: 2, display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Análisis y Métricas
          </span>
        </div>
        <ChartsRow />
      </div>

      {/* ── FOOTER ─── */}
      <div style={{
        background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-data)',
      }}>
        <span>Detección de Corrosión — Corpacero S.A.S © 2025</span>
        <span>Uninorte · Ing. Mecánica &amp; Electrónica</span>
        <span>YOLOv8 Transfer Learning · ASTM B117</span>
      </div>
    </div>
  );
}
