import pool from '../db.js';

export const getProductos = async (req, res) => {
  const result = await pool.query('SELECT * FROM productos');
  res.json(result.rows);
};