import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';

function App() {

  // 🔐 Estado del login
  const [token, setToken] = useState(null);

  // 🛒 Estados normales
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // 🔹 Cargar productos SOLO si está logueado
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3000/api/productos')
        .then(res => setProductos(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // 🔹 Agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  // 🔹 Crear pedido
  const hacerPedido = async () => {
    try {
      await axios.post('http://localhost:3000/api/pedidos', {
        usuario_id: 1,
        productos: carrito
      });

      alert('✅ Pedido realizado');
      setCarrito([]);
    } catch (error) {
      alert('❌ Error al hacer pedido');
    }
  };

  // 🔐 SI NO ESTÁ LOGUEADO → mostrar login
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // 🛍️ SI ESTÁ LOGUEADO → mostrar tienda
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      background: "#f4f6f8",
      minHeight: "100vh",
      padding: "20px"
    }}>

      <div style={{
        width: "900px",
        background: "white",
        padding: "20px",
        borderRadius: "10px"
      }}>

        <h1 style={{ textAlign: "center" }}>🛒 Tu Tienda Amiga</h1>

        <h2>Productos</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px"
        }}>
          {productos.map(p => (
            <div key={p.id} style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "8px"
            }}>
              <h3>{p.nombre}</h3>
              <p>{p.descripcion}</p>
              <strong>${p.precio}</strong>

              <br /><br />

              <button onClick={() => agregarAlCarrito(p)}>
                Agregar
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: "30px" }}>🛒 Carrito</h2>

        {carrito.length === 0 ? (
          <p>Carrito vacío</p>
        ) : (
          carrito.map((item, i) => (
            <div key={i}>
              {item.nombre} - ${item.precio}
            </div>
          ))
        )}

        {carrito.length > 0 && (
          <button
            onClick={hacerPedido}
            style={{
              marginTop: "20px",
              padding: "10px",
              background: "green",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Comprar
          </button>
        )}

      </div>
    </div>
  );
}

export default App;