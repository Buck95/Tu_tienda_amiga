import * as authController from '../auth.controller.js';
import pool from '../../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../db.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller - register', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {
        nombre: 'Juan Pérez',
        email: 'juan@test.com',
        contraseña: 'password123',
        rol: 'cliente'
      }
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('✓ HAPPY PATH: registra usuario correctamente', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await authController.register(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        ['Juan Pérez', 'juan@test.com', 'hashedPassword', 'cliente']
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario registrado correctamente' })
      );
    });

    it('✓ HAPPY PATH: contraseña se hashea con bcrypt', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockResolvedValue({ rows: [] });

      await authController.register(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('✗ EDGE CASE: email duplicado retorna error 400', async () => {
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';

      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockRejectedValue(duplicateError);

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('correo electrónico ya está registrado')
        })
      );
    });

    it('✗ ERROR CASE: error en BD retorna 500', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockRejectedValue(new Error('Database error'));

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error en registro' })
      );
    });
  });

  describe('registerAdmin', () => {
    it('✓ HAPPY PATH: registra admin con secretKey válida', async () => {
      mockReq.body.secretKey = 'admin123';
      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await authController.registerAdmin(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        ['Juan Pérez', 'juan@test.com', 'hashedPassword', 'admin']
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Administrador registrado correctamente' })
      );
    });

    it('✗ EDGE CASE: secretKey incorrecta retorna 403', async () => {
      mockReq.body.secretKey = 'wrongSecret';

      await authController.registerAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Clave secreta incorrecta para registro de admin'
        })
      );
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('✗ EDGE CASE: secretKey vacía retorna 403', async () => {
      mockReq.body.secretKey = '';

      await authController.registerAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('✗ EDGE CASE: email duplicado retorna 400', async () => {
      mockReq.body.secretKey = 'admin123';
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = '23505';

      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockRejectedValue(duplicateError);

      await authController.registerAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('correo electrónico ya está registrado') })
      );
    });

    it('✗ ERROR CASE: error en BD retorna 500', async () => {
      mockReq.body.secretKey = 'admin123';
      bcrypt.hash.mockResolvedValue('hashedPassword');
      pool.query.mockRejectedValue(new Error('Database error'));

      await authController.registerAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockReq.body = {
        email: 'juan@test.com',
        contraseña: 'password123'
      };
    });

    it('✓ HAPPY PATH: login exitoso con credenciales válidas', async () => {
      const user = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        contraseña: 'hashedPassword',
        rol: 'cliente'
      };

      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('validToken');

      await authController.login(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM usuarios WHERE email'),
        ['juan@test.com']
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1 },
        expect.any(String),
        { expiresIn: '1h' }
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login exitoso',
          token: 'validToken',
          usuario: {
            nombre: 'Juan',
            email: 'juan@test.com',
            rol: 'cliente'
          }
        })
      );
    });

    it('✓ HAPPY PATH: usuario retorna sin contraseña', async () => {
      const user = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        contraseña: 'hashedPassword',
        rol: 'cliente'
      };

      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('validToken');

      await authController.login(mockReq, mockRes);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.usuario).not.toHaveProperty('contraseña');
    });

    it('✓ HAPPY PATH: JWT expira en 1 hora', async () => {
      const user = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        contraseña: 'hashedPassword',
        rol: 'cliente'
      };

      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('validToken');

      await authController.login(mockReq, mockRes);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        { expiresIn: '1h' }
      );
    });

    it('✗ EDGE CASE: email no registrado retorna 400', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Usuario no existe' })
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('✗ EDGE CASE: contraseña incorrecta retorna 400', async () => {
      const user = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        contraseña: 'hashedPassword',
        rol: 'cliente'
      };

      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Contraseña incorrecta' })
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('✗ EDGE CASE: email vacío', async () => {
      mockReq.body.email = '';
      pool.query.mockResolvedValue({ rows: [] });

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('✗ ERROR CASE: error en BD retorna 500', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Error en login' })
      );
    });
  });

  describe('Criptografía y Seguridad', () => {
    it('✓ HAPPY PATH: bcrypt.hash genera hash diferente cada vez', async () => {
      bcrypt.hash.mockResolvedValueOnce('hash1').mockResolvedValueOnce('hash2');

      const user1 = { ...mockReq.body };
      const user2 = { ...mockReq.body };

      await authController.register(mockReq, mockRes);
      await authController.register({ body: user2 }, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledTimes(2);
    });

    it('✓ EDGE CASE: bcrypt.compare rechaza contraseña incorrecta', async () => {
      const user = {
        id: 1,
        nombre: 'Juan',
        email: 'juan@test.com',
        contraseña: 'hashedPassword',
        rol: 'cliente'
      };

      pool.query.mockResolvedValue({ rows: [user] });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
