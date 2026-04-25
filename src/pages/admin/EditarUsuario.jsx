import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUsuario, useUsuarios } from '../../hooks/useUsuarios';

/**
 * Admin — Editar usuario.
 * Reemplaza EditarUsuario.php. Permite cambiar rol (admin/cliente).
 */
export default function EditarUsuario() {
  const { id } = useParams();
  const { usuario, cargando: cargandoInicial, error: errorCarga } = useUsuario(id);
  const { actualizar } = useUsuarios();
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    nombre: '', apellido: '', telefono: '', email: '', id_rol: 2,
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setDatos({
        nombre:   usuario.nombre   || '',
        apellido: usuario.apellido || '',
        telefono: usuario.telefono || '',
        email:    usuario.email    || '',
        id_rol:   Number(usuario.id_rol) || 2,
      });
    }
  }, [usuario]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: name === 'id_rol' ? Number(value) : value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await actualizar(id, datos);
      navigate('/admin/usuarios?editado=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoInicial) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Cargando…</div>;
  }

  if (errorCarga || !usuario) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#c0392b' }}>
        <p>No se pudo cargar el usuario</p>
        <Link to="/admin/usuarios" className="btn" style={{ display: 'inline-block', maxWidth: 200, marginTop: 20 }}>
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <h2>✏️ Editar Usuario</h2>

        <form onSubmit={manejarSubmit}>
          <label>ID (no editable)</label>
          <input value={usuario.id} readOnly />

          <label>Nombre</label>
          <input name="nombre" value={datos.nombre} onChange={manejarCambio} required disabled={enviando} />

          <label>Apellido</label>
          <input name="apellido" value={datos.apellido} onChange={manejarCambio} required disabled={enviando} />

          <label>Teléfono</label>
          <input name="telefono" value={datos.telefono} onChange={manejarCambio} disabled={enviando} />

          <label>Correo electrónico</label>
          <input name="email" type="email" value={datos.email} onChange={manejarCambio} required disabled={enviando} />

          <label>Rol</label>
          <select name="id_rol" value={datos.id_rol} onChange={manejarCambio} required disabled={enviando}>
            <option value={1}>Administrador</option>
            <option value={2}>Cliente</option>
          </select>

          {error && <p style={{ color: '#c0392b', marginTop: 10 }}>{error}</p>}

          <div className="acciones">
            <Link to="/admin/usuarios" className="btn-cancelar">Cancelar</Link>
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
