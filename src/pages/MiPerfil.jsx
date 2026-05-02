import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

/**
 * Mi Perfil — el usuario autenticado edita sus propios datos.
 *
 * Campos NO editables: id (cédula), nombre y apellido — solo se muestran
 * como read-only. El backend además los ignora aunque lleguen en el body.
 *
 * Cambio de contraseña: opcional. Solo se envía si el usuario llena ambos
 * campos (nueva + confirmación).
 */
export default function MiPerfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    telefono: '', email: '', pregunta: '', respuesta: '',
    password: '', confirmpassword: '',
  });
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState('');

  // Carga datos completos desde el backend (incluye pregunta/respuesta,
  // que NO están en localStorage).
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/yo');
        if (!cancelado) {
          setDatos((prev) => ({
            ...prev,
            telefono:  data.telefono  || '',
            email:     data.email     || '',
            pregunta:  data.pregunta  || '',
            respuesta: data.respuesta || '',
          }));
        }
      } catch {
        if (!cancelado) setError('No se pudieron cargar tus datos');
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    // Mismo filtro de teléfono que en Registro.jsx
    if (name === 'telefono' && value !== '' && !/^\d+$/.test(value)) return;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!datos.email) return '⚠️ El correo es obligatorio.';
    if (datos.telefono && datos.telefono.length !== 10)
      return '⚠️ El teléfono debe tener exactamente 10 dígitos.';
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(datos.email)) return '⚠️ Correo electrónico no válido.';
    if ((datos.password || datos.confirmpassword) && datos.password !== datos.confirmpassword)
      return 'Las contraseñas no coinciden.';
    return null;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(''); setExito('');

    const errorVal = validar();
    if (errorVal) { setError(errorVal); return; }

    setEnviando(true);
    try {
      const payload = {
        telefono:  datos.telefono,
        email:     datos.email,
        pregunta:  datos.pregunta,
        respuesta: datos.respuesta,
      };
      if (datos.password) {
        payload.password        = datos.password;
        payload.confirmpassword = datos.confirmpassword;
      }
      await actualizarPerfil(payload);
      setExito('✅ Datos actualizados correctamente');
      setDatos((prev) => ({ ...prev, password: '', confirmpassword: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Cargando…</div>;
  }

  return (
    <div className="form-card-wrapper">
      <div className="form-card">
        <h2>👤 Mi Perfil</h2>

        <form onSubmit={manejarSubmit}>
          <label>ID (no editable)</label>
          <input value={usuario.id} readOnly />

          <label>Nombre (no editable)</label>
          <input value={usuario.nombre} readOnly />

          <label>Apellido (no editable)</label>
          <input value={usuario.apellido || ''} readOnly />

          <label>Teléfono</label>
          <input
            name="telefono"
            value={datos.telefono}
            onChange={manejarCambio}
            maxLength={10}
            inputMode="numeric"
            disabled={enviando}
          />

          <label>Correo electrónico</label>
          <input
            name="email"
            type="email"
            value={datos.email}
            onChange={manejarCambio}
            required
            disabled={enviando}
          />

          <label>Pregunta de seguridad</label>
          <input
            name="pregunta"
            value={datos.pregunta}
            onChange={manejarCambio}
            disabled={enviando}
          />

          <label>Respuesta</label>
          <input
            name="respuesta"
            value={datos.respuesta}
            onChange={manejarCambio}
            disabled={enviando}
          />

          <hr style={{ margin: '20px 0' }} />
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            Solo completa los siguientes campos si deseas cambiar tu contraseña:
          </p>

          <label>Nueva contraseña</label>
          <input
            name="password"
            type="password"
            value={datos.password}
            onChange={manejarCambio}
            disabled={enviando}
          />

          <label>Confirmar nueva contraseña</label>
          <input
            name="confirmpassword"
            type="password"
            value={datos.confirmpassword}
            onChange={manejarCambio}
            disabled={enviando}
          />

          {error && <p style={{ color: '#c0392b', marginTop: 10 }}>{error}</p>}
          {exito && <p style={{ color: '#27ae60', marginTop: 10 }}>{exito}</p>}

          <div className="acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}