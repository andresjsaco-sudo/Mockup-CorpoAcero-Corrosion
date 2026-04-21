import React, { useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { FileText, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useReporte } from '../hooks/useReporte';
import { usePuntos } from '../hooks/usePuntos';
import { nivelLabel, nivelColor, nivelBg, nivelToStatus } from '../lib/statusUtils';

const PIE_COLORS = ['#16a34a', '#d97706', '#ea580c', '#dc2626'];

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '10px 12px' }}>
          <div style={{
            height: 14, borderRadius: 4,
            background: 'var(--border)',
            animation: 'shimmer 1.5s infinite',
            width: i === 0 ? '60%' : '80%',
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Tendencia badge ─────────────────────────────────────────────────────────
function TendenciaBadge({ valor }) {
  if (valor === undefined || valor === null) return null;
  if (valor < -0.01) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
      <TrendingDown size={13} /> Mejorando
    </span>
  );
  if (valor > 0.01) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
      <TrendingUp size={13} /> Empeorando
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 12, fontWeight: 600 }}>
      <Minus size={13} /> Estable
    </span>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 18px', flex: '1 1 140px',
    }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState('global'); // 'global' | 'planta'
  const [idPunto, setIdPunto] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const { reporte, loading, error, generarReporte, limpiar } = useReporte();
  const { puntos } = usePuntos();

  const handleGenerar = useCallback(() => {
    generarReporte(tab === 'planta' ? 'planta' : 'global', {
      idPunto: tab === 'planta' ? idPunto : undefined,
      desde: desde || undefined,
      hasta: hasta || undefined,
    });
  }, [tab, idPunto, desde, hasta, generarReporte]);

  const handlePrint = useCallback(() => {
    const prev = document.title;
    document.title = tab === 'planta'
      ? `Reporte Planta — CorrIA ${new Date().toLocaleDateString('es-CO')}`
      : `Reporte Global — CorrIA ${new Date().toLocaleDateString('es-CO')}`;
    window.print();
    document.title = prev;
  }, [tab]);

  // Datos derivados del reporte
  const tendencia = reporte?.tendencia_pct ?? reporte?.tendencia ?? null;
  const mediciones = reporte?.mediciones ?? [];
  const distribucion = reporte?.distribucion_nivel ?? null;

  const pieData = distribucion
    ? [0, 1, 2, 3].map(n => ({ name: nivelLabel(n), value: distribucion[n] ?? 0, color: nivelColor(n) })).filter(d => d.value > 0)
    : [];

  const areaData = mediciones.map(m => ({
    fecha: m.fecha_creacion?.slice(0, 10) ?? '',
    area: typeof m.area_corroida_pct === 'number' ? m.area_corroida_pct : 0,
    nivel: m.nivel_corrosion ?? 0,
  }));

  const barData = (() => {
    const agg = {};
    mediciones.forEach(m => {
      const k = m.ciudad ?? m.nombre_punto ?? 'N/D';
      agg[k] = (agg[k] ?? 0) + 1;
    });
    return Object.entries(agg).map(([name, count]) => ({ name, count }));
  })();

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
        }
        .print-only { display: none; }
      `}</style>

      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Encabezado ── */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'var(--accent-amber)', width: 3, height: 20, borderRadius: 2, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Reportes
            </span>
          </div>
          {reporte && (
            <button onClick={handlePrint} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', background: 'var(--accent-amber)',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, color: 'white',
            }}>
              <Download size={14} /> Exportar PDF
            </button>
          )}
        </div>

        {/* ── Filtros ── */}
        <div className="no-print" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '16px 20px', marginBottom: 20,
          display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end',
        }}>
          {/* Tabs tipo/alcance */}
          <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
            {[['global', 'Global'], ['planta', 'Por planta']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setTab(val); limpiar(); }} style={{
                padding: '7px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: tab === val ? 700 : 400,
                background: tab === val ? 'var(--accent-amber)' : 'var(--bg-page)',
                color: tab === val ? 'white' : 'var(--text-muted)',
                transition: 'all 0.13s',
              }}>{lbl}</button>
            ))}
          </div>

          {/* Selector de planta */}
          {tab === 'planta' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Planta
              </label>
              <select value={idPunto} onChange={e => setIdPunto(e.target.value)} style={{
                padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--bg-page)', color: 'var(--text-primary)',
                fontFamily: 'var(--font-ui)', fontSize: 13, minWidth: 180,
              }}>
                <option value="">Seleccionar...</option>
                {puntos.map(p => <option key={p.id_punto} value={p.id_punto}>{p.nombre_punto}</option>)}
              </select>
            </div>
          )}

          {/* Fechas */}
          {['desde', 'hasta'].map(field => (
            <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {field === 'desde' ? 'Desde' : 'Hasta'}
              </label>
              <input
                type="date"
                value={field === 'desde' ? desde : hasta}
                onChange={e => field === 'desde' ? setDesde(e.target.value) : setHasta(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border)',
                  background: 'var(--bg-page)', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)', fontSize: 13,
                }}
              />
            </div>
          ))}

          <button
            onClick={handleGenerar}
            disabled={tab === 'planta' && !idPunto}
            style={{
              padding: '8px 20px', background: 'var(--accent-amber)', border: 'none',
              borderRadius: 8, cursor: tab === 'planta' && !idPunto ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'white',
              opacity: tab === 'planta' && !idPunto ? 0.5 : 1,
            }}
          >
            Generar reporte
          </button>
        </div>

        {/* ── Estado vacío / Error ── */}
        {error && (
          <div style={{ padding: 20, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {!reporte && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-faint)' }}>
            <FileText size={40} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontFamily: 'var(--font-ui)' }}>Configura los filtros y genera un reporte</div>
          </div>
        )}

        {/* ── Contenido del reporte ── */}
        {(reporte || loading) && (
          <div>
            {/* Print header */}
            <div className="print-only" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-ui)' }}>
                {tab === 'planta' ? `Reporte de Planta — ${reporte?.nombre_punto ?? ''}` : 'Reporte Global — CorrIA'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Generado el {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                {desde && ` · Desde ${desde}`}{hasta && ` · Hasta ${hasta}`}
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <KPICard label="Total mediciones" value={loading ? '…' : (reporte?.total_mediciones ?? mediciones.length)} />
              <KPICard label="Nivel promedio" value={loading ? '…' : (reporte?.nivel_promedio != null ? reporte.nivel_promedio.toFixed(2) : '—')} />
              <KPICard label="Área corroída prom." value={loading ? '…' : (reporte?.area_promedio != null ? `${reporte.area_promedio.toFixed(1)}%` : '—')} />
              <KPICard
                label="Tendencia"
                value={loading ? '…' : <TendenciaBadge valor={tendencia} />}
              />
            </div>

            {/* Gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Área corroída en el tiempo */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 12 }}>
                  Área corroída (%) en el tiempo
                </div>
                {loading ? (
                  <div style={{ height: 200, background: 'var(--border)', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="area" stroke="var(--accent-amber)" fill="rgba(217,119,6,0.12)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Distribución por nivel */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 12 }}>
                  Distribución por nivel
                </div>
                {loading ? (
                  <div style={{ height: 200, background: 'var(--border)', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
                ) : pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 12 }}>
                    Sin datos de distribución
                  </div>
                )}
              </div>

              {/* Mediciones por ubicación */}
              {tab === 'global' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: 12 }}>
                    Mediciones por ciudad / planta
                  </div>
                  {loading ? (
                    <div style={{ height: 160, background: 'var(--border)', borderRadius: 6, animation: 'shimmer 1.5s infinite' }} />
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>

            {/* Tabla de mediciones */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-data)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>
                  Detalle de mediciones
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-ui)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-page)' }}>
                      {['Fecha', 'Planta', 'Ciudad', 'Nivel', 'Área corroída'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-data)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                      : mediciones.map((m, i) => {
                          const status = nivelToStatus(m.nivel_corrosion ?? 0);
                          return (
                            <tr key={m.id_medicion ?? i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '9px 12px', color: 'var(--text-primary)' }}>{m.fecha_creacion?.slice(0, 10) ?? '—'}</td>
                              <td style={{ padding: '9px 12px', color: 'var(--text-primary)' }}>{m.nombre_punto ?? '—'}</td>
                              <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>{m.ciudad ?? '—'}</td>
                              <td style={{ padding: '9px 12px' }}>
                                <span style={{
                                  display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                                  background: nivelBg(m.nivel_corrosion ?? 0),
                                  color: nivelColor(m.nivel_corrosion ?? 0),
                                  fontSize: 11, fontWeight: 600,
                                }}>
                                  {nivelLabel(m.nivel_corrosion ?? 0)}
                                </span>
                              </td>
                              <td style={{ padding: '9px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-data)' }}>
                                {m.area_corroida_pct != null ? `${m.area_corroida_pct.toFixed(1)}%` : '—'}
                              </td>
                            </tr>
                          );
                        })
                    }
                    {!loading && mediciones.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12 }}>Sin mediciones en el rango seleccionado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
