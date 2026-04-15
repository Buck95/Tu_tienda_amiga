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
    try {
      const res = await axios.get('http://localhost:3000/api/pedidos/ventas');
      setVentas(res.data);
  }   catch (error) {
      console.log("No hay ventas aún");
      setVentas([]);
  }
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

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="admin-container">

      <div className="admin-navbar">
        <h2>Panel Admin ⚙️</h2>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <div className="admin-content">

        <div className="admin-form">
          <h3>Agregar producto</h3>

          <input placeholder="Nombre" onChange={e => setNombre(e.target.value)} />
          <input placeholder="Precio" onChange={e => setPrecio(e.target.value)} />
          <input type="file" onChange={e => setImagen(e.target.files[0])} />

          <button onClick={agregarProducto}>Agregar</button>
        </div>

        <div className="admin-list">
          <h3>Productos</h3>

          {productos.map(p => (
            <div key={p.id}>
              {p.nombre} - ${p.precio}
            </div>
          ))}

          <h3>Ventas</h3>

          {ventas.map(v => (
            <div key={v.id}>
              Pedido #{v.id} - ${v.total}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Admin;