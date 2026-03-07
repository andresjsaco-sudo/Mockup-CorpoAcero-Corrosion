import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import KPIBar from './components/KPIBar';
import ColombiaMap from './components/ColombiaMap';
import PlantDetail from './components/PlantDetail';
import AlertsPanel from './components/AlertsPanel';
import ChartsRow from './components/ChartsRow';
import {
  PLANTS,
  generatePlantStatus,
  generateTrendData,
  generateAlerts,
} from './data/simulation';

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

export default function App() {
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-void)',
    }}>
      <Header
        alertCount={alertCount}
        criticalCount={criticalCount}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <KPIBar plantsData={plantsData} />

      {/* Main grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gridTemplateRows: 'minmax(420px, 1fr)',
        gap: 1,
        background: 'var(--border)',
        minHeight: 0,
      }}>
        {/* Left: Map + Plant Detail */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 1,
          background: 'var(--border)',
        }}>
          {/* Map */}
          <div style={{ minHeight: 420 }}>
            {leafletReady ? (
              <ColombiaMap
                plantsData={plantsData}
                selectedPlant={selectedPlant}
                onSelectPlant={setSelectedPlant}
              />
            ) : (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--bg-card)',
                color: 'var(--text-muted)', fontSize: 11,
              }}>
                Cargando mapa...
              </div>
            )}
          </div>

          {/* Plant Detail */}
          <PlantDetail
            plant={selectedPlant}
            trendData={selectedPlant ? trendData[selectedPlant.id] || [] : []}
          />
        </div>

        {/* Right: Alerts */}
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Charts row */}
      <ChartsRow plantsData={plantsData} />

      {/* Footer */}
      <div style={{
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 9,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
      }}>
        <span>DETECCIÓN DE CORROSIÓN — CORPOACERO S.A.S © 2025</span>
        <span>UNINORTE · ING. MECÁNICA & ELECTRÓNICA · PROYECTO DE GRADO</span>
        <span>MODELO: YOLOv8 TRANSFER LEARNING · NORMA: ASTM B117 · REFRESH: 30s</span>
      </div>

      {/* Toast notifications — BOTTOM LEFT */}
      <div style={{
        position: 'fixed', bottom: 40, left: 24,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: 'var(--bg-panel)',
            border: '1px solid #dc2626',
            borderLeft: '4px solid #dc2626',
            padding: '12px 16px',
            maxWidth: 340,
            boxShadow: '0 4px 20px rgba(220,38,38,0.2)',
            animation: 'slide-in-left 0.3s ease forwards',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#dc2626',
              letterSpacing: '0.12em', marginBottom: 4,
              animation: 'blink 0.8s ease-in-out infinite',
            }}>
              🚨 ALERTA CRÍTICA — {toast.plant.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
