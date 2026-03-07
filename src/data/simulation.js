// ─── PLANT LOCATIONS ────────────────────────────────────────────────────────
export const PLANTS = [
  {
    id: 'BAQ',
    name: 'Barranquilla',
    label: 'Planta Principal',
    lat: 10.9685,
    lng: -74.7813,
    isHQ: true,
    zones: ['Zona A - Laminación', 'Zona B - Galvanizado', 'Zona C - Prepintado', 'Zona D - Almacén', 'Zona E - Despacho'],
  },
  {
    id: 'CTG',
    name: 'Cartagena',
    label: 'Planta Caribe',
    lat: 10.3910,
    lng: -75.4794,
    isHQ: false,
    zones: ['Zona A - Producción', 'Zona B - Almacén', 'Zona C - Control Calidad'],
  },
  {
    id: 'SMR',
    name: 'Santa Marta',
    label: 'Centro de Distribución',
    lat: 11.2404,
    lng: -74.2110,
    isHQ: false,
    zones: ['Zona A - Bodega Norte', 'Zona B - Bodega Sur'],
  },
  {
    id: 'BOG',
    name: 'Bogotá',
    label: 'Planta Centro',
    lat: 4.7110,
    lng: -74.0721,
    isHQ: false,
    zones: ['Zona A - Manufactura', 'Zona B - Galvanizado', 'Zona C - Distribución'],
  },
  {
    id: 'MDE',
    name: 'Medellín',
    label: 'Planta Antioquia',
    lat: 6.2442,
    lng: -75.5812,
    isHQ: false,
    zones: ['Zona A - Producción', 'Zona B - Tratamiento', 'Zona C - Almacén'],
  },
];

// ─── SIMULATION ENGINE ───────────────────────────────────────────────────────
// Corrosion risk by environment (coastal = higher rate of progression)
const ENV_RISK = { BAQ: 0.72, CTG: 0.80, SMR: 0.68, BOG: 0.35, MDE: 0.40 };

// Deterministic seeded random (same seed = same value, no randomness between ticks)
function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

// ─── PERSISTENT CORROSION STATE ──────────────────────────────────────────────
// Corrosion is IRREVERSIBLE — values only increase over time.
// Each plate has a fixed initial corrosion (from seed) + a progressive increment per tick.
// This means: corrosion NEVER decreases between simulation ticks.

export function generatePlateData(plantId, zoneIndex, plateIndex, tick = 0) {
  const risk = ENV_RISK[plantId] || 0.5;
  // Unique stable seed for this specific plate — never changes
  const plateSeed = (plantId.charCodeAt(0) * 1000) + (zoneIndex * 100) + plateIndex;

  // Initial corrosion at tick=0 (some plates start already corroded)
  const hasInitialCorrosion = seededRandom(plateSeed) < risk * 0.45;
  const initialPct = hasInitialCorrosion
    ? seededRandom(plateSeed + 1) * risk * 68  // 0 to ~49% for high-risk
    : seededRandom(plateSeed + 2) * 1.8;        // 0 to 1.8% (clean)

  // Corrosion rate per tick: coastal plants corrode faster
  // Rate varies per plate: some corrode fast, others slow
  const rateMultiplier = seededRandom(plateSeed + 3); // 0–1
  const corrosionRatePerTick = risk * rateMultiplier * 2.5; // max ~2% per tick (30s)

  // MONOTONIC: current value = initial + (rate × tick). Never decreases.
  const rawPct = initialPct + (corrosionRatePerTick * tick);
  const corrosionPct = parseFloat(Math.min(rawPct, 95).toFixed(1)); // cap at 95%

  // Confidence stays stable per plate (model certainty doesn't change much)
  const confidence = parseFloat((88 + seededRandom(plateSeed + 4) * 9.5).toFixed(1));

  // Plate ID is stable (same plate = same ID every tick)
  const plateNum = Math.floor(seededRandom(plateSeed + 5) * 900) + 100;
  const plateId = `PL-${plantId}-${String(zoneIndex + 1).padStart(2, '0')}-${plateNum}`;

  let status, severity;
  if (corrosionPct < 2)       { status = 'OK';       severity = 0; }
  else if (corrosionPct < 15) { status = 'EARLY';    severity = 1; }
  else if (corrosionPct < 35) { status = 'MODERATE'; severity = 2; }
  else                        { status = 'CRITICAL'; severity = 3; }

  // Inspection time: most recent 4 hours, stable-ish
  const hoursAgo = seededRandom(plateSeed + 6) * 4;
  const lastInspection = new Date(Date.now() - hoursAgo * 3600000);

  return {
    plateId,
    corrosionPct,
    confidence,
    status,
    severity,
    lastInspection,
    mAP: parseFloat((82 + seededRandom(plateSeed + 7) * 12.8).toFixed(1)),
    detectionMethod: 'YOLOv8 Transfer Learning',
    norm: 'ASTM B117',
  };
}

// Fixed plate count per zone (stable across ticks)
function plateCountForZone(plantId, zoneIndex) {
  const seed = (plantId.charCodeAt(0) * 7) + zoneIndex;
  return 3 + Math.floor(seededRandom(seed) * 5); // 3–7 plates, always same count
}

export function generatePlantStatus(plant, tick = 0) {
  return {
    ...plant,
    zones: plant.zones.map((zone, i) => {
      const count = plateCountForZone(plant.id, i);
      const plates = Array.from({ length: count }, (_, j) =>
        generatePlateData(plant.id, i, j, tick)
      );
      const worstSeverity = Math.max(...plates.map(p => p.severity));
      const avgCorrosion = plates.reduce((s, p) => s + p.corrosionPct, 0) / plates.length;
      return {
        name: zone,
        plates,
        worstSeverity,
        avgCorrosion: parseFloat(avgCorrosion.toFixed(1)),
        status: ['OK', 'EARLY', 'MODERATE', 'CRITICAL'][worstSeverity],
      };
    }),
  };
}

export function getStatusColor(status) {
  return {
    OK: '#16a34a',
    EARLY: '#d97706',
    MODERATE: '#ea580c',
    CRITICAL: '#dc2626',
  }[status] || '#64748b';
}

export function getStatusBg(status) {
  return {
    OK: 'rgba(22,163,74,0.08)',
    EARLY: 'rgba(217,119,6,0.08)',
    MODERATE: 'rgba(234,88,12,0.10)',
    CRITICAL: 'rgba(220,38,38,0.10)',
  }[status] || 'transparent';
}

export function getStatusLabel(status) {
  return {
    OK: 'Sin Corrosión',
    EARLY: 'Corrosión Temprana',
    MODERATE: 'Corrosión Moderada',
    CRITICAL: 'Corrosión Crítica',
  }[status] || status;
}

// Generate 30-day monotonically increasing trend (corrosion only goes up)
export function generateTrendData(plantId, currentTick = 0) {
  const risk = ENV_RISK[plantId] || 0.5;
  // Simulate what corrosion looked like over the past 30 days
  // Each day = ~2880 ticks (30s each). We show the average index.
  const ticksPerDay = 2880;
  return Array.from({ length: 30 }, (_, dayIndex) => {
    const day = new Date();
    day.setDate(day.getDate() - (29 - dayIndex));
    // Past ticks: negative offset from current
    const pastTick = currentTick - (29 - dayIndex) * ticksPerDay;
    // Base corrosion at that point in time (monotonically grows)
    const base = risk * 8 + Math.max(0, pastTick) * risk * 0.0008;
    // Small day-to-day variance (noise) but never goes below previous day
    const noise = seededRandom(dayIndex * 31 + plantId.charCodeAt(0)) * 2 - 0.5;
    const val = Math.max(0, base + noise);
    return {
      date: day.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      corrosion: parseFloat(val.toFixed(1)),
      threshold: 15,
    };
  });
}

// Generate alerts from current plant data
export function generateAlerts(plantsData) {
  const alerts = [];
  plantsData.forEach(plant => {
    plant.zones.forEach(zone => {
      zone.plates.forEach(plate => {
        if (plate.severity >= 2) {
          alerts.push({
            id: `ALT-${plate.plateId}`,
            plantName: plant.name,
            plantId: plant.id,
            zone: zone.name,
            plateId: plate.plateId,
            severity: plate.severity,
            status: plate.status,
            corrosionPct: plate.corrosionPct,
            time: plate.lastInspection,
            message: plate.severity === 3
              ? `CRÍTICO: Placa ${plate.plateId} con ${plate.corrosionPct}% de corrosión — reemplazo inmediato requerido`
              : `MODERADO: Placa ${plate.plateId} con ${plate.corrosionPct}% de corrosión detectada`,
          });
        }
      });
    });
  });
  return alerts.sort((a, b) => b.severity - a.severity || b.corrosionPct - a.corrosionPct).slice(0, 15);
}
