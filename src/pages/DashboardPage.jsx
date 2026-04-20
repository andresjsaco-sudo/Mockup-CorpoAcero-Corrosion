import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import KPIBar from '../components/KPIBar';
import ColombiaMap from '../components/ColombiaMap';
import PlantDetail from '../components/PlantDetail';
import AlertsPanel from '../components/AlertsPanel';
import ChartsRow from '../components/ChartsRow';
import { useAuth } from '../auth/AuthContext';
import {
  PLANTS,
  generatePlantStatus,
  generateTrendData,
  generateAlerts,
} from '../data/simulation';

// Leaflet requires window.L — load it via CDN
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
  const leafletReady = useLeaflet();
  const [tick, setTick] = useState(0);
  const [plantsData, setPlantsData] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [trendData, setTrendData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const prevAlertsRef = useRef([]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Simulate data
  const simulate = useCallback((t) => {
    const data = PLANTS.map(p => generatePlantStatus(p, t));
    setPlantsData(data);

    setSelectedPlant(prev =>
      prev ? data.find(p => p.id === prev.id) || null : null
    );

    // Pass current tick so trend is monotonically increasing
    const trends = {};
    PLANTS.forEach(p => { trends[p.id] = generateTrendData(p.id, t); });
    setTrendData(trends);

    const newAlerts = generateAlerts(data);
    setAlerts(newAlerts);

    // Toast notifications for new critical alerts
    const prevIds = new Set(prevAlertsRef.current.map(a => a.id));
    const freshCritical = newAlerts.filter(a => a.status === 'CRITICAL' && !prevIds.has(a.id));
    if (freshCritical.length > 0 && t > 0) {
      const toast = {
        id: Date.now(),
        message: freshCritical[0].message,
        plant: freshCritical[0].plantName,
      };
      setToasts(prev => [toast, ...prev].slice(0, 3));
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== toast.id)), 6000);
    }
    prevAlertsRef.current = newAlerts;
  }, []);

  useEffect(() => {
    simulate(0);
    const interval = setInterval(() => {
      setTick(t => {
        const next = t + 1;
        simulate(next);
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [simulate]);

  const alertCount = alerts.length;
  const criticalCount = alerts.filter(a => a.status === 'CRITICAL').length;

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
        <KPIBar plantsData={plantsData} />
      </div>

      {/* ── MAIN PANEL ─── */}
      <div
        className="main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 0,
          height: 540,        /* fixed height — columns never grow beyond this */
          minHeight: 0,
        }}
      >
        {/* Left column: Map + Plant Detail side by side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          borderRight: '1px solid var(--border)',
          height: '100%',
          minHeight: 0,
        }}>
          {/* Map section */}
          <div className="section-map" style={{
            borderRight: '1px solid var(--border)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            minHeight: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                background: 'var(--accent-blue)',
                width: 3, height: 16, borderRadius: 2, flexShrink: 0,
                display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
              }}>Mapa de Instalaciones</span>
            </div>
            <div style={{ flex: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', minHeight: 0 }}>
              {leafletReady ? (
                <ColombiaMap plantsData={plantsData} selectedPlant={selectedPlant} onSelectPlant={setSelectedPlant} />
              ) : (
                <div style={{
                  height: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13,
                }}>Cargando mapa…</div>
              )}
            </div>
          </div>

          {/* Plant Detail section */}
          <div className="section-detail" style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{
                background: 'var(--accent-amber)',
                width: 3, height: 16, borderRadius: 2, flexShrink: 0,
                display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
              }}>Detalle de Planta</span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <PlantDetail
                plant={selectedPlant}
                trendData={selectedPlant ? trendData[selectedPlant.id] || [] : []}
              />
            </div>
          </div>
        </div>

        {/* Alerts section — independent scroll, never stretches the row */}
        <div className="section-alerts" style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{
              background: 'var(--accent-red)',
              width: 3, height: 16, borderRadius: 2, flexShrink: 0,
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>Centro de Alertas</span>
          </div>
          {/* This div is the scroll container */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ─── */}
      <div className="section-charts" style={{ borderTop: '2px solid var(--border)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            background: 'var(--accent-green)',
            width: 3, height: 16, borderRadius: 2,
            display: 'inline-block',
          }} />
          <span style={{
            fontFamily: 'var(--font-data)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>Análisis y Métricas</span>
        </div>
        <ChartsRow plantsData={plantsData} />
      </div>

      {/* ── FOOTER ─── */}
      <div style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: 11,
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-data)',
      }}>
        <span>Detección de Corrosión — Corpacero S.A.S © 2025</span>
        <span>Uninorte · Ing. Mecánica &amp; Electrónica</span>
        <span>YOLOv8 Transfer Learning · ASTM B117 · Refresh: 30s</span>
      </div>

      {/* ── TOASTS bottom-left ─── */}
      <div style={{
        position: 'fixed', bottom: 24, left: 20,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
        maxWidth: 340,
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-red)',
            borderLeft: '4px solid var(--accent-red)',
            borderRadius: '0 6px 6px 0',
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(220,38,38,0.18)',
            animation: 'slide-in-left 0.3s ease forwards',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--accent-red)',
              letterSpacing: '0.08em', marginBottom: 4,
              animation: 'blink 0.9s ease-in-out infinite',
              fontFamily: 'var(--font-data)',
            }}>
              🚨 Alerta Crítica — {toast.plant}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
