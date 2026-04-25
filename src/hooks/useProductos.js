import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

/**
 * useProductos — hook personalizado para consumir la API de productos.
 * 
 * Patrón: este mismo diseño se repetirá para usuarios, pedidos, etc.
 * La idea es que la lógica de "pedir datos + manejar loading + manejar error"
 * NO viva en el componente, sino en un hook reutilizable.
 * 
 * Uso en componentes:
 *   const { productos, cargando, error, recargar } = useProductos();
 * 
 * Expone:
 *   productos   — array de productos (vacío mientras carga o si falla)
 *   cargando    — true mientras la petición está en curso
 *   error       — mensaje de error o null
 *   recargar    — función para reejecutar el fetch (útil tras crear/editar)
 *   crear       — POST nuevo producto (solo admin)
 *   actualizar  — PUT producto existente (solo admin)
 *   eliminar    — DELETE producto (solo admin)
 */
export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState(null);

  // useCallback para que la referencia de 'recargar' sea estable entre renders
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/productos');
      setProductos(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al cargar productos');
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  // useEffect con [recargar] como dependencia: corre UNA vez al montar,
  // porque recargar es estable gracias al useCallback.
  useEffect(() => {
    recargar();
  }, [recargar]);

  // Mutaciones (solo funcionarán si el usuario está autenticado como admin)
  const crear = async (datosProducto) => {
    const { data } = await api.post('/productos', datosProducto);
    await recargar(); // Refresca la lista tras crear
    return data;
  };

  const actualizar = async (id, datosProducto) => {
    const { data } = await api.put(`/productos/${id}`, datosProducto);
    await recargar();
    return data;
  };

  const eliminar = async (id) => {
    await api.delete(`/productos/${id}`);
    await recargar();
  };

  return { productos, cargando, error, recargar, crear, actualizar, eliminar };
}

/**
 * useProducto — hook para UN producto específico por ID.
 * Útil en la página de edición.
 */
export function useProducto(id) {
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const { data } = await api.get(`/productos/${id}`);
        if (!cancelado) setProducto(data);
      } catch (err) {
        if (!cancelado) setError(err.response?.data?.error || err.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    // Cleanup: si el componente se desmonta antes de que responda,
    // no actualizamos estado (evita warning de React).
    return () => { cancelado = true; };
  }, [id]);

  return { producto, cargando, error };
}
