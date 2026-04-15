import { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');

  const login = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        contraseña
      });

      setToken(res.data.token);
    } catch (error) {
      alert('Error en login');
    }
  };

  return (
    <div style={{
      textAlign: "center",
      marginBottom: "20px"
    }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Contraseña"
        onChange={e => setContraseña(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>
        Ingresar
      </button>
    </div>
  );
}

export default Login;