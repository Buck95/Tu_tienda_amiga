import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';
import Admin from './Admin';
import './App.css';

function App() {

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensajeCompra, setMensajeCompra] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (usuario && usuario.rol !== "admin") {
      obtenerProductos();
    }
  }, []);

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

  const total = carrito.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );

 const comprar = async () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío 🛒");
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

    setTimeout(() => {
      setMensajeCompra(false);
    }, 2500);

  } catch (error) {
    console.error(error);
    alert("Error al procesar compra 🚨");
  }
};

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // 🔴 SI NO HAY LOGIN
  if (!usuario) return <Login />;

  // 🔴 SI ES ADMIN
  if (usuario.rol === "admin") return <Admin />;

  // 🟢 USUARIO NORMAL
  return (
    <div>

      <div className="navbar">
        <h2>Tu Tienda Amiga 🛒</h2>

        <div>
          <span>Hola, {usuario.nombre} 👋</span>
          <button onClick={logout}>Salir</button>
        </div>
      </div>

      <div className="layout">

        <div className="productos">
          {productos.map(p => (
            <div className="card" key={p.id}>

              {p.imagen && (
                <img
                  src={`http://localhost:3000/uploads/${p.imagen}`}
                  width="100"
                  alt="producto"
                />
              )}

              <h3>{p.nombre}</h3>
              <p>${p.precio}</p>

              <button onClick={() => agregarAlCarrito(p)}>
                Agregar
              </button>
            </div>
          ))}
        </div>

        <div className="carrito">
          <h2>Carrito</h2>

          {carrito.map(p => (
            <div key={p.id}>
              {p.nombre} x{p.cantidad}
              <button onClick={() => eliminarProducto(p.id)}>❌</button>
            </div>
          ))}

          <h3>Total: ${total}</h3>

          <button onClick={comprar}>Comprar</button>
        </div>

      </div>

      {/* 🎉 MENSAJE BONITO */}
      {mensajeCompra && (
        <div className="mensaje-compra">
          <h2>🎉 ¡Gracias por tu compra!</h2>
          <p>Tu pedido ha sido procesado correctamente</p>
        </div>
      )}

    </div>
  );
}

export default App;
