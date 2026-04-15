import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/productos')
      .then(res => {
        setProductos(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 Tu Tienda Amiga</h1>

      {productos.length === 0 ? (
        <p>No hay productos disponibles</p>
      ) : (
        productos.map(p => (
          <div key={p.id} style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px"
          }}>
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <strong>${p.precio}</strong>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
