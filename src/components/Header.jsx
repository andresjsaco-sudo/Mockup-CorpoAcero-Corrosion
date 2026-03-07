import React, { useState, useEffect } from 'react';

export default function Header({ alertCount, criticalCount, darkMode, onToggleDark }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      background: 'var(--bg-panel)',
      borderBottom: '2px solid var(--border)',
      padding: '0 24px',
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-card)',
    }}>

      {/* LEFT: Corpoacero Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Corpoacero Logo Mark */}
        <div style={{
          width: 48, height: 48,
          background: 'var(--accent-amber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Steel plate / layers icon */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="10" width="24" height="5" rx="1" fill="white" opacity="0.95"/>
            <rect x="4" y="17" width="24" height="5" rx="1" fill="white" opacity="0.7"/>
            <rect x="4" y="24" width="24" height="4" rx="1" fill="white" opacity="0.45"/>
            <path d="M4 10 L16 5 L28 10" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.9"/>
          </svg>
          {/* Alert dot */}
          {criticalCount > 0 && (
            <div style={{
              position: 'absolute', top: -3, right: -3,
              width: 10, height: 10,
              background: '#dc2626',
              borderRadius: '50%',
              border: '2px solid var(--bg-panel)',
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Brand text */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}>
            CORPOACERO
            <span style={{
              fontSize: 11, fontWeight: 400,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              marginLeft: 6,
            }}>S.A.S</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--accent-amber)',
            letterSpacing: '0.08em',
            marginTop: 1,
          }}>
            Detección de Corrosión
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1, height: 36,
          background: 'var(--border)',
          marginLeft: 8,
        }} />

        {/* System name */}
        <div>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            lineHeight: 1.3,
          }}>
            Sistema IoT · IA Anticorrosión
          </div>
          <div style={{
            fontSize: 10, color: 'var(--text-muted)',
            letterSpacing: '0.12em', opacity: 0.7,
          }}>
            Universidad del Norte · Ing. Mecánica & Electrónica
          </div>
        </div>
      </div>

      {/* CENTER: Status pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusPill color="#16a34a" label="SISTEMA ACTIVO" />
        <StatusPill color="#0284c7" label="EDGE: ONLINE" />
        <StatusPill color="#d97706" label={`${alertCount} ALERTAS`} blink={alertCount > 0} />
        {criticalCount > 0 && (
          <StatusPill color="#dc2626" label={`${criticalCount} CRÍTICOS`} blink />
        )}
      </div>

      {/* RIGHT: Dark mode toggle + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Theme toggle */}
        <button
          onClick={onToggleDark}
          title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 14 }}>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? 'CLARO' : 'OSCURO'}</span>
        </button>

        {/* Clock */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--accent-amber)',
            letterSpacing: '0.08em',
          }}>
            {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            {time.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ color, label, blink = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      border: `1px solid ${color}40`,
      background: `${color}12`,
      borderRadius: 3,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color,
        animation: blink ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 10, fontWeight: 700,
        color, letterSpacing: '0.1em',
      }}>{label}</span>
    </div>
  );
}
