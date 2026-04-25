import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePedido, usePedidos } from '../../hooks/usePedidos';

/**
 * Admin — Editar una línea de pedido.
 * Reemplaza EditarPedidos.php.
 * 
 * Ruta: /admin/pedidos/:idPedido/:idProducto/editar
 */
export default function EditarPedido() {
  const { idPedido, idProducto } = useParams();
  const { pedido, cargando: cargandoInicial, error: errorCarga } = usePedido(idPedido, idProducto);
  const { actualizar } = usePedidos();
  const navigate = useNavigate();

  const [datos, setDatos]     = useState({ Cantidad: '', Total: '' });
  const [error, setError]     = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pedido) {
      setDatos({
        Cantidad: pedido.Cantidad || '',
        Total:    pedido.Total    || '',
      });
    }
  }, [pedido]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await actualizar(idPedido, idProducto, {
        Cantidad: Number(datos.Cantidad),
        Total: Number(datos.Total),
      });
      navigate('/admin/pedidos?editado=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoInicial) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Cargando…</div>;
  }

  if (errorCarga || !pedido) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#c0392b' }}>
        <p>No se pudo cargar el pedido</p>
        <Link to="/admin/pedidos" className="btn" style={{ display: 'inline-block', maxWidth: 200, marginTop: 20 }}>
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <h2>✏️ Editar Pedido</h2>

        <form onSubmit={manejarSubmit}>
          <label>IdPedido</label>
          <input value={pedido.IdPedido} readOnly />

          <label>IdProducto</label>
          <input value={pedido.IdProducto} readOnly />

          <label>Producto</label>
          <input value={pedido.nombre_producto || '—'} readOnly />

          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            step="1"
            value={datos.Cantidad}
            onChange={(e) => setDatos({ ...datos, Cantidad: e.target.value })}
            required
            disabled={enviando}
          />

          <label>Total</label>
          <input
            type="number"
            min="0"
            step="1"
            value={datos.Total}
            onChange={(e) => setDatos({ ...datos, Total: e.target.value })}
            required
            disabled={enviando}
          />

          <label>Fecha</label>
          <input value={pedido.Fecha} readOnly />

          {error && <p style={{ color: '#c0392b', marginTop: 10 }}>{error}</p>}

          <div className="acciones">
            <Link to="/admin/pedidos" className="btn-cancelar">Cancelar</Link>
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
