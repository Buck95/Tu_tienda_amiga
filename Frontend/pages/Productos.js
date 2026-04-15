import axios from 'axios';
import { useEffect, useState } from 'react';

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/productos')
      .then(res => setProductos(res.data));
  }, []);

  return (
    <div>
      <h2>Productos</h2>
      {productos.map(p => (
        <div key={p.id}>
          {p.nombre} - ${p.precio}
        </div>
      ))}
    </div>
  );
}

export default Productos;