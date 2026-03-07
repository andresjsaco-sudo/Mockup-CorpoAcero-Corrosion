import React, { useState } from 'react';
import { getStatusColor, getStatusBg } from '../data/simulation';

export default function AlertsPanel({ alerts }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.status === filter);
  const critical = alerts.filter(a => a.status === 'CRITICAL').length;
  const moderate = alerts.filter(a => a.status === 'MODERATE').length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        background: critical > 0 ? 'rgba(239,68,68,0.05)' : 'transparent',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.1em', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              CENTRO DE ALERTAS
              {critical > 0 && (
                <span style={{
                  background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444',
                  fontSize: 10, color: '#ef4444', padding: '1px 6px',
                  animation: 'blink 1s ease-in-out infinite',
                }}>
                  {critical} CRÍTICO
                </span>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>
              {alerts.length} EVENTOS ACTIVOS · NORMA ASTM B117
            </div>
          </div>
          {/* Siren icon */}
          {critical > 0 && (
            <div style={{
              fontSize: 22,
              animation: 'blink 0.8s ease-in-out infinite',
            }}>🚨</div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'ALL', label: 'TODOS', count: alerts.length },
            { key: 'CRITICAL', label: 'CRÍTICO', count: critical, color: '#ef4444' },
            { key: 'MODERATE', label: 'MODERADO', count: moderate, color: '#f97316' },
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '3px 10px',
                background: filter === key ? (color ? `${color}20` : 'var(--border)') : 'transparent',
                border: `1px solid ${filter === key ? (color || 'var(--border-bright)') : 'var(--border)'}`,
                color: filter === key ? (color || 'var(--text-primary)') : 'var(--text-muted)',
                fontSize: 9, fontFamily: 'var(--font-data)',
                letterSpacing: '0.1em', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%',
            color: 'var(--text-muted)', gap: 8,
          }}>
            <div style={{ fontSize: 24 }}>✓</div>
            <div style={{ fontSize: 11, letterSpacing: '0.12em' }}>SIN ALERTAS ACTIVAS</div>
          </div>
        ) : (
          filtered.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, index }) {
  const sc = getStatusColor(alert.status);
  const isCritical = alert.status === 'CRITICAL';
  const timeStr = alert.time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const dateStr = alert.time.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

  return (
    <div style={{
      padding: '10px 12px',
      background: getStatusBg(alert.status),
      border: `1px solid ${sc}40`,
      borderLeft: `3px solid ${sc}`,
      animation: `fade-in-up 0.3s ease ${index * 0.04}s both`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isCritical && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${sc}, transparent)`,
          animation: 'shimmer 2s linear infinite',
          backgroundSize: '200% 100%',
        }} />
      )}

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', align: 'center', gap: 6 }}>
          <span style={{
            fontWeight: 700, fontSize: 10, color: sc,
            letterSpacing: '0.12em',
            animation: isCritical ? 'blink 1s ease-in-out infinite' : 'none',
          }}>
            ● {alert.status}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
            {alert.plantName} › {alert.zone.split(' - ')[0]}
          </span>
        </div>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {dateStr} {timeStr}
        </span>
      </div>

      {/* Message */}
      <div style={{
        fontSize: 11, color: 'var(--text-secondary)',
        lineHeight: 1.4, marginBottom: 6,
      }}>
        {alert.message}
      </div>

      {/* Corrosion bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, alert.corrosionPct * 1.5)}%`,
            background: `linear-gradient(90deg, ${sc}80, ${sc})`,
            borderRadius: 2,
            boxShadow: isCritical ? `0 0 8px ${sc}` : 'none',
          }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-data)', fontWeight: 700,
          fontSize: 12, color: sc, flexShrink: 0,
        }}>
          {alert.corrosionPct}%
        </span>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 6, display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em',
      }}>
        <span>ID: {alert.plateId}</span>
        <span>YOLOv8 · ASTM B117</span>
      </div>
    </div>
  );
}
