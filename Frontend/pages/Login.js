import axios from 'axios';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });

    localStorage.setItem('token', res.data.token);
  };

  return (
    <div>
      <h2>Login</h2>
      <input onChange={e => setEmail(e.target.value)} placeholder="Email"/>
      <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password"/>
      <button onClick={login}>Ingresar</button>
    </div>
  );
}

export default Login;