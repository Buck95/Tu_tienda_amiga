import * as productosController from '../productos.controller.js';
import pool from '../../db.js';

jest.mock('../../db.js');

describe('Productos Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getProductos', () => {
    it('✓ HAPPY PATH: obtiene todos los productos', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 },
        { id: 2, nombre: 'Producto 2', precio: 200, stock: 5 }
      ];

      pool.query.mockResolvedValue({ rows: mockProductos });

      await productosController.getProductos({}, mockRes);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM productos ORDER BY id DESC');
      expect(mockRes.json).toHaveBeenCalledWith(mockProductos);
    });

    it('✓ HAPPY PATH: productos ordenados DESC por id', async () => {
      const mockProductos = [
        { id: 5, nombre: 'Producto 5', precio: 500 },
        { id: 4, nombre: 'Producto 4', precio: 400 },
        { id: 3, nombre: 'Producto 3', precio: 300 }
      ];

      pool.query.mockResolvedValue({ rows: mockProductos });

      await productosController.getProductos({}, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY id DESC')
      );
    });

    it('✗ EDGE CASE: base de datos vacía retorna array vacío', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await productosController.getProductos({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('✗ ERROR CASE: error en consulta SQL retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await productosController.getProductos({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Error obteniendo productos') })
      );
    });

    it('✓ HAPPY PATH: imagen se incluye en respuesta', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', imagen: 'producto1.jpg' }
      ];

      pool.query.mockResolvedValue({ rows: mockProductos });

      await productosController.getProductos({}, mockRes);

      expect(mockRes.json.mock.calls[0][0][0]).toHaveProperty('imagen');
    });
  });

  describe('crearProducto', () => {
    beforeEach(() => {
      mockReq = {
        body: {
          nombre: 'Nuevo Producto',
          descripcion: 'Descripción del producto',
          precio: 150,
          stock: 20
        },
        file: {
          filename: 'producto.jpg'
        }
      };
    });

    it('✓ HAPPY PATH: producto se crea correctamente', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO productos'),
        ['Nuevo Producto', 'Descripción del producto', 150, 20, 'producto.jpg']
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto creado' })
      );
    });

    it('✓ HAPPY PATH: descripción es opcional', async () => {
      mockReq.body.descripcion = '';
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[1]).toBeNull();
    });

    it('✓ HAPPY PATH: stock default a 0 si no se proporciona', async () => {
      mockReq.body.stock = undefined;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[3]).toBe(0);
    });

    it('✓ HAPPY PATH: imagen se guarda (multer)', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['producto.jpg'])
      );
    });

    it('✗ EDGE CASE: sin nombre retorna error', async () => {
      mockReq.body.nombre = '';
      pool.query.mockRejectedValue(new Error('NOT NULL constraint'));

      await productosController.crearProducto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('✗ EDGE CASE: precio = 0', async () => {
      mockReq.body.precio = 0;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[2]).toBe(0);
    });

    it('✗ EDGE CASE: stock negativo se pasa como está', async () => {
      mockReq.body.stock = -5;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[3]).toBe(-5);
    });

    it('✗ ERROR CASE: error en inserción BD retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await productosController.crearProducto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error creando producto' })
      );
    });
  });

  describe('actualizarProducto', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: 1 },
        body: {
          nombre: 'Producto Actualizado',
          descripcion: 'Nueva descripción',
          precio: 250,
          stock: 15
        },
        file: {
          filename: 'nuevo-producto.jpg'
        }
      };
    });

    it('✓ HAPPY PATH: actualizar con nueva imagen', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.actualizarProducto(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('imagen'),
        ['Producto Actualizado', 'Nueva descripción', 250, 15, 'nuevo-producto.jpg', 1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto actualizado' })
      );
    });

    it('✓ HAPPY PATH: actualizar sin imagen', async () => {
      mockReq.file = undefined;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.actualizarProducto(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('imagen'),
        ['Producto Actualizado', 'Nueva descripción', 250, 15, 1]
      );
    });

    it('✓ HAPPY PATH: solo actualizar precio', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.actualizarProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[2]).toBe(250);
    });

    it('✗ EDGE CASE: producto no existe (no throw error)', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await productosController.actualizarProducto(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto actualizado' })
      );
    });

    it('✗ ERROR CASE: error en consulta update retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await productosController.actualizarProducto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error actualizando producto' })
      );
    });
  });

  describe('eliminarProducto', () => {
    beforeEach(() => {
      mockReq = {
        params: { id: 1 }
      };
    });

    it('✓ HAPPY PATH: producto se elimina correctamente', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await productosController.eliminarProducto(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM productos WHERE id=$1',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto eliminado' })
      );
    });

    it('✗ EDGE CASE: eliminar producto no existente', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await productosController.eliminarProducto(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Producto eliminado' })
      );
    });

    it('✗ ERROR CASE: error en consulta delete retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await productosController.eliminarProducto(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error eliminando producto' })
      );
    });
  });

  describe('Manejo de Archivos (Multer)', () => {
    it('✓ HAPPY PATH: archivo se procesa si existe', async () => {
      mockReq = {
        body: {
          nombre: 'Producto',
          precio: 100,
          stock: 10
        },
        file: {
          filename: 'image.jpg'
        }
      };

      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[4]).toBe('image.jpg');
    });

    it('✓ HAPPY PATH: sin archivo, imagen es null', async () => {
      mockReq = {
        body: {
          nombre: 'Producto',
          precio: 100,
          stock: 10
        },
        file: undefined
      };

      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await productosController.crearProducto(mockReq, mockRes);

      const callArgs = pool.query.mock.calls[0][1];
      expect(callArgs[4]).toBeUndefined();
    });
  });
});
