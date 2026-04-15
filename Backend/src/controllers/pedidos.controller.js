import pool from '../db.js';

// CREAR PEDIDO
export const crearPedido = async (req, res) => {
  try {
    const { carrito, total } = req.body;

    const pedido = await pool.query(
      'INSERT INTO pedidos (usuario_id, total) VALUES ($1,$2) RETURNING *',
      [1, total]
    );

    const pedido_id = pedido.rows[0].id;

    for (let item of carrito) {
      await pool.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio)
         VALUES ($1,$2,$3,$4)`,
        [pedido_id, item.id, item.cantidad, item.precio]
      );
    }

    res.json({ message: "Pedido guardado" });

  } catch (error) {
    console.error("ERROR PEDIDO:", error);
    res.status(500).json({ error: "Error creando pedido" });
  }
};

// 🔥 ESTA ES LA IMPORTANTE (NO ROMPE)
export const obtenerVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM pedidos ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR VENTAS:", error);
    res.json([]); // 🔥 evita que se caiga todo
  }
};