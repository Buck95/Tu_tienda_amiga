import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

export const register = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  const hash = await bcrypt.hash(contraseña, 10);

  const result = await pool.query(
    'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1,$2,$3,$4) RETURNING *',
    [nombre, email, hash, 'cliente']
  );

  res.json(result.rows[0]);
};

export const login = async (req, res) => {
  const { email, contraseña } = req.body;

  const user = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);

  if (user.rows.length === 0) {
    return res.status(400).json({ msg: 'Usuario no existe' });
  }

  const valid = await bcrypt.compare(contraseña, user.rows[0].contraseña);

  if (!valid) return res.status(400).json({ msg: 'Contraseña incorrecta' });

  const token = jwt.sign(
    { id: user.rows[0].id, rol: user.rows[0].rol },
    'secreto',
    { expiresIn: '1h' }
  );

  res.json({ token });
};