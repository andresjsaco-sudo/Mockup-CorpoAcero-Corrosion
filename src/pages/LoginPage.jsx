import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Valida requisitos mínimos de contraseña según política de Cognito
function validarContraseña(pw) {
  if (pw.length < 8) return 'Mínimo 8 caracteres.';
  if (!/[A-Z]/.test(pw)) return 'Debe incluir al menos una mayúscula.';
  if (!/[0-9]/.test(pw)) return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Debe incluir al menos un símbolo.';
  return null;
}

const inputStyle = {
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
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-data)',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

export default function LoginPage() {
  const { login, confirmNewPassword, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Paso 1: login inicial
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Paso 2: nueva contraseña (challenge NEW_PASSWORD_REQUIRED)
  const [step, setStep] = useState('login'); // 'login' | 'nueva-contrasena'
  const [nuevaPw, setNuevaPw] = useState('');
  const [confirmarPw, setConfirmarPw] = useState('');

  // Si ya hay sesión activa, ir directo al dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result?.needsNewPassword) {
        // Cognito requiere cambio de contraseña en el primer ingreso
        setStep('nueva-contrasena');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNuevaContraseña(e) {
    e.preventDefault();
    setError('');

    const validacion = validarContraseña(nuevaPw);
    if (validacion) { setError(validacion); return; }
    if (nuevaPw !== confirmarPw) { setError('Las contraseñas no coinciden.'); return; }

    setSubmitting(true);
    try {
      await confirmNewPassword(nuevaPw);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Bloque visual compartido ────────────────────────────────────────────────
  const card = (
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
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

        {/* ── Paso 1: formulario de login ── */}
        {step === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@corpacero.com"
                required
                disabled={submitting}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={submitting}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && <ErrorBanner message={error} />}

            <SubmitButton submitting={submitting} label="Ingresar" />
          </form>
        )}

        {/* ── Paso 2: establecer nueva contraseña ── */}
        {step === 'nueva-contrasena' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}>
                Crea tu contraseña
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}>
                Es tu primer ingreso. Debes establecer una contraseña nueva.
              </div>
            </div>

            <form onSubmit={handleNuevaContraseña}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  type="password"
                  value={nuevaPw}
                  onChange={e => setNuevaPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                  autoFocus
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={confirmarPw}
                  onChange={e => setConfirmarPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={submitting}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-amber)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Requisitos de contraseña */}
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-inset)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                marginBottom: 18,
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                color: 'var(--text-faint)',
                lineHeight: 1.7,
              }}>
                Mínimo 8 caracteres · Una mayúscula · Un número · Un símbolo
              </div>

              {error && <ErrorBanner message={error} />}

              <SubmitButton submitting={submitting} label="Establecer contraseña" />
            </form>
          </>
        )}

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
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px 16px',
    }}>
      {card}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Sub-componentes locales ──────────────────────────────────────────────────

function ErrorBanner({ message }) {
  return (
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
      {message}
    </div>
  );
}

function SubmitButton({ submitting, label }) {
  return (
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
      ) : label}
    </button>
  );
}
