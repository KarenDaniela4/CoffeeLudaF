import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

/**
 * Página de Registro de clientes.
 * 
 * Reemplaza a registro.php + js/registro.js del original.
 * Mantiene las mismas 9 campos y todas las validaciones del cliente:
 *   - Todos los campos obligatorios
 *   - Teléfono de exactamente 10 dígitos
 *   - Contraseñas coinciden
 *   - Email válido
 * 
 * El servidor también valida todo (defensa en profundidad).
 */

// Estado inicial del formulario — todo vacío
const ESTADO_INICIAL = {
  id: '',
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  password: '',
  confirmpassword: '',
  pregunta: '',
  respuesta: '',
};

export default function Registro() {
  const [datos, setDatos]     = useState(ESTADO_INICIAL);
  const [error, setError]     = useState('');
  const [exito, setExito]     = useState(false);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Un solo handler para todos los inputs (ahorra mucho boilerplate)
  const manejarCambio = (e) => {
    const { name, value } = e.target;

    // Filtrar teléfono a solo dígitos, igual que soloNumeros() del original
    if (name === 'telefono' && value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  // Validaciones del lado cliente (idénticas al registro.js original)
  const validar = () => {
    const requeridos = ['id', 'nombre', 'apellido', 'telefono', 'email', 'password', 'confirmpassword', 'pregunta', 'respuesta'];
    for (const campo of requeridos) {
      if (!datos[campo]) {
        return '⚠️ Todos los campos son obligatorios para el registro.';
      }
    }
    if (datos.telefono.length !== 10) {
      return '⚠️ El teléfono debe tener exactamente 10 dígitos.';
    }
    if (datos.password !== datos.confirmpassword) {
      return 'Las contraseñas no coinciden';
    }
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(datos.email)) {
      return '⚠️ Ingresa un correo electrónico válido (ejemplo@correo.com).';
    }
    return null;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true);
    try {
      await api.post('/auth/registro', datos);
      setExito(true);
      // UX del original: mensaje de éxito y redirige al login a los 2s
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>✅ ¡Cuenta creada!</h2>
          <p style={{ color: 'white', marginTop: 10 }}>Redirigiendo al login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={manejarSubmit}>
        <h2>Crear cuenta</h2>

        <input name="id"              value={datos.id}              onChange={manejarCambio} placeholder="Id (cédula)" required disabled={enviando} />
        <input name="nombre"          value={datos.nombre}          onChange={manejarCambio} placeholder="Nombre" required disabled={enviando} />
        <input name="apellido"        value={datos.apellido}        onChange={manejarCambio} placeholder="Apellido" required disabled={enviando} />
        <input name="telefono"        value={datos.telefono}        onChange={manejarCambio} placeholder="Teléfono" maxLength={10} inputMode="numeric" disabled={enviando} />
        <input name="email"           value={datos.email}           onChange={manejarCambio} placeholder="Correo electrónico" type="email" required disabled={enviando} />
        <input name="password"        value={datos.password}        onChange={manejarCambio} placeholder="Contraseña" type="password" required disabled={enviando} />
        <input name="confirmpassword" value={datos.confirmpassword} onChange={manejarCambio} placeholder="Confirmar contraseña" type="password" required disabled={enviando} />
        <input name="pregunta"        value={datos.pregunta}        onChange={manejarCambio} placeholder="Pregunta de seguridad" required disabled={enviando} />
        <input name="respuesta"       value={datos.respuesta}       onChange={manejarCambio} placeholder="Respuesta" required disabled={enviando} />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrarse'}
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: 10, fontSize: '0.9em' }}>{error}</p>
        )}

        <Link to="/login" className="auth-link">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </form>
    </div>
  );
}
