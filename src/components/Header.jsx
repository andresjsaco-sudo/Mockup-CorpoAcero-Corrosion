import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Mapeo de grupos Cognito a etiquetas legibles
const ROL_LABELS = {
  admin: 'Administrador',
  tecnico: 'Técnico',
  cliente: 'Cliente',
};

function getUserRole(groups = []) {
  if (groups.includes('admin')) return 'admin';
  if (groups.includes('tecnico')) return 'tecnico';
  if (groups.includes('cliente')) return 'cliente';
  return null;
}

// Genera iniciales del nombre o email del usuario
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Header({ alertCount, criticalCount, darkMode, onToggleDark, user, onLogout }) {
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

      {/* RIGHT: Toggle + Clock + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Botón nueva medición — visible para todos los roles */}
        <Link
          to="/upload"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'var(--accent-amber)',
            border: 'none', borderRadius: 7,
            color: 'white', textDecoration: 'none',
            fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 600,
            letterSpacing: '0.02em', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nueva medición
        </Link>

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

        {/* Dropdown de usuario */}
        {user && (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px 6px 6px',
                background: dropdownOpen ? 'var(--bg-card-hover)' : 'var(--bg-inset)',
                border: '1px solid var(--border)', borderRadius: 8,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              {/* Avatar con iniciales */}
              <div style={{
                width: 30, height: 30,
                background: 'var(--accent-amber)',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-data)', fontWeight: 700,
                fontSize: 12, color: 'white', flexShrink: 0,
              }}>
                {getInitials(user.name || user.email)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600,
                  fontSize: 12, color: 'var(--text-primary)',
                  maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.name || user.email}
                </div>
                {getUserRole(user.groups) && (
                  <div style={{
                    fontFamily: 'var(--font-data)', fontSize: 10,
                    color: 'var(--accent-amber)', letterSpacing: '0.06em',
                  }}>
                    {ROL_LABELS[getUserRole(user.groups)]}
                  </div>
                )}
              </div>
              {/* Chevron */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ flexShrink: 0, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Menú desplegable */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
                minWidth: 180,
                zIndex: 2000,
                overflow: 'hidden',
                animation: 'fade-in-up 0.15s ease forwards',
              }}>
                {/* Info del usuario */}
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 600,
                    fontSize: 13, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontSize: 11,
                    color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {user.email}
                  </div>
                </div>

                {/* Botón cerrar sesión */}
                <button
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'transparent', border: 'none',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-ui)', fontSize: 13,
                    color: 'var(--accent-red)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
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
