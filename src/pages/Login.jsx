import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Login.
 * 
 * Reemplaza a login.php + js/login.js del original.
 * 
 * Flujo:
 *   1. Usuario ingresa email + password
 *   2. useAuth().login() hace POST /api/auth/login → recibe JWT
 *   3. Si hay éxito, redirige a /menu
 *   4. Si hay error, se muestra inline
 */
export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [enviando, setEnviando] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      await login(email, password);
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-card" onSubmit={manejarSubmit}>
        <h2>☕ Coffee Luda</h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
          disabled={enviando}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          disabled={enviando}
        />

        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        {error && (
          <div className="auth-error">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        <Link to="/registro" className="auth-link">
          ¿No tienes cuenta? Regístrate
        </Link>
      </form>
    </div>
  );
}
