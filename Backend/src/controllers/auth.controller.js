import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// LOGIN
export const login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // 🔹 Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];

    // 🔹 Comparar contraseña
    const validPassword = await bcrypt.compare(
      contraseña,
      usuario.contraseña
    );

    if (!validPassword) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    // 🔹 Crear token
    const token = jwt.sign(
      { id: usuario.id },
      'secreto',
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

export const register = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    // 🔹 Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // 🔹 Guardar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, email, hashedPassword, 'cliente']
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar usuario' });
  }
};