import React from 'react';

export default function KPIBar({ plantsData }) {
  const allPlates = plantsData.flatMap(p => p.zones.flatMap(z => z.plates));
  const total = allPlates.length;
  if (total === 0) return null;
  const ok       = allPlates.filter(p => p.status === 'OK').length;
  const early    = allPlates.filter(p => p.status === 'EARLY').length;
  const moderate = allPlates.filter(p => p.status === 'MODERATE').length;
  const critical = allPlates.filter(p => p.status === 'CRITICAL').length;
  const avgMap   = allPlates.reduce((s, p) => s + p.mAP, 0) / total;
  const affected = allPlates.filter(p => p.corrosionPct > 2);
  const avgCorr  = affected.length
    ? affected.reduce((s, p) => s + p.corrosionPct, 0) / affected.length : 0;

  const kpis = [
    { label: 'Placas Monitoreadas', value: total,                    sub: 'total',    color: 'var(--accent-blue)',   icon: '⬡' },
    { label: 'Sin Corrosión',       value: ok,                       sub: `${((ok/total)*100).toFixed(0)}%`, color: 'var(--accent-green)', icon: '✓' },
    { label: 'Detección Temprana',  value: early,                    sub: 'placas',   color: 'var(--accent-amber)',  icon: '◐' },
    { label: 'Corrosión Moderada',  value: moderate,                 sub: 'placas',   color: 'var(--accent-orange)', icon: '▲' },
    { label: 'Estado Crítico',      value: critical,                 sub: 'placas',   color: 'var(--accent-red)',    icon: '!', blink: critical > 0 },
    { label: 'Precisión Modelo IA', value: `${avgMap.toFixed(1)}%`,  sub: 'mAP YOLOv8', color: 'var(--accent-blue)', icon: '◎' },
    { label: 'Corrosión Promedio',  value: `${avgCorr.toFixed(1)}%`, sub: 'en activos', color: 'var(--accent-orange)', icon: '~' },
  ];

  return (
    <div className="kpi-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 10,
    }}>
      {kpis.map((kpi, i) => (
        <div key={i} className="card" style={{
          padding: '14px 16px',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
          borderTop: `3px solid ${kpi.color}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: 'var(--font-ui)', fontWeight: 500, lineHeight: 1.3,
            }}>{kpi.label}</span>
            <span style={{
              fontSize: 14, color: kpi.color, lineHeight: 1,
              animation: kpi.blink ? 'blink 1s ease-in-out infinite' : 'none',
            }}>{kpi.icon}</span>
          </div>

          <div style={{
            fontFamily: 'var(--font-data)', fontSize: 24, fontWeight: 600,
            color: kpi.color, lineHeight: 1, letterSpacing: '-0.02em',
          }}>{kpi.value}</div>

          <div style={{
            marginTop: 4, fontSize: 10, color: 'var(--text-faint)',
            fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
}
