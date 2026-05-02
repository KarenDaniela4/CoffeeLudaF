import { useProductos } from '../hooks/useProductos';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página Menú — listado público de productos.

 */

// Mapeo de nombres de producto a imágenes.
// Si un producto no está en el mapa, usamos una imagen por defecto.
const IMAGENES_PRODUCTO = {
  'Espresso':  'espresso.jpg',
  'Capuccino': 'capuccino.jpg',
  'Café Latte':     'latte.jpg',
  'Postre': 'postre.jpg',
  'Chocolate': 'chocolate.jpg'
};

function obtenerImagen(nombreProducto) {
  const archivo = IMAGENES_PRODUCTO[nombreProducto] || 'logo.png';
  return `/images/${archivo}`;
}

// Formateo de precio en pesos colombianos
function formatearPrecio(precio) {
  return `$${Number(precio).toLocaleString('es-CO')}`;
}

export default function Menu() {
  const { productos, cargando, error, recargar } = useProductos();
  const { agregar } = useCart();
  const { usuario, esAdmin } = useAuth();

  // Handler: agrega al carrito. Si no está logueado le permitimos igual
  
  const manejarAgregar = (producto) => {
    agregar(producto);
    // Feedback simple. Se puede reemplazar por un toast más lindo después.
    alert(`${producto.Producto} agregado 🛒`);
  };

  // Estados de UI: loading, error, vacío, y lista
  if (cargando) {
    return (
      <section className="container">
        <h2>Nuestro Menú</h2>
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando productos…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container">
        <h2>Nuestro Menú</h2>
        <div style={{ textAlign: 'center', marginTop: 40, color: '#c0392b' }}>
          <p>⚠️ No se pudieron cargar los productos</p>
          <p style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>{error}</p>
          <button
            className="btn"
            onClick={recargar}
            style={{ maxWidth: 200, margin: '20px auto', display: 'block' }}
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2>Bienvenido a Coffee Luda</h2>
        {usuario ? (
          <p>
            Has ingresado como:{' '}
            <strong>{esAdmin ? 'Administrador' : 'Cliente'}</strong>
          </p>
        ) : (
          <p>
            Explora nuestro menú. <a href="/login">Inicia sesión</a> o{' '}
            <a href="/registro">regístrate</a> para poder comprar.
          </p>
        )}
      </div>

      <h2>Nuestro Menú</h2>

      {productos.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
          No hay productos disponibles por ahora.
        </p>
      ) : (
        <div className="grid">
          {productos.map((producto) => (
            <div key={producto.IdProducto} className="card">
              <img
                src={obtenerImagen(producto.Producto)}
                alt={producto.Producto}
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <h3>{producto.Producto}</h3>
              <p>{formatearPrecio(producto.Precio)}</p>
              <button className="btn" onClick={() => manejarAgregar(producto)}>
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
