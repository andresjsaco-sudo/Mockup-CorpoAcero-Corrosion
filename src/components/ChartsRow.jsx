import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, RadialBarChart, RadialBar, Legend,
} from 'recharts';
import { getStatusColor } from '../data/simulation';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-panel)', border: '1px solid var(--border)',
      padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          {p.name?.includes('Corrosión') ? '%' : ''}
        </div>
      ))}
    </div>
  );
};

export default function ChartsRow({ plantsData }) {
  // Bar chart: avg corrosion per plant
  const barData = plantsData.map(plant => {
    const allPlates = plant.zones.flatMap(z => z.plates);
    const affected = allPlates.filter(p => p.corrosionPct > 0);
    const avg = affected.length ? affected.reduce((s, p) => s + p.corrosionPct, 0) / affected.length : 0;
    const worst = Math.max(...allPlates.map(p => p.corrosionPct));
    const wSev = Math.max(...plant.zones.map(z => z.worstSeverity));
    return {
      name: plant.name.substring(0, 3).toUpperCase(),
      fullName: plant.name,
      'Corrosión Promedio': parseFloat(avg.toFixed(1)),
      'Peor Caso': parseFloat(worst.toFixed(1)),
      status: ['OK', 'EARLY', 'MODERATE', 'CRITICAL'][wSev],
    };
  });

  // Pie: distribution of plate statuses
  const allPlates = plantsData.flatMap(p => p.zones.flatMap(z => z.plates));
  const statusCounts = {
    OK: allPlates.filter(p => p.status === 'OK').length,
    EARLY: allPlates.filter(p => p.status === 'EARLY').length,
    MODERATE: allPlates.filter(p => p.status === 'MODERATE').length,
    CRITICAL: allPlates.filter(p => p.status === 'CRITICAL').length,
  };
  const pieData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: k === 'OK' ? 'Sin Corrosión' : k === 'EARLY' ? 'Temprana' : k === 'MODERATE' ? 'Moderada' : 'Crítica',
      value: v,
      fill: getStatusColor(k),
    }));

  // Model confidence per plant
  const confData = plantsData.map(plant => {
    const all = plant.zones.flatMap(z => z.plates);
    const avg = all.reduce((s, p) => s + p.mAP, 0) / all.length;
    return { name: plant.name.substring(0, 3).toUpperCase(), mAP: parseFloat(avg.toFixed(1)), fill: '#38bdf8' };
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 220px 1fr',
      gap: 1,
      background: 'var(--border)',
      borderTop: '1px solid var(--border)',
    }}>
      {/* Bar chart */}
      <ChartCard title="ÍNDICE DE CORROSIÓN POR PLANTA" subtitle="PROMEDIO Y PEOR CASO DETECTADO">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={barData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#7a9ab5', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#3d5a72', fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Corrosión Promedio" radius={[2, 2, 0, 0]} maxBarSize={24}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={getStatusColor(entry.status)} fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="Peor Caso" radius={[2, 2, 0, 0]} maxBarSize={12} fill="#ef4444" fillOpacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie chart */}
      <ChartCard title="DISTRIBUCIÓN" subtitle="ESTADO DE PLACAS">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={pieData} cx="50%" cy="50%"
              innerRadius={38} outerRadius={58}
              paddingAngle={3} dataKey="value"
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="var(--bg-void)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
          padding: '0 8px 4px',
        }}>
          {pieData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.fill }} />
              <span style={{ color: 'var(--text-muted)' }}>{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Confidence chart */}
      <ChartCard title="RENDIMIENTO MODELO IA" subtitle="mAP POR INSTALACIÓN · YOLOv8 + TRANSFER LEARNING">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={confData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }} layout="vertical">
            <XAxis type="number" domain={[75, 100]} tick={{ fill: '#3d5a72', fontSize: 9 }}
              tickLine={false} axisLine={false} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fill: '#7a9ab5', fontSize: 10 }}
              tickLine={false} axisLine={false} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="mAP" radius={[0, 2, 2, 0]} maxBarSize={18} fill="#38bdf8" fillOpacity={0.7}>
              {confData.map((entry, i) => (
                <Cell key={i}
                  fill={entry.mAP >= 90 ? '#22c55e' : entry.mAP >= 85 ? '#38bdf8' : '#f59e0b'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{
          padding: '0 8px 4px',
          fontSize: 9, color: 'var(--text-muted)', display: 'flex', gap: 12,
        }}>
          <span style={{ color: '#22c55e' }}>● ≥90% Excelente</span>
          <span style={{ color: '#38bdf8' }}>● ≥85% Bueno</span>
          <span style={{ color: '#f59e0b' }}>● &lt;85% Revisar</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>OBJETIVO: &gt;80% mAP</span>
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '12px 16px 8px',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
        letterSpacing: '0.1em', marginBottom: 2,
        fontFamily: 'var(--font-display)',
      }}>{title}</div>
      <div style={{
        fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 8,
      }}>{subtitle}</div>
      {children}
    </div>
  );
}
