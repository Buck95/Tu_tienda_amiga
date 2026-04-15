import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});