import React from 'react';

export default function KPIBar({ plantsData }) {
  const allPlates = plantsData.flatMap(p => p.zones.flatMap(z => z.plates));
  const total = allPlates.length;
  const ok = allPlates.filter(p => p.status === 'OK').length;
  const early = allPlates.filter(p => p.status === 'EARLY').length;
  const moderate = allPlates.filter(p => p.status === 'MODERATE').length;
  const critical = allPlates.filter(p => p.status === 'CRITICAL').length;
  const avgMap = allPlates.reduce((s, p) => s + p.mAP, 0) / total;
  const avgCorr = allPlates.filter(p => p.corrosionPct > 0).reduce((s, p) => s + p.corrosionPct, 0) /
    Math.max(1, allPlates.filter(p => p.corrosionPct > 0).length);

  const kpis = [
    { label: 'Placas Monitoreadas', value: total, unit: 'TOTAL', color: 'var(--accent-blue)', icon: '◈' },
    { label: 'Sin Corrosión', value: ok, unit: `${((ok / total) * 100).toFixed(0)}%`, color: 'var(--accent-green)', icon: '✓' },
    { label: 'Detección Temprana', value: early, unit: 'PLACAS', color: 'var(--accent-amber)', icon: '⚠' },
    { label: 'Moderado', value: moderate, unit: 'PLACAS', color: '#f97316', icon: '▲' },
    { label: 'Crítico', value: critical, unit: 'PLACAS', color: 'var(--accent-red)', icon: '✕', blink: critical > 0 },
    { label: 'mAP Modelo IA', value: `${avgMap.toFixed(1)}%`, unit: 'YOLOv8', color: 'var(--accent-blue)', icon: '◎' },
    { label: 'Corrosión Promedio', value: `${avgCorr.toFixed(1)}%`, unit: 'ACTIVOS', color: '#f97316', icon: '~' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1,
      background: 'var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      {kpis.map((kpi, i) => (
        <div key={i} style={{
          background: 'var(--bg-panel)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'background 0.2s',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: kpi.blink
              ? `linear-gradient(90deg, transparent, ${kpi.color}, transparent)`
              : kpi.color,
            opacity: 0.6,
            animation: kpi.blink ? 'shimmer 2s linear infinite' : 'none',
            backgroundSize: '200% 100%',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: 10, color: 'var(--text-muted)',
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>{kpi.label}</span>
            <span style={{
              fontSize: 12, color: kpi.color,
              animation: kpi.blink ? 'blink 1s ease-in-out infinite' : 'none',
            }}>{kpi.icon}</span>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            color: kpi.color,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>{kpi.value}</div>

          <div style={{
            fontSize: 9, color: kpi.color,
            letterSpacing: '0.15em', opacity: 0.7,
          }}>{kpi.unit}</div>
        </div>
      ))}
    </div>
  );
}
