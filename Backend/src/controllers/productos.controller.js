import pool from '../db.js';

export const getProductos = async (req, res) => {
  const result = await pool.query('SELECT * FROM productos');
  res.json(result.rows);
};

export const crearProducto = async (req, res) => {
  const { nombre, precio } = req.body;
  const imagen = req.file?.filename;

  await pool.query(
    'INSERT INTO productos (nombre, precio, imagen) VALUES ($1,$2,$3)',
    [nombre, precio, imagen]
  );

  res.json({ message: "Producto creado" });
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM productos WHERE id=$1', [id]);

  res.json({ message: "Producto eliminado" });
};