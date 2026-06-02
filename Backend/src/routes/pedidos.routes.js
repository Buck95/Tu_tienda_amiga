import { Router } from 'express';
import { crearPedido, obtenerVentas, obtenerDetallePedido, obtenerEstadisticas } from '../controllers/pedidos.controller.js';

const router = Router();

router.post('/', crearPedido);
router.get('/ventas', obtenerVentas);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id/detalle', obtenerDetallePedido);

export default router;