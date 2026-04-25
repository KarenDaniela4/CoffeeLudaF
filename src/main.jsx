import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import './styles/globals.css';

// Punto de entrada de la aplicación React.
//
// Orden de los providers (importante):
//   BrowserRouter → permite usar useNavigate, Link, etc.
//   AuthProvider  → expone el usuario autenticado a toda la app
//   CartProvider  → expone el carrito (puede leer el usuario si quiere)
//
// StrictMode ayuda a detectar efectos mal escritos en desarrollo.
// En producción no hace nada y se puede quitar si causa doble-render molesto.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
