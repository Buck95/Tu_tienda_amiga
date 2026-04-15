import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';
import Admin from './Admin';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (usuario) obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const res = await axios.get('http://localhost:3000/api/productos');
    setProductos(res.data);
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);

    if (existe) {
      setCarrito(carrito.map(p =>
        p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
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
    await axios.post('http://localhost:3000/api/pedidos', {
      carrito,
      total
    });

    alert("Compra realizada 🛒");
    setCarrito([]);
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!usuario) return <Login />;

  if (usuario.email === "admin@gmail.com") return <Admin />;

  return (
    <div className="layout">

      <div className="productos">
        {productos.map(p => (
          <div className="card" key={p.id}>
            {p.imagen && (
              <img src={`http://localhost:3000/uploads/${p.imagen}`} width="100" />
            )}
            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>
            <button onClick={() => agregarAlCarrito(p)}>Agregar</button>
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
        <button onClick={logout}>Salir</button>
      </div>

    </div>
  );
}

export default App;