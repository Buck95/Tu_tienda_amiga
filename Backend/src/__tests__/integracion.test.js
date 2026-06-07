import express from 'express';
import request from 'supertest';
import bcrypt from 'bcrypt';

import pool from '../db.js';
import authRoutes from '../routes/auth.routes.js';
import productosRoutes from '../routes/productos.routes.js';
import pedidosRoutes from '../routes/pedidos.routes.js';

// 🔌 Mockeamos ÚNICAMENTE la capa de base de datos (pg / pool).
//    bcrypt y jwt se ejecutan de verdad para validar el flujo completo
//    Ruta -> Controlador -> Respuesta.
jest.mock('../db.js');

// 🏗️  App de pruebas: monta exactamente las mismas rutas que producción
//     (src/app.js) pero SIN app.listen, para que supertest la maneje.
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);

describe('Pruebas de Integración (Ruta → Controlador → Respuesta)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1️⃣ AUTH
  it('Auth: POST /api/auth/login retorna 200 y un token JWT', async () => {
    // bcrypt REAL: hasheamos la contraseña que devolverá la BD mockeada.
    const hash = await bcrypt.hash('password123', 10);
    pool.query.mockResolvedValue({
      rows: [
        { id: 1, nombre: 'Juan', email: 'juan@test.com', contraseña: hash, rol: 'cliente' }
      ]
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@test.com', contraseña: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    // Un JWT tiene 3 segmentos separados por puntos.
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.usuario).toMatchObject({ email: 'juan@test.com', rol: 'cliente' });
  });

  // 2️⃣ CATÁLOGO
  it('Catálogo: GET /api/productos retorna 200 y la lista de productos', async () => {
    const productosMock = [
      { id: 2, nombre: 'Leche', descripcion: 'Leche entera', precio: '3000', stock: 15 },
      { id: 1, nombre: 'Arroz', descripcion: 'Arroz blanco 1kg', precio: '2000', stock: 20 }
    ];
    pool.query.mockResolvedValue({ rows: productosMock });

    const res = await request(app).get('/api/productos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('nombre', 'Leche');
  });

  // 3️⃣ PEDIDOS
  it('Pedidos: POST /api/pedidos guarda el carrito y retorna 200', async () => {
    // 1ª query → INSERT del pedido (RETURNING id); las siguientes → INSERT de cada detalle.
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 99 }] })
      .mockResolvedValue({ rows: [] });

    const payload = {
      usuario_id: 1,
      total: 5000,
      carrito: [
        { id: 1, cantidad: 2, precio: 2000 },
        { id: 2, cantidad: 1, precio: 1000 }
      ]
    };

    const res = await request(app).post('/api/pedidos').send(payload);

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('message', 'Pedido guardado');
    // 1 INSERT del pedido + 1 INSERT por cada ítem del carrito.
    expect(pool.query).toHaveBeenCalledTimes(1 + payload.carrito.length);
  });
});
