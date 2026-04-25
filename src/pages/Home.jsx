import { Link } from 'react-router-dom';

/**
 * Página de inicio. Equivalente a index.php del original.
 */
export default function Home() {
  return (
    <section className="hero">
      <h2>Bienvenido a nuestra cafetería</h2>
      <p>Disfruta los mejores cafés y postres</p>
      <Link to="/menu" className="btn">Ver menú</Link>
    </section>
  );
}
