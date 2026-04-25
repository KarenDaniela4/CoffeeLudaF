import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

/**
 * useUsuarios — hook de gestión de usuarios (requiere admin).
 * 
 * Sigue el mismo patrón que useProductos.js: estados loading/error,
 * recargar, mutaciones que refetchan automáticamente.
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar usuarios');
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const actualizar = async (id, datos) => {
    const { data } = await api.put(`/usuarios/${id}`, datos);
    await recargar();
    return data;
  };

  const eliminar = async (id) => {
    await api.delete(`/usuarios/${id}`);
    await recargar();
  };

  return { usuarios, cargando, error, recargar, actualizar, eliminar };
}

/**
 * useUsuario — hook para UN usuario por ID (página de edición).
 */
export function useUsuario(id) {
  const [usuario, setUsuario]   = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) { setCargando(false); return; }
    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const { data } = await api.get(`/usuarios/${id}`);
        if (!cancelado) setUsuario(data);
      } catch (err) {
        if (!cancelado) setError(err.response?.data?.error || err.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [id]);

  return { usuario, cargando, error };
}
