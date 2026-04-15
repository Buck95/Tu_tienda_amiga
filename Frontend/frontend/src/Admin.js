import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    obtenerProductos();
    obtenerVentas();
  }, []);

  const obtenerProductos = async () => {
    const res = await axios.get('http://localhost:3000/api/productos');
    setProductos(res.data);
  };

  const obtenerVentas = async () => {
    const res = await axios.get('http://localhost:3000/api/pedidos/ventas');
    setVentas(res.data);
  };

  const agregarProducto = async () => {
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('imagen', imagen);

    await axios.post('http://localhost:3000/api/productos', formData);

    setNombre('');
    setPrecio('');
    setImagen(null);

    obtenerProductos();
  };

  return (
    <div>
      <h2>Admin</h2>

      <input placeholder="Nombre" onChange={e => setNombre(e.target.value)} />
      <input placeholder="Precio" onChange={e => setPrecio(e.target.value)} />
      <input type="file" onChange={e => setImagen(e.target.files[0])} />

      <button onClick={agregarProducto}>Agregar</button>

      <h3>Productos</h3>
      {productos.map(p => (
        <div key={p.id}>{p.nombre}</div>
      ))}

      <h3>Ventas</h3>
      {ventas.map(v => (
        <div key={v.id}>
          Pedido #{v.id} - ${v.total}
        </div>
      ))}
    </div>
  );
}

export default Admin;