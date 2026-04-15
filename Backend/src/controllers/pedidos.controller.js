import pool from '../db.js';

export const crearPedido = async (req, res) => {
  const { usuario_id, productos } = req.body;

  const pedido = await pool.query(
    'INSERT INTO pedidos (usuario_id, estado) VALUES ($1,$2) RETURNING *',
    [usuario_id, 'pendiente']
  );

  for (let p of productos) {
    await pool.query(
      'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
      [pedido.rows[0].id, p.id, 1, p.precio]
    );
  }

  res.json({ msg: 'Pedido creado' });
};