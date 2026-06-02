import pool from '../db.js';

// CREAR PEDIDO
export const crearPedido = async (req, res) => {
  try {
    const { carrito, total } = req.body;

    const pedido = await pool.query(
      'INSERT INTO pedidos (usuario_id, total) VALUES ($1,$2) RETURNING *',
      [req.body.usuario_id, total]
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

// OBTENER VENTAS CON DETALLE
export const obtenerVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.total,
        p.fecha,
        u.nombre as cliente,
        u.email as cliente_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
      LIMIT 50
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR VENTAS:", error);
    res.json([]);
  }
};

// OBTENER DETALLE DE UN PEDIDO
export const obtenerDetallePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        dp.cantidad,
        dp.precio,
        pr.nombre as producto
      FROM detalle_pedido dp
      LEFT JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = $1
    `, [id]);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR DETALLE PEDIDO:", error);
    res.json([]);
  }
};

// ESTADISTICAS BASICAS
export const obtenerEstadisticas = async (req, res) => {
  try {
    const totalVentas = await pool.query('SELECT COALESCE(SUM(total), 0) as total FROM pedidos');
    const totalPedidos = await pool.query('SELECT COUNT(*) as total FROM pedidos');
    const totalProductos = await pool.query('SELECT COUNT(*) as total FROM productos');
    const stockBajo = await pool.query('SELECT COUNT(*) as total FROM productos WHERE stock <= 5 AND stock > 0');
    const sinStock = await pool.query('SELECT COUNT(*) as total FROM productos WHERE stock = 0');

    res.json({
      totalVentas: totalVentas.rows[0].total,
      totalPedidos: totalPedidos.rows[0].total,
      totalProductos: totalProductos.rows[0].total,
      stockBajo: stockBajo.rows[0].total,
      sinStock: sinStock.rows[0].total
    });

  } catch (error) {
    console.error("ERROR ESTADISTICAS:", error);
    res.json({
      totalVentas: 0,
      totalPedidos: 0,
      totalProductos: 0,
      stockBajo: 0,
      sinStock: 0
    });
  }
};