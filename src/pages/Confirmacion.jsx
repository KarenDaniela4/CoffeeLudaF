import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Página de confirmación post-compra.
 * 
 * Reemplaza confirmacion.php. Lee "ultimaCompra" de sessionStorage
 * (lo guardó Pago.jsx) y la muestra. Luego limpia la clave.
 */
export default function Confirmacion() {
  const [ultimaCompra, setUltimaCompra] = useState(null);
  const [sinCompra, setSinCompra]       = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('ultimaCompra');
    if (!raw) {
      setSinCompra(true);
      return;
    }
    try {
      setUltimaCompra(JSON.parse(raw));
      // Limpiar después de mostrar (retardo para permitir render)
      setTimeout(() => sessionStorage.removeItem('ultimaCompra'), 500);
    } catch {
      setSinCompra(true);
    }
  }, []);

  if (sinCompra) {
    return (
      <div className="confirmacion-card">
        <h1>Sin compra reciente</h1>
        <p className="sub">No encontramos información de una compra reciente.</p>
        <div className="botones">
          <Link to="/menu" className="btn-conf btn-primario">Ir al menú</Link>
        </div>
      </div>
    );
  }

  if (!ultimaCompra) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>;
  }

  const metodoTexto = ultimaCompra.metodo === 'tarjeta'
    ? '💳 Tarjeta'
    : '💵 Efectivo al retirar';

  return (
    <div className="confirmacion-card">
      <div className="check-circle">✓</div>
      <h1>¡Pedido confirmado!</h1>
      <p className="sub">Gracias por tu compra en Coffee Luda ☕</p>

      <div className="detalles">
        {ultimaCompra.items.map((item, i) => (
          <div className="detalles-row" key={i}>
            <span>{item.nombre} × {item.cantidad}</span>
            <span>${item.subtotal.toLocaleString('es-CO')}</span>
          </div>
        ))}

        <div className="detalles-row total">
          <span>Total pagado</span>
          <span>${ultimaCompra.total.toLocaleString('es-CO')}</span>
        </div>
        <div className="detalles-row" style={{ marginTop: 10, color: '#666' }}>
          <span>Método de pago</span>
          <span>{metodoTexto}</span>
        </div>
        <div className="detalles-row" style={{ color: '#666' }}>
          <span>Fecha</span>
          <span>{ultimaCompra.fecha}</span>
        </div>
      </div>

      <div className="botones">
        <Link to="/menu" className="btn-conf btn-secundario">Seguir comprando</Link>
        <Link to="/mis-compras" className="btn-conf btn-primario">Ver mis compras</Link>
      </div>
    </div>
  );
}
