import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'secreto_super_seguro';

// REGISTER
export const register = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, hashedPassword, rol]
    );

    res.json({ message: 'Usuario registrado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en registro' });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuario no existe' });
    }

    const validPassword = await bcrypt.compare(
      contraseña,
      user.contraseña
    );

    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en login' });
  }
};