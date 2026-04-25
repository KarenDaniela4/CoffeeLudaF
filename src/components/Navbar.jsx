import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

/**
 * Navbar — barra de navegación global.
 * 
 * Adaptado del header que aparecía en menu.php, con la misma lógica de roles:
 *   - Visitante (no logueado): Carrito, Iniciar Sesión, Registro
 *   - Administrador (id_rol=1): Registrar Productos, Gestionar Productos, Pedidos, Usuarios
 *   - Cliente (id_rol=2): Carrito, Mis Compras
 */
export default function Navbar() {
  const { usuario, esAdmin, estaLogueado, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const manejarLogout = () => {
    if (confirm('¿Estás seguro de que quieres salir?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="navbar">
      <div className="logo">
        <img src="/logo.png" alt="Coffee Luda" />
      </div>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/menu">Menú</Link>

        {!estaLogueado && (
          <>
            <Link to="/carrito">Carrito 🛒 {totalItems > 0 && `(${totalItems})`}</Link>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/registro">Registro</Link>
          </>
        )}

        {esAdmin && (
          <>
            <Link to="/admin/productos/nuevo">Registrar Productos</Link>
            <Link to="/admin/productos">Gestionar Productos</Link>
            <Link to="/admin/pedidos">Pedidos</Link>
            <Link to="/admin/usuarios">Usuarios</Link>
          </>
        )}

        {estaLogueado && !esAdmin && (
          <>
            <Link to="/carrito">Carrito 🛒 {totalItems > 0 && `(${totalItems})`}</Link>
            <Link to="/mis-compras" className="nav-link">Mis Compras</Link>
          </>
        )}

        {estaLogueado && (
          <>
            <button
              onClick={manejarLogout}
              style={{
                cursor: 'pointer',
                color: 'white',
                backgroundColor: '#c0392b',
                padding: '8px 15px',
                borderRadius: '5px',
                border: 'none',
                marginLeft: '20px',
              }}
            >
              Cerrar Sesión
            </button>
            <div id="auth" style={{ marginLeft: '15px', fontSize: '0.8em', color: '#555' }}>
              👤 {usuario.email}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
