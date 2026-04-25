import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducto, useProductos } from '../../hooks/useProductos';

/**
 * Admin — Editar producto existente.
 * Reemplaza EditarProducto.php.
 * 
 * Carga el producto por ID desde la URL (/admin/productos/:id/editar),
 * lo pone en el estado del formulario, y en submit hace PUT.
 */
export default function EditarProducto() {
  const { id } = useParams();
  const { producto, cargando: cargandoInicial, error: errorCarga } = useProducto(id);
  const { actualizar } = useProductos();
  const navigate = useNavigate();

  const [datos, setDatos]   = useState({ Producto: '', Precio: '' });
  const [error, setError]   = useState('');
  const [enviando, setEnviando] = useState(false);

  // Cuando el producto llega de la API, lo ponemos en el formulario
  useEffect(() => {
    if (producto) {
      setDatos({
        Producto: producto.Producto || '',
        Precio:   producto.Precio   || '',
      });
    }
  }, [producto]);

  const manejarCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!datos.Producto || !datos.Precio) {
      setError('Nombre y precio son obligatorios');
      return;
    }

    setEnviando(true);
    try {
      await actualizar(id, {
        Producto: datos.Producto,
        Precio: Number(datos.Precio),
      });
      navigate('/admin/productos?editado=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoInicial) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Cargando…</div>;
  }

  if (errorCarga || !producto) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#c0392b' }}>
        <p>No se pudo cargar el producto</p>
        <Link to="/admin/productos" className="btn" style={{ display: 'inline-block', maxWidth: 200, marginTop: 20 }}>
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <h2>✏️ Editar Producto</h2>

        <form onSubmit={manejarSubmit}>
          <label>IdProducto (no editable)</label>
          <input value={producto.IdProducto} readOnly />

          <label>Producto</label>
          <input
            name="Producto"
            value={datos.Producto}
            onChange={manejarCambio}
            required
            disabled={enviando}
          />

          <label>Precio</label>
          <input
            name="Precio"
            type="number"
            step="1"
            min="0"
            value={datos.Precio}
            onChange={manejarCambio}
            required
            disabled={enviando}
          />

          {error && <p style={{ color: '#c0392b', marginTop: 10 }}>{error}</p>}

          <div className="acciones">
            <Link to="/admin/productos" className="btn-cancelar">Cancelar</Link>
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
