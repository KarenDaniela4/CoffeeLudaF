import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { crearCompra } from '../hooks/usePedidos';

/**
 * Página de Pago.
 * 
 * Reemplaza pago.php + js/pago.js del original.
 * 
 * Mantiene la misma lógica:
 *   - Lee el pedido pendiente de sessionStorage
 *   - Selector de método (tarjeta / efectivo)
 *   - Validación de tarjeta (formato, longitud, CVV)
 *   - Al confirmar: POST /api/pedidos, limpia carrito, guarda ultimaCompra, navega
 * 
 * Los datos de tarjeta NO se envían al backend (es un entorno de práctica).
 */
export default function Pago() {
  const { usuario } = useAuth();
  const { vaciar } = useCart();
  const navigate = useNavigate();

  const [pedidoPendiente, setPedidoPendiente] = useState(null);
  const [metodo, setMetodo]     = useState('tarjeta');
  const [titular, setTitular]   = useState('');
  const [numero, setNumero]     = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv]           = useState('');
  const [procesando, setProcesando] = useState(false);

  // Al montar: recuperar pedido pendiente
  useEffect(() => {
    const raw = sessionStorage.getItem('pedidoPendiente');
    if (!raw) {
      alert('No hay ningún pedido pendiente. Vuelve al carrito.');
      navigate('/carrito');
      return;
    }
    try {
      setPedidoPendiente(JSON.parse(raw));
    } catch {
      navigate('/carrito');
    }
  }, [navigate]);

  // Formato automático del número de tarjeta (4 grupos de 4 dígitos)
  const manejarCambioNumero = (e) => {
    const soloDigitos = e.target.value.replace(/\D/g, '');
    const conEspacios = soloDigitos.replace(/(.{4})/g, '$1 ').trim();
    setNumero(conEspacios);
  };

  // Formato MM/AA
  const manejarCambioVencimiento = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 3) {
      v = v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    setVencimiento(v);
  };

  const validarDatosTarjeta = () => {
    if (titular.trim().length < 3) {
      alert('Ingresa el nombre del titular.');
      return false;
    }
    const numeroLimpio = numero.replace(/\s/g, '');
    if (numeroLimpio.length < 13 || numeroLimpio.length > 19) {
      alert('El número de tarjeta no es válido.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
      alert('El vencimiento debe tener el formato MM/AA.');
      return false;
    }
    if (cvv.length < 3) {
      alert('El CVV debe tener 3 o 4 dígitos.');
      return false;
    }
    return true;
  };

  const confirmarPago = async () => {
    if (metodo === 'tarjeta' && !validarDatosTarjeta()) {
      return;
    }

    setProcesando(true);
    try {
      // Enviamos al backend SOLO los items del pedido (no los datos de tarjeta).
      const items = pedidoPendiente.items.map((i) => ({
        IdProducto: i.IdProducto,
        Cantidad: i.cantidad,
        Precio: i.precio,
      }));
      await crearCompra(items);

      // Guardamos info para la pantalla de confirmación
      sessionStorage.setItem('ultimaCompra', JSON.stringify({
        total: pedidoPendiente.total,
        items: pedidoPendiente.items,
        metodo,
        fecha: new Date().toLocaleString('es-CO'),
      }));

      // Limpiamos carrito y pedido pendiente
      vaciar();
      sessionStorage.removeItem('pedidoPendiente');

      navigate('/confirmacion');
    } catch (err) {
      alert('Hubo un problema: ' + (err.response?.data?.error || err.message));
      setProcesando(false);
    }
  };

  if (!pedidoPendiente) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>;
  }

  return (
    <>
      <div style={{ padding: '15px 30px', background: '#be7b7b', color: 'white' }}>
        <Link to="/carrito" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver al carrito
        </Link>
      </div>

      <div className="pago-wrapper">
        {/* Resumen del pedido */}
        <div className="pago-card">
          <h3>🧾 Resumen del pedido</h3>

          {pedidoPendiente.items.map((item, i) => (
            <div className="item-resumen" key={i}>
              <span>{item.nombre} × {item.cantidad}</span>
              <span>${item.subtotal.toLocaleString('es-CO')}</span>
            </div>
          ))}

          <div className="total-row">
            <span>Total a pagar</span>
            <span>${pedidoPendiente.total.toLocaleString('es-CO')}</span>
          </div>

          <p style={{ marginTop: 20, fontSize: '0.9em', color: '#666' }}>
            Comprando como: <strong>{usuario?.email || 'Cliente'}</strong>
          </p>
        </div>

        {/* Formulario de pago */}
        <div className="pago-card">
          <h3>💳 Método de pago</h3>

          <div className="metodo-pago">
            <label className={metodo === 'tarjeta' ? 'activo' : ''}>
              <input
                type="radio"
                name="metodo"
                value="tarjeta"
                checked={metodo === 'tarjeta'}
                onChange={(e) => setMetodo(e.target.value)}
              />
              💳 Tarjeta
            </label>
            <label className={metodo === 'efectivo' ? 'activo' : ''}>
              <input
                type="radio"
                name="metodo"
                value="efectivo"
                checked={metodo === 'efectivo'}
                onChange={(e) => setMetodo(e.target.value)}
              />
              💵 Efectivo
            </label>
          </div>

          {metodo === 'tarjeta' && (
            <div style={{ marginTop: 15 }}>
              <label>Titular de la tarjeta</label>
              <input
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Como aparece en la tarjeta"
                disabled={procesando}
              />

              <label>Número de tarjeta</label>
              <input
                type="text"
                value={numero}
                onChange={manejarCambioNumero}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={procesando}
              />

              <div className="row-2">
                <div>
                  <label>Vencimiento</label>
                  <input
                    type="text"
                    value={vencimiento}
                    onChange={manejarCambioVencimiento}
                    placeholder="MM/AA"
                    maxLength={5}
                    disabled={procesando}
                  />
                </div>
                <div>
                  <label>CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength={4}
                    disabled={procesando}
                  />
                </div>
              </div>
            </div>
          )}

          {metodo === 'efectivo' && (
            <div style={{ padding: 15, background: '#e8f4e8', borderRadius: 6, marginTop: 15 }}>
              💵 Pagarás en efectivo al momento de retirar tu pedido en la cafetería.
            </div>
          )}

          <button className="btn-confirmar" onClick={confirmarPago} disabled={procesando}>
            {procesando ? 'Procesando…' : 'Confirmar pago'}
          </button>

          <div className="aviso-demo">
            ⚠️ Entorno de práctica: los datos de tarjeta son simulados y no se envían a ningún procesador real.
          </div>
        </div>
      </div>
    </>
  );
}
