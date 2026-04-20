import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { useMedicion } from '../hooks/useMedicion';
import { useAuth } from '../auth/AuthContext';
import { nivelColor, nivelBg, nivelLabel, nivelToStatus } from '../lib/statusUtils';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import SegmentationOverlay from '../components/SegmentationOverlay';

// ─── Helper tiempo relativo ───────────────────────────────────────────────────
function tiempoRelativo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} días`;
}

// ─── Carga Leaflet via CDN ────────────────────────────────────────────────────
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

// ─── Mini mapa con la ubicación de la medición ───────────────────────────────
function MiniMapa({ lat, lng, latReal, lngReal }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const leafletReady = useLeaflet();

  useEffect(() => {
    if (!leafletReady || !lat || !lng || instanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [lat, lng], zoom: 13,
      zoomControl: false, attributionControl: false,
      scrollWheelZoom: false, dragging: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    // Marcador de la planta
    L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#d97706;border:2px solid white;box-shadow:0 0 8px #d9770680;"></div>`,
        className: '', iconSize: [12, 12], iconAnchor: [6, 6],
      }),
    }).addTo(map);

    // Marcador de la foto (si hay GPS exacto diferente al de la planta)
    if (latReal && lngReal && (Math.abs(latReal - lat) > 0.0001 || Math.abs(lngReal - lng) > 0.0001)) {
      L.marker([latReal, lngReal], {
        icon: L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#38bdf8;border:2px solid white;box-shadow:0 0 8px #38bdf880;"></div>`,
          className: '', iconSize: [10, 10], iconAnchor: [5, 5],
        }),
      }).addTo(map);
    }

    instanceRef.current = map;
  }, [leafletReady, lat, lng, latReal, lngReal]);

  if (!lat || !lng) {
    return (
      <div style={{
        height: 140, background: 'var(--bg-inset)', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 12, fontFamily: 'var(--font-data)' }}>
          Sin coordenadas
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} style={{
      height: 140, borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden',
    }} />
  );
}

// ─── Barra de progreso para porcentaje ───────────────────────────────────────
function BarraPorcentaje({ valor, color, max = 100 }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, (valor / max) * 100)}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: 5,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}50`,
        }} />
      </div>
      <div style={{
        textAlign: 'right', marginTop: 3,
        fontFamily: 'var(--font-data)', fontWeight: 700,
        fontSize: 13, color,
      }}>
        {(valor ?? 0).toFixed(1)}%
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MedicionDetailPage() {
  const { idMedicion } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { medicion, loading, error } = useMedicion(idMedicion);
  const [activeTab, setActiveTab] = useState('original');
  const [shareMsg, setShareMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = user?.groups?.includes('admin');

  // Volver a galería preservando filtros si vienen del state de navegación
  function handleBack() {
    const prevFilters = location.state?.filters;
    navigate('/galeria', prevFilters ? { state: prevFilters } : undefined);
  }

  async function handleDescargar() {
    if (!medicion?.url_imagen) return;
    const link = document.createElement('a');
    link.href = medicion.url_imagen;
    link.download = `medicion-${idMedicion}.jpg`;
    link.click();
  }

  async function handleCompartir() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMsg('Enlace copiado al portapapeles');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {
      setShareMsg('No se pudo copiar el enlace');
      setTimeout(() => setShareMsg(''), 2500);
    }
  }

  // ─── Loading / Error ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--border)',
          borderTopColor: 'var(--accent-amber)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--text-muted)' }}>
          Cargando medición…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !medicion) {
    return (
      <div style={{ padding: 32 }}>
        <button onClick={handleBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 13,
          marginBottom: 20, padding: 0,
        }}>
          <ArrowLeft size={16} /> Volver a galería
        </button>
        <div style={{
          padding: '32px 24px', background: 'var(--bg-card)',
          border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center',
        }}>
          <AlertCircle size={40} strokeWidth={1.5} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
            Medición no disponible
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
        </div>
      </div>
    );
  }

  const nivel = medicion.nivel_corrosion ?? 0;
  const color = nivelColor(nivel);
  const bg = nivelBg(nivel);
  const punto = medicion.punto_info ?? {};
  const lat = punto.coordenadas?.lat;
  const lng = punto.coordenadas?.lng;

  const TABS = [
    { key: 'original', label: 'Original' },
    { key: 'deteccion', label: 'Detección' },
    { key: 'segmentacion', label: 'Segmentación' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Botón volver */}
      <button onClick={handleBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 13,
        marginBottom: 20, padding: '6px 0', borderRadius: 6,
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} />
        Volver a galería
      </button>

      {/* Layout de dos columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ── Columna izquierda: imagen con tabs ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-inset)',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '12px 8px',
                  background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? `2px solid ${color}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: 13,
                  color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.13s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido del tab */}
          <div style={{ padding: 20 }}>
            {activeTab === 'original' && (
              medicion.url_imagen ? (
                <img
                  src={medicion.url_imagen}
                  alt="Imagen original de la medición"
                  style={{
                    width: '100%', borderRadius: 8,
                    border: '1px solid var(--border)',
                    maxHeight: 480, objectFit: 'contain',
                    background: 'var(--bg-inset)',
                  }}
                />
              ) : (
                <PlaceholderImagen mensaje="Imagen no disponible para esta medición" />
              )
            )}

            {activeTab === 'deteccion' && (
              /* TODO: cuando el backend devuelva el array `detecciones`, pasar a BoundingBoxOverlay */
              <div>
                <BoundingBoxOverlay imagenUrl={medicion.url_imagen} detecciones={[]} />
                <div style={{
                  marginTop: 14, padding: '12px 16px',
                  background: 'var(--bg-inset)', borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  Visualización detallada disponible próximamente — actualmente el backend solo expone
                  los resultados agregados (nivel, área y confianza). Cuando el endpoint devuelva
                  las coordenadas de cada detección, se mostrarán aquí los bounding boxes individuales.
                </div>
              </div>
            )}

            {activeTab === 'segmentacion' && (
              /* TODO: cuando el backend devuelva `mascaras`, pasar a SegmentationOverlay */
              <div>
                <SegmentationOverlay imagenUrl={medicion.url_imagen} mascaras={[]} />
                <div style={{
                  marginTop: 14, padding: '12px 16px',
                  background: 'var(--bg-inset)', borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  Visualización detallada disponible próximamente — actualmente el backend solo expone
                  los resultados agregados. Cuando el endpoint devuelva los polígonos de segmentación,
                  se mostrará aquí la máscara de áreas corroídas.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha: metadata + acciones ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Badge de nivel grande */}
          <div style={{
            background: bg, border: `1px solid ${color}40`,
            borderRadius: 12, padding: '16px 20px',
            borderTop: `3px solid ${color}`,
          }}>
            <div style={{
              fontFamily: 'var(--font-data)', fontWeight: 700,
              fontSize: 22, color, marginBottom: 4,
              animation: nivel === 3 ? 'blink 1.2s ease-in-out infinite' : 'none',
            }}>
              {nivelLabel(nivel)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '0.08em' }}>
              NIVEL {nivel} / 3 · {nivelToStatus(nivel)}
            </div>
          </div>

          {/* Métricas */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <SectionTitle>Resultados del análisis</SectionTitle>

            <div style={{ marginBottom: 14 }}>
              <MetaLabel>Área corroída</MetaLabel>
              <BarraPorcentaje valor={medicion.area_corroida_pct ?? 0} color={color} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <MetaLabel>Confianza del modelo</MetaLabel>
              <BarraPorcentaje
                valor={medicion.confianza_promedio != null ? medicion.confianza_promedio * 100 : 0}
                color="var(--accent-blue)"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MetaItem label="ID medición" value={medicion.id_medicion?.substring(0, 12) + '…'} />
              <MetaItem label="ID punto" value={medicion.id_punto?.substring(0, 12) + '…'} />
              <MetaItem label="Fuente" value={medicion.fuente ?? '—'} />
              <MetaItem label="Planta" value={punto.sede ?? '—'} />
              <MetaItem label="Ciudad" value={punto.ciudad ?? '—'} />
              <MetaItem label="Empresa" value={punto.empresa ?? '—'} />
            </div>
          </div>

          {/* Fecha y hora */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
            <SectionTitle>Fecha y hora</SectionTitle>
            <div style={{ fontFamily: 'var(--font-data)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
              {medicion.timestamp ? new Date(medicion.timestamp).toLocaleString('es-CO', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              }) : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              {tiempoRelativo(medicion.timestamp)}
            </div>
          </div>

          {/* Notas */}
          {medicion.notas && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
              <SectionTitle>Notas</SectionTitle>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-ui)' }}>
                {medicion.notas}
              </p>
            </div>
          )}

          {/* Mapa */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
            <SectionTitle>Ubicación</SectionTitle>
            <MiniMapa
              lat={lat}
              lng={lng}
              latReal={medicion.latitud_real}
              lngReal={medicion.longitud_real}
            />
            {lat && lng && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-data)', display: 'flex', gap: 12 }}>
                <span style={{ color: '#d97706' }}>● Planta: {lat?.toFixed(5)}, {lng?.toFixed(5)}</span>
                {medicion.latitud_real && medicion.longitud_real && (
                  <span style={{ color: '#38bdf8' }}>● Foto: {medicion.latitud_real.toFixed(5)}, {medicion.longitud_real.toFixed(5)}</span>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
            <SectionTitle>Acciones</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              <ActionButton icon={<Download size={15} />} onClick={handleDescargar} disabled={!medicion.url_imagen}>
                Descargar imagen original
              </ActionButton>

              <ActionButton icon={<Share2 size={15} />} onClick={handleCompartir}>
                {shareMsg || 'Copiar enlace'}
              </ActionButton>

              <ActionButton
                icon={<MapPin size={15} />}
                onClick={() => navigate(`/dashboard?punto=${medicion.id_punto}`)}
              >
                Ver planta en dashboard
              </ActionButton>

              {/* Eliminar: solo admins, placeholder */}
              {isAdmin && (
                <>
                  <ActionButton
                    icon={<Trash2 size={15} />}
                    danger
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Eliminar medición
                  </ActionButton>

                  {showDeleteConfirm && (
                    <div style={{
                      padding: '12px 14px',
                      background: 'rgba(220,38,38,0.08)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: 8, fontSize: 12,
                      color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}>
                      Eliminación no implementada todavía. Esta acción estará disponible en la siguiente iteración.
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{
                          display: 'block', marginTop: 8, background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: 5, padding: '4px 10px',
                          cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)',
                        }}
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Subcomponentes auxiliares ─────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600,
      color: 'var(--text-faint)', letterSpacing: '0.12em',
      textTransform: 'uppercase', marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function MetaLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-data)', fontSize: 10,
      color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-inset)', borderRadius: 6, padding: '8px 10px' }}>
      <div style={{ fontSize: 9, color: 'var(--text-faint)', marginBottom: 2, fontFamily: 'var(--font-data)', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-data)', fontWeight: 600, fontSize: 12,
        color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  );
}

function ActionButton({ icon, onClick, danger, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', background: 'transparent',
        border: `1px solid ${danger ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`,
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-ui)', fontSize: 12,
        color: danger ? 'var(--accent-red)' : disabled ? 'var(--text-faint)' : 'var(--text-secondary)',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.12s',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.07)' : 'var(--bg-inset)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {icon}
      {children}
    </button>
  );
}

function PlaceholderImagen({ mensaje }) {
  return (
    <div style={{
      height: 300, background: 'var(--bg-inset)', borderRadius: 8,
      border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10,
    }}>
      <AlertCircle size={32} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{mensaje}</div>
    </div>
  );
}
