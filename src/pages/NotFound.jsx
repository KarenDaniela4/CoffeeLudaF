import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container" style={{ textAlign: 'center', padding: 60 }}>
      <h2>404 — Página no encontrada</h2>
      <p style={{ marginTop: 20 }}>
        <Link to="/" className="btn" style={{ display: 'inline-block', maxWidth: 200 }}>
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
