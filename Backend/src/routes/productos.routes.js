import { Router } from 'express';
import { getProductos } from '../controllers/productos.controller.js';

const router = Router();

router.get('/', getProductos);

export default router;