import { Link, useSearchParams } from 'react-router-dom';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Admin — Listado y gestión de usuarios.
 * Reemplaza gestion_usuarios.php.
 * 
 * Reglas:
 *   - El admin logueado NO puede eliminarse a sí mismo (botón deshabilitado)
 *   - Badges visuales para distinguir admin/cliente
 */
export default function GestionUsuarios() {
  const { usuarios, cargando, error, eliminar } = useUsuarios();
  const { usuario: usuarioActual } = useAuth();
  const [searchParams] = useSearchParams();

  const mensajeEditado   = searchParams.get('editado') === '1';
  const mensajeEliminado = searchParams.get('eliminado') === '1';

  const manejarEliminar = async (user) => {
    const confirmado = confirm(
      `¿Seguro que deseas eliminar al usuario ${user.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminar(user.id);
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginTop: 20 }}>👥 Gestión de Usuarios</h2>

      {mensajeEditado   && <div className="aviso ok">✅ Usuario editado correctamente.</div>}
      {mensajeEliminado && <div className="aviso ok">✅ Usuario eliminado correctamente.</div>}

      {cargando ? (
        <p style={{ textAlign: 'center', marginTop: 40 }}>Cargando…</p>
      ) : error ? (
        <div className="aviso error">❌ {error}</div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay usuarios registrados.</td></tr>
            ) : usuarios.map((u) => {
              const esAdmin = u.id_rol == 1;
              const esMiUsuario = usuarioActual?.id == u.id;
              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${esAdmin ? 'admin' : 'cliente'}`}>
                      {esAdmin ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/usuarios/${u.id}/editar`} className="btn-edit" title="Editar">
                      ✏️
                    </Link>
                    {esMiUsuario ? (
                      <span
                        className="btn-delete"
                        style={{ opacity: 0.4, cursor: 'not-allowed' }}
                        title= "No puedes eliminarte a ti mismo"
                      >
                        🗑️
                      </span>
                    ) : (
                      <button
                        className="btn-delete"
                        onClick={() => manejarEliminar(u)}
                        title="Eliminar"
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
