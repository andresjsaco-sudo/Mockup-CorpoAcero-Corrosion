import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión activa, ir directo al dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px 16px',
    }}>

      {/* Card de login */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>

        {/* Franja superior con acento */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, var(--accent-amber), var(--accent-orange))`,
        }} />

        <div style={{ padding: '36px 36px 40px' }}>

          {/* Logo + título */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56,
              height: 56,
              background: 'var(--accent-amber)',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="10" width="24" height="5" rx="1" fill="white" opacity="0.95"/>
                <rect x="4" y="17" width="24" height="5" rx="1" fill="white" opacity="0.7"/>
                <rect x="4" y="24" width="24" height="4" rx="1" fill="white" opacity="0.45"/>
                <path d="M4 10L16 5L28 10" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.9"/>
              </svg>
            </div>

            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Corpacero
              <span style={{ fontWeight: 400, fontSize: 15, color: 'var(--text-muted)', marginLeft: 5 }}>S.A.S</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              fontSize: 13,
              color: 'var(--accent-amber)',
              marginTop: 2,
            }}>
              Detección de Corrosión · CorrIA
            </div>
            <div style={{
              fontFamily: 'var(--font-data)',
              fontSize: 10,
              color: 'var(--text-faint)',
              marginTop: 6,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Universidad del Norte · Ing. Mecánica &amp; Electrónica
            </div>
          </div>

          {/* Separador */}
          <div style={{
            height: 1,
            background: 'var(--border)',
            marginBottom: 28,
          }} />

          {/* Formulario */}
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@corpacero.com"
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.3)',
                borderLeft: '3px solid var(--accent-red)',
                borderRadius: '0 6px 6px 0',
                marginBottom: 18,
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--accent-red)',
                lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                background: submitting ? 'var(--bg-inset)' : 'var(--accent-amber)',
                border: 'none',
                borderRadius: 8,
                color: submitting ? 'var(--text-muted)' : 'white',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.03em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, opacity 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid var(--border)',
                    borderTopColor: 'var(--accent-amber)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Verificando…
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Nota de acceso */}
          <p style={{
            marginTop: 20,
            textAlign: 'center',
            fontFamily: 'var(--font-data)',
            fontSize: 10,
            color: 'var(--text-faint)',
            letterSpacing: '0.06em',
          }}>
            Acceso restringido · Solo usuarios autorizados
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
