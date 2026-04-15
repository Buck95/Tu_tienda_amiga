import { Router } from 'express';
import { crearPedido } from '../controllers/pedidos.controller.js';

const router = Router();

router.post('/', crearPedido);

export default router;