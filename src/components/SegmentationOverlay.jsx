import React, { useEffect, useRef } from 'react';

/**
 * Renderiza una máscara de segmentación canvas sobre la imagen de medición.
 *
 * Props esperadas (cuando el backend las implemente):
 *   @param {string} imagenUrl - URL de la imagen base
 *   @param {Array}  mascaras  - Array de objetos con polígonos de las áreas detectadas:
 *                               [{ puntos: [{x, y}], color?: string, opacidad?: number }]
 *                               donde x/y están en rango [0, 1] relativo a la imagen
 *
 * TODO: el backend actualmente no devuelve datos de segmentación por píxel/polígono.
 *       Solo expone nivel_corrosion, area_corroida_pct y confianza_promedio.
 *       Cuando el backend devuelva los polígonos, conectar aquí sin cambiar la interfaz.
 */
export default function SegmentationOverlay({ imagenUrl, mascaras = [] }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || mascaras.length === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    mascaras.forEach(({ puntos = [], color = '#dc2626', opacidad = 0.45 }) => {
      if (puntos.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(puntos[0].x * width, puntos[0].y * height);
      puntos.slice(1).forEach(p => ctx.lineTo(p.x * width, p.y * height));
      ctx.closePath();
      ctx.fillStyle = color + Math.round(opacidad * 255).toString(16).padStart(2, '0');
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [mascaras]);

  if (!imagenUrl) return null;

  return (
    <div style={{ position: 'relative', width: '100%', display: 'inline-block' }}>
      <img
        ref={imgRef}
        src={imagenUrl}
        alt="Segmentación"
        style={{ width: '100%', display: 'block', borderRadius: 8 }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', borderRadius: 8,
        }}
      />
    </div>
  );
}
