import { pool } from '../db.js';

export const crearPedido = async (req, res) => {
  const { usuario_id, productos } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      'INSERT INTO pedidos (usuario_id, estado) VALUES ($1,$2) RETURNING *',
      [usuario_id, 'pendiente']
    );

    const pedidoId = pedidoResult.rows[0].id;

    for (let p of productos) {
      await client.query(
        'INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
        [pedidoId, p.id, p.cantidad || 1, p.precio]
      );
    }

    await client.query('COMMIT');
    res.json({ msg: 'Pedido creado', pedido_id: pedidoId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pedido:', error);
    res.status(500).json({ msg: 'Error al procesar el pedido' });
  } finally {
    client.release();
  }
};
