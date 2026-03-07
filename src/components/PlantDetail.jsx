import React, { useState } from 'react';
import { getStatusColor, getStatusBg, getStatusLabel } from '../data/simulation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-section)', border: '1px solid var(--border)',
      padding: '8px 12px', fontFamily: 'var(--font-data)', fontSize: 11,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#f97316' }}>
        Corrosión: <strong>{payload[0]?.value?.toFixed(1)}%</strong>
      </div>
    </div>
  );
};

export default function PlantDetail({ plant, trendData }) {
  const [expandedZone, setExpandedZone] = useState(null);

  if (!plant) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', gap: 12,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.3">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#7a9ab5" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="2.5" stroke="#7a9ab5" strokeWidth="1.5"/>
        </svg>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Selecciona una planta en el mapa
        </div>
      </div>
    );
  }

  const allPlates = plant.zones.flatMap(z => z.plates);
  const critical = allPlates.filter(p => p.status === 'CRITICAL').length;
  const moderate = allPlates.filter(p => p.status === 'MODERATE').length;
  const early = allPlates.filter(p => p.status === 'EARLY').length;
  const ok = allPlates.filter(p => p.status === 'OK').length;
  const worstSeverity = Math.max(...plant.zones.map(z => z.worstSeverity));
  const overallStatus = ['OK', 'EARLY', 'MODERATE', 'CRITICAL'][worstSeverity];
  const statusColor = getStatusColor(overallStatus);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Plant Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: getStatusBg(overallStatus),
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontWeight: 800,
              fontSize: 18, color: statusColor,
              letterSpacing: '0.05em', lineHeight: 1,
            }}>
              {plant.name.toUpperCase()}
              {plant.isHQ && <span style={{
                fontSize: 9, marginLeft: 8, padding: '2px 6px',
                border: `1px solid ${statusColor}`, verticalAlign: 'middle',
                letterSpacing: '0.15em',
              }}>HQ</span>}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.1em' }}>
              {plant.label} · {plant.zones.length} ZONAS · {allPlates.length} PLACAS
            </div>
          </div>
          <div style={{
            padding: '4px 10px',
            background: `${statusColor}15`,
            border: `1px solid ${statusColor}50`,
            fontSize: 10, fontWeight: 700, color: statusColor,
            letterSpacing: '0.1em',
            animation: overallStatus === 'CRITICAL' ? 'blink 1.2s ease-in-out infinite' : 'none',
          }}>
            {getStatusLabel(overallStatus).toUpperCase()}
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[
            { v: ok, l: 'OK', c: '#22c55e' },
            { v: early, l: 'TEMPRANA', c: '#f59e0b' },
            { v: moderate, l: 'MODERADA', c: '#f97316' },
            { v: critical, l: 'CRÍTICA', c: '#ef4444' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 20, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 8, color: c, opacity: 0.7, letterSpacing: '0.1em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>
          TENDENCIA 30 DÍAS — ÍNDICE DE CORROSIÓN PROMEDIO
        </div>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={trendData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${plant.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#3d5a72', fontSize: 8 }} tickLine={false} axisLine={false}
              interval={6} />
            <YAxis tick={{ fill: '#3d5a72', fontSize: 8 }} tickLine={false} axisLine={false} />
            <ReferenceLine y={15} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="corrosion" stroke="#f97316" strokeWidth={1.5}
              fill={`url(#grad-${plant.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Zones */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', padding: '4px 8px 8px' }}>
          ZONAS DE PRODUCCIÓN
        </div>
        {plant.zones.map((zone, zi) => {
          const sc = getStatusColor(zone.status);
          const isExpanded = expandedZone === zi;
          return (
            <div key={zi} style={{ marginBottom: 4 }}>
              <div
                onClick={() => setExpandedZone(isExpanded ? null : zi)}
                style={{
                  padding: '8px 12px',
                  background: isExpanded ? getStatusBg(zone.status) : 'var(--bg-section)',
                  border: `1px solid ${isExpanded ? sc + '50' : 'var(--border)'}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0,
                    animation: zone.worstSeverity >= 3 ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{zone.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, color: sc }}>
                    {zone.avgCorrosion > 0 ? `${zone.avgCorrosion}% avg` : '—'}
                  </span>
                  <span style={{
                    fontSize: 9, color: sc, fontWeight: 700, letterSpacing: '0.1em',
                  }}>{zone.plates.length} PL.</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{
                  background: 'var(--bg-page)',
                  border: `1px solid ${sc}30`,
                  borderTop: 'none',
                  padding: '6px',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}>
                  {zone.plates.map((plate, pi) => (
                    <PlateRow key={pi} plate={plate} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlateRow({ plate }) {
  const sc = getStatusColor(plate.status);
  const barWidth = Math.min(100, plate.corrosionPct * 2.5);

  return (
    <div style={{
      padding: '6px 10px',
      background: 'var(--bg-card)',
      border: `1px solid var(--border)`,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: sc, flexShrink: 0,
        animation: plate.severity >= 3 ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-data)' }}>
            {plate.plateId}
          </span>
          <span style={{
            fontSize: 9, color: sc, fontWeight: 700, letterSpacing: '0.08em',
          }}>
            {plate.corrosionPct}%
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
          <div style={{
            height: '100%', width: `${barWidth}%`, background: sc,
            borderRadius: 2, transition: 'width 0.5s ease',
            boxShadow: plate.severity >= 2 ? `0 0 6px ${sc}80` : 'none',
          }} />
        </div>
      </div>
      <div style={{
        fontSize: 8, color: 'var(--text-muted)', textAlign: 'right',
        flexShrink: 0, lineHeight: 1.4,
      }}>
        <div>{plate.confidence}% conf.</div>
        <div style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          {plate.lastInspection.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
