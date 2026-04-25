import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

/**
 * Hooks de pedidos. Usamos dos hooks separados porque las operaciones 
 * cliente (mis compras) y admin (gestión) tienen permisos distintos.
 */

/**
 * useMisCompras — historial del usuario autenticado.
 */
export function useMisCompras() {
  const [compras, setCompras]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/pedidos/mios');
      setCompras(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setCompras([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  return { compras, cargando, error, recargar };
}

/**
 * usePedidos — gestión admin de pedidos.
 */
export function usePedidos() {
  const [pedidos, setPedidos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/pedidos');
      setPedidos(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { recargar(); }, [recargar]);

  const actualizar = async (idPedido, idProducto, datos) => {
    const { data } = await api.put(`/pedidos/${idPedido}/${idProducto}`, datos);
    await recargar();
    return data;
  };

  const eliminar = async (idPedido, idProducto) => {
    await api.delete(`/pedidos/${idPedido}/${idProducto}`);
    await recargar();
  };

  return { pedidos, cargando, error, recargar, actualizar, eliminar };
}

/**
 * usePedido — una línea específica por clave compuesta (para edición admin).
 */
export function usePedido(idPedido, idProducto) {
  const [pedido, setPedido]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!idPedido || !idProducto) { setCargando(false); return; }
    let cancelado = false;
    (async () => {
      setCargando(true);
      try {
        const { data } = await api.get(`/pedidos/${idPedido}/${idProducto}`);
        if (!cancelado) setPedido(data);
      } catch (err) {
        if (!cancelado) setError(err.response?.data?.error || err.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [idPedido, idProducto]);

  return { pedido, cargando, error };
}

/**
 * Helper: función para crear una compra desde el checkout.
 * No es un hook porque se usa una sola vez y no tiene estado compartido.
 */
export async function crearCompra(items) {
  // items: [{ IdProducto, Cantidad, Precio }, ...]
  const { data } = await api.post('/pedidos', { items });
  return data;
}
