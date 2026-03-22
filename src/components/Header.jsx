import React, { useState, useEffect } from 'react';

export default function Header({ alertCount, criticalCount, darkMode, onToggleDark }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '2px solid var(--border)',
      padding: '0 20px',
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-md)',
      gap: 16,
    }}>

      {/* LEFT: Logo + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{
          width: 44, height: 44,
          background: 'var(--accent-amber)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative',
          boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
        }}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="10" width="24" height="5" rx="1" fill="white" opacity="0.95"/>
            <rect x="4" y="17" width="24" height="5" rx="1" fill="white" opacity="0.7"/>
            <rect x="4" y="24" width="24" height="4" rx="1" fill="white" opacity="0.45"/>
            <path d="M4 10L16 5L28 10" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.9"/>
          </svg>
          {criticalCount > 0 && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 12, height: 12, background: 'var(--accent-red)',
              borderRadius: '50%', border: '2px solid var(--bg-card)',
              animation: 'pulse-dot 1.2s ease-in-out infinite',
            }} />
          )}
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18,
            color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.01em',
          }}>
            Corpacero
            <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-muted)', marginLeft: 5 }}>S.A.S</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 12,
            color: 'var(--accent-amber)', letterSpacing: '0.02em',
          }}>
            Detección de Corrosión
          </div>
        </div>

        <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0, marginLeft: 4 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
            Sistema IoT · IA Anticorrosión
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-ui)' }}>
            Universidad del Norte · Ing. Mecánica & Electrónica
          </span>
        </div>
      </div>

      {/* CENTER: Status pills */}
      <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <StatusPill color="var(--accent-green)" label="Sistema Activo" />
        <StatusPill color="var(--accent-blue)" label="Edge: Online" />
        <StatusPill color="var(--accent-amber)" label={`${alertCount} Alertas`} blink={alertCount > 0} />
        {criticalCount > 0 && (
          <StatusPill color="var(--accent-red)" label={`${criticalCount} Críticos`} blink />
        )}
      </div>

      {/* RIGHT: Toggle + Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={onToggleDark}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', background: 'var(--bg-inset)',
            border: '1px solid var(--border)', borderRadius: 6,
            cursor: 'pointer', color: 'var(--text-secondary)',
            fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 500,
            transition: 'all 0.15s',
          }}
        >
          <span>{darkMode ? 'Claro' : 'Oscuro'}</span>
        </button>

        <div style={{ textAlign: 'right' }} className="header-right-clock">
          <div style={{
            fontFamily: 'var(--font-data)', fontSize: 17, fontWeight: 600,
            color: 'var(--accent-amber)', letterSpacing: '0.05em',
          }}>
            {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-ui)' }}>
            {time.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ color, label, blink = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      border: `1px solid ${color}35`,
      background: `${color}12`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0,
        animation: blink ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, fontWeight: 500, color, fontFamily: 'var(--font-ui)' }}>{label}</span>
    </div>
  );
}
