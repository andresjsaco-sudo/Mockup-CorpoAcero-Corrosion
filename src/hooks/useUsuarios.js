import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPut } from '../lib/apiClient';
import { useRefreshKey } from './RefreshKeyContext';

export function useUsuarios() {
  const { key: globalKey } = useRefreshKey();
  const [localKey, setLocalKey] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet('/usuarios')
      .then(data => {
        if (!cancelled) {
          setUsuarios(Array.isArray(data) ? data : (data?.usuarios ?? []));
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [globalKey, localKey]);

  const refetch = useCallback(() => setLocalKey(k => k + 1), []);
  return { usuarios, loading, error, refetch };
}

export function useGestionUsuarios() {
  const { usuarios, loading, error, refetch } = useUsuarios();
  const [mutating, setMutating] = useState(false);
  const [mutError, setMutError] = useState(null);

  const crearUsuario = useCallback(async (payload) => {
    setMutating(true);
    setMutError(null);
    try {
      const result = await apiPost('/usuarios', payload);
      refetch();
      return result;
    } catch (err) {
      setMutError(err.message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [refetch]);

  const editarUsuario = useCallback(async (idUsuario, payload) => {
    setMutating(true);
    setMutError(null);
    try {
      const result = await apiPut(`/usuarios/${idUsuario}`, payload);
      refetch();
      return result;
    } catch (err) {
      setMutError(err.message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [refetch]);

  const toggleEstado = useCallback(async (idUsuario, habilitado) => {
    setMutating(true);
    setMutError(null);
    try {
      const result = await apiPut(`/usuarios/${idUsuario}/estado`, { habilitado });
      refetch();
      return result;
    } catch (err) {
      setMutError(err.message);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [refetch]);

  return { usuarios, loading, error, mutating, mutError, crearUsuario, editarUsuario, toggleEstado, refetch };
}
