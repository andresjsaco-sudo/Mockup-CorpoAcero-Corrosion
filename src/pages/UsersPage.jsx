import React, { useState, useMemo, useEffect } from 'react';
import { Users, Plus, Edit2, ToggleLeft, ToggleRight, X, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { useGestionUsuarios } from '../hooks/useUsuarios';
import { useAuth } from '../auth/AuthContext';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[70, 85, 55, 60, 50].map((w, i) => (
        <td key={i} style={{ padding: '10px 14px' }}>
          <div style={{ height: 13, borderRadius: 4, background: 'var(--border)', width: `${w}%`, animation: 'shimmer 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Role badge ──────────────────────────────────────────────────────────────
const ROL_STYLES = {
  admin:   { bg: 'rgba(37,99,235,0.12)',  color: '#2563eb',  label: 'Administrador' },
  tecnico: { bg: 'rgba(59,130,246,0.10)', color: '#3b82f6',  label: 'Técnico' },
  cliente: { bg: 'rgba(100,116,139,0.1)', color: '#64748b',  label: 'Cliente' },
};

function RolBadge({ rol }) {
  const s = ROL_STYLES[rol] ?? ROL_STYLES.cliente;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      fontFamily: 'var(--font-data)',
    }}>
      {s.label}
    </span>
  );
}

// ─── Modal wrapper ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-page)',
  color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 13,
  boxSizing: 'border-box',
};

// ─── Formulario de usuario ────────────────────────────────────────────────────
function UsuarioForm({ initial = {}, isEdit, onSubmit, saving, error }) {
  const [form, setForm] = useState({
    email: initial.email ?? '',
    nombre: initial.nombre ?? initial.name ?? '',
    rol: initial.rol ?? initial.role ?? 'tecnico',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Al crear, el backend genera y envía la contraseña temporal automáticamente
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 5 }}>
          Correo electrónico *
        </label>
        <input
          type="email" required value={form.email} onChange={set('email')}
          disabled={isEdit} style={{ ...inputStyle, opacity: isEdit ? 0.6 : 1, cursor: isEdit ? 'not-allowed' : 'text' }}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 5 }}>
          Nombre completo
        </label>
        <input value={form.nombre} onChange={set('nombre')} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 5 }}>
          Rol *
        </label>
        <select value={form.rol} onChange={set('rol')} style={inputStyle}>
          <option value="admin">Administrador</option>
          <option value="tecnico">Técnico</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, color: '#dc2626', fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving} style={{
          padding: '8px 20px', background: 'var(--accent-amber)', border: 'none',
          borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'white',
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, maxWidth: 360, width: '100%', padding: '24px 20px',
      }}>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{
            padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)',
          }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            padding: '7px 16px', background: '#dc2626', border: 'none',
            borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'white',
            opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast simple ─────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 600,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderLeft: '3px solid #16a34a', borderRadius: 8,
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-primary)',
    }}>
      <Check size={14} color="#16a34a" />
      {message}
    </div>
  );
}

// ─── UsersPage ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.groups?.includes('admin');

  const { usuarios, loading, mutating, mutError, crearUsuario, editarUsuario, deshabilitarUsuario, habilitarUsuario } = useGestionUsuarios();
  const [search, setSearch] = useState('');
  const [editUsuario, setEditUsuario] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null); // { usuario, newEstado }
  const [formError, setFormError] = useState(null);
  const [toast, setToast] = useState(null); // mensaje del toast de éxito

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return usuarios.filter(u =>
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.nombre ?? u.name ?? '').toLowerCase().includes(q)
    );
  }, [usuarios, search]);

  const handleCreate = async (payload) => {
    setFormError(null);
    try {
      await crearUsuario(payload);
      setShowCreate(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleEdit = async (payload) => {
    setFormError(null);
    try {
      await editarUsuario(editUsuario.id_usuario ?? editUsuario.email, payload);
      setEditUsuario(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const id = confirmToggle.usuario.id_usuario ?? confirmToggle.usuario.email;
    const habilitar = confirmToggle.newEstado;
    try {
      if (habilitar) {
        await habilitarUsuario(id);
        setToast('Usuario reactivado correctamente.');
      } else {
        await deshabilitarUsuario(id);
        setToast('Usuario deshabilitado correctamente.');
      }
      setConfirmToggle(null);
    } catch { /* mutError maneja la visualización del error */ }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div style={{ padding: 24 }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'var(--accent-amber)', width: 3, height: 20, borderRadius: 2, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Gestión de usuarios
            </span>
          </div>
          {isAdmin && (
            <button onClick={() => { setShowCreate(true); setFormError(null); }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', background: 'var(--accent-amber)', border: 'none',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, color: 'white',
            }}>
              <Plus size={14} /> Nuevo usuario
            </button>
          )}
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)', fontSize: 13, width: '100%',
              maxWidth: 340, boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error mutación */}
        {mutError && (
          <div style={{ padding: '8px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, color: '#dc2626', fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> {mutError}
          </div>
        )}

        {/* Tabla */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-ui)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-page)' }}>
                  {['Usuario', 'Correo', 'Rol', 'Estado', isAdmin ? 'Acciones' : ''].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map(u => {
                      const habilitado = u.habilitado !== false && u.estado !== 'disabled';
                      const rolKey = u.rol ?? u.role ?? u.grupos?.[0] ?? 'cliente';
                      return (
                        <tr key={u.id_usuario ?? u.email} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.nombre ?? u.name ?? '—'}</div>
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td style={{ padding: '10px 14px' }}><RolBadge rol={rolKey} /></td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                              background: habilitado ? 'rgba(22,163,74,0.08)' : 'rgba(100,116,139,0.1)',
                              color: habilitado ? '#16a34a' : '#64748b',
                            }}>
                              {habilitado ? <Check size={11} /> : null}
                              {habilitado ? 'Activo' : 'Deshabilitado'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => { setEditUsuario(u); setFormError(null); }}
                                  title="Editar"
                                  style={{ padding: '5px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => setConfirmToggle({ usuario: u, newEstado: !habilitado })}
                                  title={habilitado ? 'Deshabilitar' : 'Reactivar'}
                                  style={{ padding: '5px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', color: habilitado ? '#dc2626' : '#16a34a', display: 'flex' }}
                                >
                                  {habilitado ? <ToggleRight size={14} /> : <RefreshCw size={14} />}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                }
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={isAdmin ? 5 : 4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
                    {search ? 'Sin resultados para la búsqueda' : 'No hay usuarios registrados'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal: Editar usuario ── */}
      {editUsuario && (
        <Modal title={`Editar usuario`} onClose={() => setEditUsuario(null)}>
          <UsuarioForm initial={editUsuario} isEdit onSubmit={handleEdit} saving={mutating} error={formError} />
        </Modal>
      )}

      {/* ── Modal: Crear usuario ── */}
      {showCreate && (
        <Modal title="Nuevo usuario" onClose={() => setShowCreate(false)}>
          <UsuarioForm onSubmit={handleCreate} saving={mutating} error={formError} />
        </Modal>
      )}

      {/* ── Confirm: toggle estado ── */}
      {confirmToggle && (
        <ConfirmDialog
          message={
            confirmToggle.newEstado
              ? `¿Reactivar a ${confirmToggle.usuario.email}?`
              : `¿Deshabilitar a ${confirmToggle.usuario.email}?`
          }
          onConfirm={handleToggle}
          onCancel={() => setConfirmToggle(null)}
          loading={mutating}
        />
      )}

      {/* ── Toast de éxito ── */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
