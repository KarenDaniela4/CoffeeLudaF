import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página del carrito.
 * 
 * Reemplaza carrito.php + js/carrito.js. 
 * Usa useCart() (Context) para estado persistido en localStorage.
 */

const IMAGENES_PRODUCTO = {
  'Espresso':  'espresso.jpg',
  'Capuccino': 'capuccino.jpg',
  'Café Latte':     'latte.jpg',
};

function imagenProducto(nombre) {
  return `/images/${IMAGENES_PRODUCTO[nombre] || 'logo.png'}`;
}

export default function Carrito() {
  const { items, total, actualizarCantidad, quitar, vaciar } = useCart();
  const { estaLogueado } = useAuth();
  const navigate = useNavigate();

  const manejarComprar = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío, añade un delicioso café primero.');
      return;
    }

    if (!estaLogueado) {
      alert('Debes iniciar sesión para realizar la compra.');
      navigate('/login');
      return;
    }

    // Guardamos el resumen del pedido en sessionStorage, igual que el original.
    // Pago.jsx lo lee de ahí. Usamos session (no local) porque es temporal al checkout.
    const pedidoPendiente = {
      items: items.map((i) => ({
        IdProducto: i.IdProducto,
        nombre: i.Producto,
        cantidad: i.cantidad,
        precio: Number(i.Precio),
        subtotal: Number(i.Precio) * i.cantidad,
      })),
      total,
    };
    sessionStorage.setItem('pedidoPendiente', JSON.stringify(pedidoPendiente));
    navigate('/pago');
  };

  const manejarVaciar = () => {
    if (items.length === 0) return;
    if (confirm('¿Seguro que quieres vaciar el carrito?')) {
      vaciar();
    }
  };

  return (
    <section className="container">
      <h2 style={{ marginTop: 20 }}>🛒 Carrito de compras</h2>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Tu carrito está vacío.</p>
          <Link
            to="/menu"
            className="btn"
            style={{ display: 'inline-block', maxWidth: 200, marginTop: 20 }}
          >
            Ver menú
          </Link>
        </div>
      ) : (
        <>
          <div className="carrito-container">
            {items.map((item) => (
              <div className="item-carrito" key={item.IdProducto}>
                <img
                  src={imagenProducto(item.Producto)}
                  alt={item.Producto}
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />

                <div className="info">
                  <h3>{item.Producto}</h3>
                  <p className="precio">${Number(item.Precio).toLocaleString('es-CO')}</p>

                  <div className="cantidad">
                    <button onClick={() => actualizarCantidad(item.IdProducto, item.cantidad - 1)}>➖</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => actualizarCantidad(item.IdProducto, item.cantidad + 1)}>➕</button>
                  </div>
                </div>

                <div className="acciones">
                  <button onClick={() => quitar(item.IdProducto)} title="Eliminar">❌</button>
                </div>
              </div>
            ))}
          </div>

          <h2 id="total">
            Total: ${total.toLocaleString('es-CO')}
          </h2>

          <div className="acciones-carrito">
            <button className="btn-vaciar" onClick={manejarVaciar}>🗑 Vaciar carrito</button>
            <button className="btn-comprar" onClick={manejarComprar}>💳 Comprar</button>
          </div>
        </>
      )}
    </section>
  );
}
