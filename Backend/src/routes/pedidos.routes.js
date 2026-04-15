import { Router } from 'express';
import { crearPedido, obtenerVentas } from '../controllers/pedidos.controller.js';

const router = Router();

router.post('/', crearPedido);
router.get('/ventas', obtenerVentas);

export default router;