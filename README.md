# Dashboard IoT de Detección de Corrosión
### Corpoacero S.A.S · Universidad del Norte · Ingeniería Mecánica & Electrónica

---


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
