import { useState, useCallback } from 'react';
import { apiGet } from '../lib/apiClient';

export function useReporte() {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generarReporte = useCallback(async (tipo, params = {}) => {
    setLoading(true);
    setError(null);
    setReporte(null);
    try {
      const query = new URLSearchParams();
      if (params.desde) query.set('desde', params.desde);
      if (params.hasta) query.set('hasta', params.hasta);
      const qs = query.toString() ? `?${query.toString()}` : '';

      let path;
      if (tipo === 'planta' && params.idPunto) {
        path = `/reportes/planta/${params.idPunto}${qs}`;
      } else {
        path = `/reportes/global${qs}`;
      }

      const data = await apiGet(path);
      setReporte(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => {
    setReporte(null);
    setError(null);
  }, []);

  return { reporte, loading, error, generarReporte, limpiar };
}
