import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminLogin({ theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [secretKey, setSecretKey] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || localStorage.getItem('theme') || 'light');
  }, [theme]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        contraseña
      });

      // Verificamos si es admin
      if (res.data.usuario.rol !== 'admin') {
        alert("Acceso denegado: No tienes permisos de administrador.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));

      window.location.href = '/';

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error en login de administrador");
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/register-admin', {
        nombre,
        email,
        contraseña,
        secretKey
      });

      alert("¡Administrador registrado con éxito! Ya puedes iniciar sesión.");
      setIsRegistering(false);
      setContraseña('');
      setSecretKey('');

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.error || "Error al registrar administrador");
    }
  };

  return (
    <>
      <div className="navbar">
        <div style={{display: 'flex', alignItems: 'center'}}>
          <h2 style={{ margin: 0, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Panel de Control
          </h2>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)'}}>
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="center-container">
        <div className="login-card glass-panel" style={{ borderTop: '4px solid #ec4899' }}>
          <h2>{isRegistering ? 'Nuevo Administrador' : 'Acceso Admin'}</h2>

          {isRegistering && (
            <input
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          )}

          <input
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
          />

          {isRegistering && (
            <input
              type="password"
              placeholder="Clave Secreta de Admin"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          )}

          {isRegistering ? (
            <button onClick={handleRegister}>Registrar Administrador</button>
          ) : (
            <button onClick={handleLogin}>Ingresar al Panel</button>
          )}

          <p 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ marginTop: '15px', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            {isRegistering 
              ? '¿Ya tienes una cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate como Admin'
            }
          </p>

          <a href="/" style={{ display: 'block', marginTop: '15px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
            ← Volver a la Tienda
          </a>

        </div>
      </div>
    </>
  );
}

export default AdminLogin;
