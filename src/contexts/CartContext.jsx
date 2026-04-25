import { createContext, useContext, useState, useEffect } from 'react';

/**
 * CartContext — estado global del carrito de compras.
 * 
 * Reemplaza el uso de localStorage directo en el carrito.js del proyecto PHP.
 * Seguimos persistiendo en localStorage (el carrito sobrevive al refresh),
 * pero lo manejamos de forma centralizada con hooks.
 * 
 * Estructura de un item:
 *   { IdProducto, Producto, Precio, cantidad }
 */

const CartContext = createContext(null);
const STORAGE_KEY = 'coffeeluda_carrito';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // Inicialización perezosa: lee de localStorage una sola vez al montar
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // Cada vez que cambia el carrito, persistir en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /**
   * Agrega un producto al carrito. Si ya existe, suma cantidad.
   */
  const agregar = (producto, cantidad = 1) => {
    setItems((actuales) => {
      const existente = actuales.find((i) => i.IdProducto === producto.IdProducto);
      if (existente) {
        return actuales.map((i) =>
          i.IdProducto === producto.IdProducto
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...actuales, { ...producto, cantidad }];
    });
  };

  const quitar = (idProducto) => {
    setItems((actuales) => actuales.filter((i) => i.IdProducto !== idProducto));
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    if (cantidad <= 0) {
      quitar(idProducto);
      return;
    }
    setItems((actuales) =>
      actuales.map((i) => (i.IdProducto === idProducto ? { ...i, cantidad } : i))
    );
  };

  const vaciar = () => setItems([]);

  // Derivados calculados: total y cantidad de items.
  // No usamos useMemo porque el cálculo es trivial; si el carrito crece mucho, sí.
  const total = items.reduce((acc, i) => acc + Number(i.Precio) * i.cantidad, 0);
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  const valor = {
    items,
    total,
    totalItems,
    agregar,
    quitar,
    actualizarCantidad,
    vaciar,
  };

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}
