import { useMisCompras } from '../hooks/usePedidos';

/**
 * Página "Mis Compras" — historial del usuario autenticado.
 * 
 * Reemplaza mis_compras.php.
 * Protegida por <ProtectedRoute /> en App.jsx.
 */
export default function MisCompras() {
  const { compras, cargando, error } = useMisCompras();

  if (cargando) {
    return (
      <div className="container">
        <h2 style={{ marginTop: 20 }}>☕ Mis Pedidos</h2>
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 style={{ marginTop: 20 }}>☕ Mis Pedidos</h2>
        <div className="aviso error">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 20 }}>☕ Mis Pedidos</h2>

      {compras.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>
          Aún no has realizado ninguna compra. ¡Ve por un café!
        </p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((p, i) => (
              <tr key={`${p.IdPedido}-${p.IdProducto}-${i}`}>
                <td>{p.Fecha}</td>
                <td>{p.nombre_producto || `Producto #${p.IdProducto}`}</td>
                <td>{p.Cantidad}</td>
                <td>${Number(p.Total).toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
