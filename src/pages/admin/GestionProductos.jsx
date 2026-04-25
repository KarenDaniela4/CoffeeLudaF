import { Link, useSearchParams } from 'react-router-dom';
import { useProductos } from '../../hooks/useProductos';

/**
 * Admin — Listado y gestión de productos.
 * Reemplaza productosform.php.
 */
export default function GestionProductos() {
  const { productos, cargando, error, eliminar } = useProductos();
  const [searchParams] = useSearchParams();

  // Avisos tras crear/editar (usan query string como el original usaba ?respuesta=)
  const mensajeCreado  = searchParams.get('creado') === '1';
  const mensajeEditado = searchParams.get('editado') === '1';

  const manejarEliminar = async (producto) => {
    const confirmado = confirm(
      `¿Seguro que deseas eliminar "${producto.Producto}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminar(producto.IdProducto);
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <h2>Gestión de Productos</h2>
        <Link to="/admin/productos/nuevo" className="btn" style={{ maxWidth: 200 }}>
          ➕ Nuevo producto
        </Link>
      </div>

      {mensajeCreado  && <div className="aviso ok">✅ Producto creado correctamente.</div>}
      {mensajeEditado && <div className="aviso ok">✅ Producto actualizado correctamente.</div>}

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando…</p>
      ) : error ? (
        <div className="aviso error">❌ {error}</div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>IdProducto</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay productos.</td></tr>
            ) : productos.map((p) => (
              <tr key={p.IdProducto}>
                <td>{p.IdProducto}</td>
                <td>{p.Producto}</td>
                <td>${Number(p.Precio).toLocaleString('es-CO')}</td>
                <td>
                  <Link to={`/admin/productos/${p.IdProducto}/editar`} className="btn-edit" title="Editar">
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
