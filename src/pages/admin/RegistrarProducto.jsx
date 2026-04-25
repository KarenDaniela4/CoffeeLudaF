import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductos } from '../../hooks/useProductos';

/**
 * Admin — Registrar producto nuevo.
 * Reemplaza a RegistrarProducto.php del original.
 * 
 * La ruta está protegida por <ProtectedRoute rolRequerido={1} />,
 * así que aquí asumimos que sí es admin.
 */
export default function RegistrarProducto() {
  const [datos, setDatos] = useState({ IdProducto: '', Producto: '', Precio: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { crear } = useProductos();
  const navigate = useNavigate();

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
      await crear({
        IdProducto: datos.IdProducto || null, // si está vacío, el backend autogenera
        Producto: datos.Producto,
        Precio: Number(datos.Precio),
      });
      navigate('/admin/productos?creado=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el producto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <h2>➕ Registrar Producto</h2>

        <form onSubmit={manejarSubmit}>
          <label>IdProducto (opcional — si se deja vacío, se asigna automáticamente)</label>
          <input
            name="IdProducto"
            value={datos.IdProducto}
            onChange={manejarCambio}
            placeholder="IdProducto"
            disabled={enviando}
          />

          <label>Producto</label>
          <input
            name="Producto"
            value={datos.Producto}
            onChange={manejarCambio}
            placeholder="Nombre del producto"
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
            placeholder="Precio"
            required
            disabled={enviando}
          />

          {error && <p style={{ color: '#c0392b', marginTop: 10 }}>{error}</p>}

          <div className="acciones">
            <Link to="/admin/productos" className="btn-cancelar">Cancelar</Link>
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
