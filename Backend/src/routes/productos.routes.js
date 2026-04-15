import { Router } from 'express';
import { getProductos, crearProducto, eliminarProducto } from '../controllers/productos.controller.js';
import upload from '../middleware/upload.js';

const router = Router();

router.get('/', getProductos);
router.post('/', upload.single('imagen'), crearProducto);
router.delete('/:id', eliminarProducto);

export default router;