import React, { useEffect, useRef } from 'react';
import { getStatusColor, getStatusLabel } from '../data/simulation';

export default function ColombiaMap({ plantsData, selectedPlant, onSelectPlant }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [6.5, -74.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    plantsData.forEach(plant => {
      const worstSeverity = Math.max(...plant.zones.map(z => z.worstSeverity));
      const status = ['OK', 'EARLY', 'MODERATE', 'CRITICAL'][worstSeverity];
      const color = getStatusColor(status);
      const isSelected = selectedPlant?.id === plant.id;
      const isCritical = worstSeverity >= 3;

      const iconHtml = `
        <div style="position:relative;width:${isSelected ? 52 : 40}px;height:${isSelected ? 52 : 40}px;cursor:pointer;">
          ${isCritical ? `<div style="
            position:absolute;inset:0;border-radius:50%;
            border:2px solid ${color};
            animation:ping-ring 1.4s ease-out infinite;
          "></div>` : ''}
          <div style="
            position:absolute;inset:${isSelected ? 2 : 4}px;
            border-radius:50%;
            background:rgba(8,12,15,0.9);
            border:2px solid ${color};
            display:flex;align-items:center;justify-content:center;
            box-shadow: 0 0 ${isSelected ? 20 : 12}px ${color}60;
            transition: all 0.2s;
          ">
            <svg width="${isSelected ? 18 : 14}" height="${isSelected ? 18 : 14}" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" opacity="0.9"/>
              <circle cx="12" cy="9" r="2.5" fill="#080c0f"/>
            </svg>
          </div>
          <div style="
            position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);
            background:rgba(8,12,15,0.95);
            border:1px solid ${color}60;
            padding:2px 6px;
            font-family:monospace;font-size:9px;
            color:${color};
            white-space:nowrap;
            letter-spacing:0.1em;
          ">${plant.id}${plant.isHQ ? '·HQ' : ''}</div>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [isSelected ? 52 : 40, isSelected ? 52 : 40],
        iconAnchor: [isSelected ? 26 : 20, isSelected ? 26 : 20],
      });

      const marker = L.marker([plant.lat, plant.lng], { icon })
        .addTo(mapInstanceRef.current)
        .on('click', () => onSelectPlant(plant));

      // Tooltip
      const allPlates = plant.zones.flatMap(z => z.plates);
      const critCount = allPlates.filter(p => p.status === 'CRITICAL').length;
      const tooltipHtml = `
        <div style="
          background:#0d1419;border:1px solid ${color}60;
          padding:10px 14px;min-width:180px;
          font-family:monospace;font-size:11px;
        ">
          <div style="color:${color};font-weight:700;font-size:13px;margin-bottom:6px;letter-spacing:0.08em;">
            ${plant.name} ${plant.isHQ ? '★ HQ' : ''}
          </div>
          <div style="color:#7a9ab5;font-size:9px;letter-spacing:0.1em;margin-bottom:8px;">${plant.label}</div>
          <div style="display:flex;justify-content:space-between;color:#e2eaf2;">
            <span>Estado:</span>
            <span style="color:${color}">${getStatusLabel(status)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#e2eaf2;margin-top:4px;">
            <span>Placas:</span>
            <span>${allPlates.length}</span>
          </div>
          ${critCount > 0 ? `<div style="
            margin-top:8px;padding:4px 8px;
            background:rgba(239,68,68,0.15);
            border-left:2px solid #ef4444;
            color:#ef4444;font-size:10px;
          ">${critCount} PLACA(S) CRÍTICA(S)</div>` : ''}
        </div>
      `;

      marker.bindTooltip(L.tooltip({
        direction: 'top', offset: [0, -24],
        className: 'custom-tooltip', permanent: false,
      }).setContent(tooltipHtml));

      markersRef.current.push(marker);
    });
  }, [plantsData, selectedPlant]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700, fontSize: 13,
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
          }}>MAPA DE PLANTA — COLOMBIA</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>
            {plantsData.length} INSTALACIONES MONITOREADAS · TIEMPO REAL
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { color: '#22c55e', label: 'OK' },
            { color: '#f59e0b', label: 'Temprana' },
            { color: '#f97316', label: 'Moderada' },
            { color: '#ef4444', label: 'Crítica' },
          ].map(({ color, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 9, color, letterSpacing: '0.1em',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              {label.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
