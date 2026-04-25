import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Páginas públicas
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import NotFound from './pages/NotFound.jsx';

// Páginas de cliente (requieren login pero no admin)
import Carrito from './pages/Carrito.jsx';
import Pago from './pages/Pago.jsx';
import Confirmacion from './pages/Confirmacion.jsx';
import MisCompras from './pages/MisCompras.jsx';

// Páginas de admin
import GestionProductos from './pages/admin/GestionProductos.jsx';
import RegistrarProducto from './pages/admin/RegistrarProducto.jsx';
import EditarProducto from './pages/admin/EditarProducto.jsx';
import GestionUsuarios from './pages/admin/GestionUsuarios.jsx';
import EditarUsuario from './pages/admin/EditarUsuario.jsx';
import GestionPedidos from './pages/admin/GestionPedidos.jsx';
import EditarPedido from './pages/admin/EditarPedido.jsx';

/**
 * Mapeo completo de rutas.
 * 
 * PHP original                  → React
 *   index.php                   → /
 *   menu.php                    → /menu
 *   login.php                   → /login
 *   registro.php                → /registro
 *   carrito.php                 → /carrito       (requiere login)
 *   pago.php                    → /pago          (requiere login)
 *   confirmacion.php            → /confirmacion  (requiere login)
 *   mis_compras.php             → /mis-compras   (requiere login)
 *   productosform.php           → /admin/productos
 *   RegistrarProducto.php       → /admin/productos/nuevo
 *   EditarProducto.php          → /admin/productos/:id/editar
 *   gestion_usuarios.php        → /admin/usuarios
 *   EditarUsuario.php           → /admin/usuarios/:id/editar
 *   pedidosform.php             → /admin/pedidos
 *   EditarPedidos.php           → /admin/pedidos/:idPedido/:idProducto/editar
 */
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/carrito" element={<Carrito />} />

        {/* Requieren autenticación (cualquier rol) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pago"          element={<Pago />} />
          <Route path="/confirmacion"  element={<Confirmacion />} />
          <Route path="/mis-compras"   element={<MisCompras />} />
        </Route>

        {/* Solo admin (id_rol=1) */}
        <Route element={<ProtectedRoute rolRequerido={1} />}>
          <Route path="/admin/productos"                              element={<GestionProductos />} />
          <Route path="/admin/productos/nuevo"                        element={<RegistrarProducto />} />
          <Route path="/admin/productos/:id/editar"                   element={<EditarProducto />} />
          <Route path="/admin/usuarios"                               element={<GestionUsuarios />} />
          <Route path="/admin/usuarios/:id/editar"                    element={<EditarUsuario />} />
          <Route path="/admin/pedidos"                                element={<GestionPedidos />} />
          <Route path="/admin/pedidos/:idPedido/:idProducto/editar"   element={<EditarPedido />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
