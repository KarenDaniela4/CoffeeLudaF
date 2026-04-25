import { Link, useSearchParams } from 'react-router-dom';
import { usePedidos } from '../../hooks/usePedidos';

/**
 * Admin — Listado de todos los pedidos.
 * Reemplaza pedidosform.php.
 */
export default function GestionPedidos() {
  const { pedidos, cargando, error, eliminar } = usePedidos();
  const [searchParams] = useSearchParams();

  const mensajeEditado   = searchParams.get('editado') === '1';
  const mensajeEliminado = searchParams.get('eliminado') === '1';

  const manejarEliminar = async (p) => {
    if (!confirm(`¿Seguro que deseas eliminar esta línea del pedido #${p.IdPedido}?`)) {
      return;
    }
    try {
      await eliminar(p.IdPedido, p.IdProducto);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginTop: 20 }}>Pedidos</h2>

      {mensajeEditado   && <div className="aviso ok">✅ Pedido actualizado.</div>}
      {mensajeEliminado && <div className="aviso ok">✅ Pedido eliminado.</div>}

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando…</p>
      ) : error ? (
        <div className="aviso error">❌ {error}</div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>IdPedido</th>
              <th>IdProducto</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No hay pedidos.</td></tr>
            ) : pedidos.map((p, i) => (
              <tr key={`${p.IdPedido}-${p.IdProducto}-${i}`}>
                <td>{p.IdPedido}</td>
                <td>{p.IdProducto}</td>
                <td>{p.nombre_producto || '—'}</td>
                <td>{p.Cantidad}</td>
                <td>${Number(p.Total).toLocaleString('es-CO')}</td>
                <td>{p.Fecha}</td>
                <td>
                  <Link
                    to={`/admin/pedidos/${p.IdPedido}/${p.IdProducto}/editar`}
                    className="btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </Link>
                  <button
                    className="btn-delete"
                    onClick={() => manejarEliminar(p)}
                    title="Eliminar"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
