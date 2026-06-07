import * as pedidosController from '../pedidos.controller.js';
import pool from '../../db.js';

jest.mock('../../db.js');

describe('Pedidos Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('crearPedido', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          carrito: [
            { id: 1, nombre: 'Producto 1', precio: 100, cantidad: 2 },
            { id: 2, nombre: 'Producto 2', precio: 50, cantidad: 1 }
          ],
          total: 250,
          usuario_id: 5
        }
      };
    });

    it('✓ HAPPY PATH: pedido se crea correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10, usuario_id: 5, total: 250 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO pedidos'),
        [5, 250]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Pedido guardado' })
      );
    });

    it('✓ HAPPY PATH: detalle_pedido se crea para cada item', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(pool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO detalle_pedido'),
        [10, 1, 2, 100]
      );
      expect(pool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO detalle_pedido'),
        [10, 2, 1, 50]
      );
    });

    it('✓ HAPPY PATH: total se guarda correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        [5, 250]
      );
    });

    it('✓ HAPPY PATH: múltiples items en carrito', async () => {
      mockReq.body.carrito = [
        { id: 1, precio: 100, cantidad: 1 },
        { id: 2, precio: 50, cantidad: 2 },
        { id: 3, precio: 200, cantidad: 1 }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(4);
    });

    it('✗ EDGE CASE: carrito con 1 item', async () => {
      mockReq.body.carrito = [{ id: 1, precio: 100, cantidad: 1 }];

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('✗ EDGE CASE: total = 0', async () => {
      mockReq.body.total = 0;

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        [5, 0]
      );
    });

    it('✗ ERROR CASE: usuario_id inválido', async () => {
      mockReq.body.usuario_id = 'invalid';

      pool.query.mockRejectedValue(new Error('Invalid user_id'));

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('✗ ERROR CASE: error en inserción de pedido retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await pedidosController.crearPedido(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error creando pedido' })
      );
    });
  });

  describe('obtenerVentas', () => {
    it('✓ HAPPY PATH: obtener todas las ventas', async () => {
      const mockVentas = [
        { id: 1, total: 250, fecha: '2026-06-07', cliente: 'Juan', cliente_email: 'juan@test.com' },
        { id: 2, total: 150, fecha: '2026-06-06', cliente: 'María', cliente_email: 'maria@test.com' }
      ];

      pool.query.mockResolvedValue({ rows: mockVentas });

      await pedidosController.obtenerVentas({}, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockVentas);
    });

    it('✓ HAPPY PATH: incluye nombre del cliente', async () => {
      const mockVentas = [
        { id: 1, total: 250, cliente: 'Juan' }
      ];

      pool.query.mockResolvedValue({ rows: mockVentas });

      await pedidosController.obtenerVentas({}, mockRes);

      expect(mockRes.json.mock.calls[0][0][0]).toHaveProperty('cliente');
    });

    it('✓ HAPPY PATH: incluye email del cliente', async () => {
      const mockVentas = [
        { id: 1, total: 250, cliente_email: 'juan@test.com' }
      ];

      pool.query.mockResolvedValue({ rows: mockVentas });

      await pedidosController.obtenerVentas({}, mockRes);

      expect(mockRes.json.mock.calls[0][0][0]).toHaveProperty('cliente_email');
    });

    it('✓ HAPPY PATH: ordenadas DESC por id', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await pedidosController.obtenerVentas({}, mockRes);

      const callArgs = pool.query.mock.calls[0][0];
      expect(callArgs).toContain('ORDER BY p.id DESC');
    });

    it('✓ HAPPY PATH: máximo 50 registros (LIMIT)', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await pedidosController.obtenerVentas({}, mockRes);

      const callArgs = pool.query.mock.calls[0][0];
      expect(callArgs).toContain('LIMIT 50');
    });

    it('✗ EDGE CASE: sin ventas registradas retorna array vacío', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await pedidosController.obtenerVentas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('✗ EDGE CASE: pedido con usuario_id NULL (LEFT JOIN)', async () => {
      const mockVentas = [
        { id: 1, total: 250, cliente: null, cliente_email: null }
      ];

      pool.query.mockResolvedValue({ rows: mockVentas });

      await pedidosController.obtenerVentas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ cliente: null })
      ]));
    });

    it('✗ ERROR CASE: error en consulta retorna array vacío', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await pedidosController.obtenerVentas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('obtenerDetallePedido', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: 10 }
      };
    });

    it('✓ HAPPY PATH: obtener detalle de pedido específico', async () => {
      const mockDetalle = [
        { cantidad: 2, precio: 100, producto: 'Producto 1' },
        { cantidad: 1, precio: 50, producto: 'Producto 2' }
      ];

      pool.query.mockResolvedValue({ rows: mockDetalle });

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [10]
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockDetalle);
    });

    it('✓ HAPPY PATH: cantidad correcta para cada item', async () => {
      const mockDetalle = [
        { cantidad: 2, precio: 100, producto: 'Producto 1' }
      ];

      pool.query.mockResolvedValue({ rows: mockDetalle });

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0][0].cantidad).toBe(2);
    });

    it('✓ HAPPY PATH: precio correcto para cada item', async () => {
      const mockDetalle = [
        { cantidad: 2, precio: 100, producto: 'Producto 1' }
      ];

      pool.query.mockResolvedValue({ rows: mockDetalle });

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0][0].precio).toBe(100);
    });

    it('✗ EDGE CASE: pedido sin detalles', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('✗ EDGE CASE: producto eliminado retorna nombre NULL', async () => {
      const mockDetalle = [
        { cantidad: 1, precio: 50, producto: null }
      ];

      pool.query.mockResolvedValue({ rows: mockDetalle });

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(mockRes.json.mock.calls[0][0][0].producto).toBeNull();
    });

    it('✗ ERROR CASE: error en consulta retorna array vacío', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await pedidosController.obtenerDetallePedido(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('obtenerEstadisticas', () => {
    it('✓ HAPPY PATH: calcula totalVentas correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 5000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 10 }] })
        .mockResolvedValueOnce({ rows: [{ total: 50 }] })
        .mockResolvedValueOnce({ rows: [{ total: 5 }] })
        .mockResolvedValueOnce({ rows: [{ total: 2 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ totalVentas: 5000 })
      );
    });

    it('✓ HAPPY PATH: cuenta totalPedidos correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 5000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 10 }] })
        .mockResolvedValueOnce({ rows: [{ total: 50 }] })
        .mockResolvedValueOnce({ rows: [{ total: 5 }] })
        .mockResolvedValueOnce({ rows: [{ total: 2 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ totalPedidos: 10 })
      );
    });

    it('✓ HAPPY PATH: cuenta totalProductos correctamente', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 5000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 10 }] })
        .mockResolvedValueOnce({ rows: [{ total: 50 }] })
        .mockResolvedValueOnce({ rows: [{ total: 5 }] })
        .mockResolvedValueOnce({ rows: [{ total: 2 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ totalProductos: 50 })
      );
    });

    it('✓ HAPPY PATH: calcula stockBajo (1-5)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 8 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ stockBajo: 8 })
      );
    });

    it('✓ HAPPY PATH: calcula sinStock (0)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 3 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ sinStock: 3 })
      );
    });

    it('✗ EDGE CASE: sin pedidos retorna totalVentas = 0 (COALESCE)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [{ total: 0 }] });

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ totalVentas: 0 })
      );
    });

    it('✗ ERROR CASE: error en cualquier agregación retorna defaults', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await pedidosController.obtenerEstadisticas({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0,
        stockBajo: 0,
        sinStock: 0
      });
    });
  });

  describe('Validaciones de Transacciones', () => {
    it('✓ HAPPY PATH: inserta pedido antes que detalles', async () => {
      mockReq = {
        body: {
          carrito: [{ id: 1, precio: 100, cantidad: 1 }],
          total: 100,
          usuario_id: 5
        }
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({});

      await pedidosController.crearPedido(mockReq, mockRes);

      const firstCall = pool.query.mock.calls[0];
      expect(firstCall[0]).toContain('INSERT INTO pedidos');
    });
  });
});
