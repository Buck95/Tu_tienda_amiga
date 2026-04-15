import { pool } from '../db.js';

export const getProductos = async (req, res) => {
  const result = await pool.query('SELECT * FROM productos');
  res.json(result.rows);
};

export const createProducto = async (req, res) => {
  const { nombre, precio, stock, tienda_id } = req.body;

  const result = await pool.query(
    'INSERT INTO productos (nombre, precio, stock, tienda_id) VALUES ($1,$2,$3,$4) RETURNING *',
    [nombre, precio, stock, tienda_id]
  );

  res.json(result.rows[0]);
};