import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        contraseña
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));

      window.location.reload();

    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Error en login");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setContraseña(e.target.value)}
      /><br /><br />

      <button onClick={handleLogin}>
        Ingresar
      </button>
    </div>
  );
}

export default Login;