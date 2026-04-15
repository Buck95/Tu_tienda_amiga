import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {

  const [token, setToken] = useState(null);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3000/api/productos')
        .then(res => setProductos(res.data));
    }
  }, [token]);

  const agregar = (p) => {
    setCarrito([...carrito, p]);
  };

  const comprar = async () => {
    await axios.post('http://localhost:3000/api/pedidos', {
      usuario_id: 1,
      productos: carrito
    });

    alert('Pedido realizado');
    setCarrito([]);
  };

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="container">
      <h1>Tu Tienda Amiga</h1>

      <h2>Productos</h2>

      <div className="grid">
        {productos.map(p => (
          <div className="card" key={p.id}>
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <strong>${p.precio}</strong>
            <button onClick={() => agregar(p)}>Agregar</button>
          </div>
        ))}
      </div>

      <h2>Carrito</h2>

      {carrito.map((c, i) => (
        <div key={i}>{c.nombre}</div>
      ))}

      {carrito.length > 0 && (
        <button onClick={comprar}>Comprar</button>
      )}
    </div>
  );
}

export default App;