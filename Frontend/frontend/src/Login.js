import { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');

  const login = async () => {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      contraseña
    });

    setToken(res.data.token);
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={e => setContraseña(e.target.value)} />

      <button onClick={login}>Ingresar</button>
    </div>
  );
}

export default Login;