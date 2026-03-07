# CorroSense.AI — Dashboard IoT de Detección de Corrosión
### Corpoacero S.A.S · Universidad del Norte · Ingeniería Mecánica & Electrónica

---

## 🚀 Deploy en Vercel (3 pasos)

```bash
# 1. Clonar / descomprimir el proyecto
cd corpoacero-iot

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm run dev
```

Para deploy en Vercel:
1. Subir el proyecto a un repositorio GitHub
2. Entrar a [vercel.com](https://vercel.com) → New Project → importar el repo
3. Vercel detecta automáticamente Vite — dar clic en **Deploy**
4. ¡Listo! El dashboard queda en `https://tu-proyecto.vercel.app`

---

## 📁 Estructura del Proyecto

```
src/
├── App.jsx                  # Layout principal + simulation loop
├── index.css                # Design system industrial-futurista
├── main.jsx                 # Entry point React
│
├── components/
│   ├── Header.jsx           # Barra superior con reloj y estado del sistema
│   ├── KPIBar.jsx           # 7 métricas clave en tiempo real
│   ├── ColombiaMap.jsx      # Mapa interactivo Leaflet con 5 sedes
│   ├── PlantDetail.jsx      # Panel de detalle por planta + tendencia 30 días
│   ├── AlertsPanel.jsx      # Centro de alertas con filtros
│   └── ChartsRow.jsx        # 3 gráficas: corrosión, distribución, mAP IA
│
└── data/
    └── simulation.js        # Motor de simulación IoT (reemplazar con API real)
```

---

## 🔌 Integración con Backend Real

Para conectar a datos reales, reemplazar las funciones en `src/data/simulation.js`:

```javascript
// En App.jsx, cambiar simulate() por:
const data = await fetch('https://tu-api.com/api/plants').then(r => r.json());
const alerts = await fetch('https://tu-api.com/api/alerts').then(r => r.json());
```

### Estructura de datos esperada (API):

```json
{
  "plantId": "BAQ",
  "zones": [{
    "name": "Zona A - Laminación",
    "plates": [{
      "plateId": "PL-BAQ-01-042",
      "corrosionPct": 23.4,
      "confidence": 91.2,
      "status": "MODERATE",
      "severity": 2,
      "lastInspection": "2025-03-01T14:30:00Z",
      "mAP": 88.5
    }]
  }]
}
```

---

## 🧠 Modelo de IA

- **Arquitectura**: YOLOv8 con Transfer Learning
- **Dataset**: Ensayos de niebla salina bajo norma ASTM B117
- **Objetivo mAP**: > 80% (simulado actualmente entre 82-95%)
- **Inferencia edge**: Raspberry Pi 4 / Jetson Nano
- **Transmisión**: 4G LTE → Backend Cloud → Dashboard

---

## 🏭 Plantas Monitoreadas

| ID | Ciudad | Tipo | Riesgo Ambiental |
|---|---|---|---|
| BAQ | Barranquilla | Planta Principal (HQ) | Alto (costera) |
| CTG | Cartagena | Planta Caribe | Muy Alto (costera) |
| SMR | Santa Marta | Centro Distribución | Alto (costera) |
| BOG | Bogotá | Planta Centro | Bajo (interior) |
| MDE | Medellín | Planta Antioquia | Bajo-Medio |

---

## 🎨 Stack Técnico

- **React 18** + **Vite 5**
- **Recharts** — gráficas de corrosión y rendimiento IA
- **Leaflet** + **React-Leaflet** — mapa interactivo de Colombia
- **CSS Variables** — design system industrial-futurista
- **Fuentes**: Syne (display) + Space Mono (datos técnicos)

---

*Universidad del Norte · Proyecto de Grado 2025*  
*Departamento de Ingeniería Mecánica & Ingeniería Electrónica*
