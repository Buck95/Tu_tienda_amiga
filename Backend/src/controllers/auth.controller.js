import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'secreto_super_seguro';

export const register = async (req, res) => {
  const { nombre, email, contraseña, rol } = req.body;

  const hashedPassword = await bcrypt.hash(contraseña, 10);

  await pool.query(
    'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1,$2,$3,$4)',
    [nombre, email, hashedPassword, rol]
  );

  res.json({ message: 'Usuario creado' });
};

export const login = async (req, res) => {
  const { email, contraseña } = req.body;

  const result = await pool.query(
    'SELECT * FROM usuarios WHERE email=$1',
    [email]
  );

  const user = result.rows[0];

  if (!user) return res.status(400).json({ msg: 'No existe' });

  const valid = await bcrypt.compare(contraseña, user.contraseña);

  if (!valid) return res.status(400).json({ msg: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ token });
};