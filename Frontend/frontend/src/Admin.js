import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Admin({ theme, toggleTheme }) {

  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('productos');

  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // Sale detail
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const [detalleItems, setDetalleItems] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || localStorage.getItem('theme') || 'light');
  }, [theme]);

  useEffect(() => {
    obtenerProductos();
    obtenerVentas();
    obtenerEstadisticas();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/productos');
      setProductos(res.data);
    } catch (error) {
      console.log("Error cargando productos");
    }
  };

  const obtenerVentas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pedidos/ventas');
      setVentas(res.data);
    } catch (error) {
      console.log("No hay ventas aun");
      setVentas([]);
    }
  };

  const obtenerEstadisticas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pedidos/estadisticas');
      setStats(res.data);
    } catch (error) {
      console.log("Error estadisticas");
    }
  };

  const verDetalle = async (pedidoId) => {
    if (detalleAbierto === pedidoId) {
      setDetalleAbierto(null);
      setDetalleItems([]);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/pedidos/${pedidoId}/detalle`);
      setDetalleItems(res.data);
      setDetalleAbierto(pedidoId);
    } catch (error) {
      console.log("Error detalle");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImagen(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setImagen(null);
    setPreviewUrl(null);
    setEditingId(null);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio) {
      alert("Nombre y precio son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    formData.append('stock', stock || 0);
    if (imagen) formData.append('imagen', imagen);

    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/api/productos/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/productos', formData);
      }

      limpiarFormulario();
      obtenerProductos();
      obtenerEstadisticas();
    } catch (error) {
      console.error(error);
      alert("Error al guardar producto.");
    }
  };

  const editarProducto = (p) => {
    setEditingId(p.id);
    setNombre(p.nombre || '');
    setDescripcion(p.descripcion || '');
    setPrecio(p.precio || '');
    setStock(p.stock || '');
    setImagen(null);
    setPreviewUrl(p.imagen ? `http://localhost:3000/uploads/${p.imagen}` : null);
  };

  const borrarProducto = async (id) => {
    if (!window.confirm("Eliminar este producto?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/productos/${id}`);
      obtenerProductos();
      obtenerEstadisticas();
    } catch (error) {
      alert("Error eliminando producto.");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStockClass = (s) => {
    if (s === 0) return 'stock-out';
    if (s <= 5) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <>
      <div className="navbar">
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#navCartAdmin)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="navCartAdmin" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-color)" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="nav-brand">Panel de Administracion</span>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'}}>
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          <button className="btn-danger" onClick={logout}>Cerrar sesion</button>
        </div>
      </div>

      <div className="admin-container">

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">${Number(stats.totalVentas || 0).toLocaleString()}</span>
              <span className="stat-label">Total en ventas</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalPedidos || 0}</span>
              <span className="stat-label">Pedidos</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-icon" style={{background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalProductos || 0}</span>
              <span className="stat-label">Productos</span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            Productos
          </button>
          <button
            className={`tab-btn ${activeTab === 'ventas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ventas')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Ventas
          </button>
        </div>

        {/* PRODUCTOS TAB */}
        {activeTab === 'productos' && (
          <div className="admin-content">
            <div className="admin-form glass-panel">
              <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>

              <input placeholder="Nombre del producto" value={nombre} onChange={e => setNombre(e.target.value)} />
              <textarea placeholder="Descripcion (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows="3" />

              <input placeholder="Precio" type="number" value={precio} onChange={e => setPrecio(e.target.value)} />

              <div className="image-upload-area">
                {previewUrl ? (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                    <button className="preview-remove" onClick={() => { setImagen(null); setPreviewUrl(null); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>Seleccionar imagen</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{display: 'none'}} />
                  </label>
                )}
              </div>

              <div className="form-actions">
                <button onClick={guardarProducto}>
                  {editingId ? 'Actualizar' : 'Guardar Producto'}
                </button>
                {editingId && (
                  <button className="btn-danger" onClick={limpiarFormulario} style={{marginTop: 0}}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="admin-list glass-panel">
              <h3>Inventario ({productos.length})</h3>
              {productos.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No hay productos aun.</p>}

              <div className="product-table">
                {productos.map(p => (
                  <div className={`product-row ${editingId === p.id ? 'editing' : ''}`} key={p.id}>
                    <div className="product-row-main">
                      {p.imagen ? (
                        <img className="product-thumb" src={`http://localhost:3000/uploads/${p.imagen}`} alt={p.nombre} />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                      <div className="product-row-info">
                        <span className="product-row-name">{p.nombre}</span>
                        {p.descripcion && <span className="product-row-desc">{p.descripcion}</span>}
                      </div>
                    </div>
                    <div className="product-row-meta">
                      <span className="product-row-price">${Number(p.precio).toLocaleString()}</span>
                    </div>
                    <div className="product-row-actions">
                      <button className="action-btn edit" onClick={() => editarProducto(p)} title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="action-btn delete" onClick={() => borrarProducto(p.id)} title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VENTAS TAB */}
        {activeTab === 'ventas' && (
          <div className="ventas-section">
            <div className="admin-list glass-panel">
              <h3>Historial de Ventas ({ventas.length})</h3>
              {ventas.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No hay ventas registradas.</p>}

              {ventas.map(v => (
                <div key={v.id}>
                  <div className="venta-row" onClick={() => verDetalle(v.id)}>
                    <div className="venta-row-left">
                      <span className="venta-id">#{v.id}</span>
                      <div className="venta-info">
                        <span className="venta-cliente">{v.cliente || 'Cliente'}</span>
                        <span className="venta-fecha">{formatDate(v.fecha)}</span>
                      </div>
                    </div>
                    <div className="venta-row-right">
                      <span className="venta-total">${Number(v.total).toLocaleString()}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transform: detalleAbierto === v.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'}}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  {detalleAbierto === v.id && (
                    <div className="venta-detalle">
                      {detalleItems.map((item, i) => (
                        <div className="detalle-item" key={i}>
                          <span>{item.producto || 'Producto eliminado'}</span>
                          <span>x{item.cantidad}</span>
                          <span>${Number(item.precio).toLocaleString()}</span>
                        </div>
                      ))}
                      {detalleItems.length === 0 && <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Sin detalle disponible</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default Admin;