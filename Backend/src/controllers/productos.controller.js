import pool from '../db.js';

export const getProductos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET PRODUCTOS:", error);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body;
    const imagen = req.file?.filename;

    await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES ($1,$2,$3,$4,$5)',
      [nombre, descripcion || null, precio, stock || 0, imagen]
    );

    res.json({ message: "Producto creado" });
  } catch (error) {
    console.error("ERROR CREAR PRODUCTO:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;
    const imagen = req.file?.filename;

    if (imagen) {
      await pool.query(
        'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4, imagen=$5 WHERE id=$6',
        [nombre, descripcion || null, precio, stock || 0, imagen, id]
      );
    } else {
      await pool.query(
        'UPDATE productos SET nombre=$1, descripcion=$2, precio=$3, stock=$4 WHERE id=$5',
        [nombre, descripcion || null, precio, stock || 0, id]
      );
    }

    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error("ERROR ACTUALIZAR PRODUCTO:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id=$1', [id]);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("ERROR ELIMINAR PRODUCTO:", error);
    res.status(500).json({ error: "Error eliminando producto" });
  }
};