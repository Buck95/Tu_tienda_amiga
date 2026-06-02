import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import './App.css';

function App() {

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensajeCompra, setMensajeCompra] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (usuario && usuario.rol !== "admin") {
      obtenerProductos();
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const obtenerProductos = async () => {
    const res = await axios.get('http://localhost:3000/api/productos');
    setProductos(res.data);
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);

    if (existe) {
      setCarrito(carrito.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarProducto = (id) => {
    setCarrito(carrito.filter(p => p.id !== id));
  };

  const sumarCantidad = (id) => {
    setCarrito(carrito.map(p =>
      p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p
    ));
  };

  const restarCantidad = (id) => {
    setCarrito(carrito.map(p =>
      p.id === id && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1 } : p
    ));
  };

  const total = carrito.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

 const comprar = async () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    await axios.post('http://localhost:3000/api/pedidos', {
      carrito,
      total,
      usuario_id: usuario.id
    });

    setMensajeCompra(true);
    setCarrito([]);
    setCarritoAbierto(false);

    setTimeout(() => {
      setMensajeCompra(false);
    }, 2500);

  } catch (error) {
    console.error(error);
    alert("Error al procesar compra.");
  }
};

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // 🔴 SI NO HAY LOGIN
  if (!usuario) {
    if (window.location.pathname === '/admin-login') {
      return <AdminLogin theme={theme} toggleTheme={toggleTheme} />;
    }
    return <Login theme={theme} toggleTheme={toggleTheme} />;
  }

  // 🔴 SI ES ADMIN
  if (usuario.rol === "admin") return <Admin theme={theme} toggleTheme={toggleTheme} />;

  // USUARIO NORMAL
  return (
    <div>

      <div className="navbar">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#navCartApp)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="navCartApp" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-color)" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span className="nav-brand">Tu Tienda Amiga</span>
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'}}>
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          <span>Hola, {usuario.nombre}</span>
          <button className="btn-danger" onClick={logout}>Salir</button>
        </div>
      </div>

      {/* CATALOGO DE PRODUCTOS — ANCHO COMPLETO */}
      <div className="catalogo-container">
        <div className="productos">
          {productos.map(p => (
            <div className="card" key={p.id}>

              {p.imagen && (
                <img
                  src={`http://localhost:3000/uploads/${p.imagen}`}
                  alt={p.nombre}
                />
              )}

              <div className="card-info">
                <h3>{p.nombre}</h3>
                {p.descripcion && <p className="card-desc">{p.descripcion}</p>}
                <p className="card-price">${Number(p.precio).toLocaleString()}</p>
              </div>

              <button className="btn-add-cart" onClick={() => agregarAlCarrito(p)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTON FLOTANTE DEL CARRITO */}
      <button
        className="cart-fab"
        onClick={() => setCarritoAbierto(true)}
        id="cart-fab-button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </button>

      {/* OVERLAY */}
      {carritoAbierto && (
        <div
          className="drawer-overlay"
          onClick={() => setCarritoAbierto(false)}
        />
      )}

      {/* DRAWER DEL CARRITO */}
      <div className={`cart-drawer glass-panel ${carritoAbierto ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Tu Carrito</h2>
          <button
            className="drawer-close"
            onClick={() => setCarritoAbierto(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {carrito.length === 0 ? (
            <div className="cart-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.4}}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Tu carrito esta vacio</p>
              <span>Agrega productos para comenzar</span>
            </div>
          ) : (
            carrito.map(p => (
              <div className="drawer-item" key={p.id}>
                <div className="drawer-item-info">
                  <span className="drawer-item-name">{p.nombre}</span>
                  <span className="drawer-item-price">${(Number(p.precio) * p.cantidad).toLocaleString()}</span>
                </div>
                <div className="drawer-item-actions">
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => restarCantidad(p.id)}>-</button>
                    <span className="qty-value">{p.cantidad}</span>
                    <button className="qty-btn" onClick={() => sumarCantidad(p.id)}>+</button>
                  </div>
                  <button className="btn-remove" onClick={() => eliminarProducto(p.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-total">
              <span>Total</span>
              <span className="drawer-total-price">${total.toLocaleString()}</span>
            </div>
            <button className="btn-checkout" onClick={comprar}>Finalizar Compra</button>
          </div>
        )}
      </div>

      {/* MENSAJE DE CONFIRMACION */}
      {mensajeCompra && (
        <div className="mensaje-compra">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h2>Compra exitosa</h2>
          <p>Tu pedido ha sido procesado correctamente</p>
        </div>
      )}

    </div>
  );
}

export default App;
