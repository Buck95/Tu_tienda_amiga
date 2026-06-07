import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AdminLogin from '../AdminLogin';

const mockAxios = new MockAdapter(axios);

describe('AdminLogin Component', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
    // jsdom no implementa la navegación real; reemplazamos window.location
    // por un mock para poder asignar href / reload sin que lance error.
    delete window.location;
    window.location = { href: '', assign: jest.fn(), reload: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Autenticación Admin', () => {
    it('✓ HAPPY PATH: login admin con credenciales válidas', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'adminToken',
        usuario: {
          nombre: 'Admin',
          email: 'admin@test.com',
          rol: 'admin'
        }
      });

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'adminpassword');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('adminToken');
      });
    });

    it('✓ HAPPY PATH: guardar token y usuario en localStorage', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'adminToken',
        usuario: {
          nombre: 'Admin',
          email: 'admin@test.com',
          rol: 'admin'
        }
      });

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'adminpassword');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(localStorage.getItem('usuario')).toBeTruthy();
      });
    });

    it('✗ EDGE CASE: usuario no-admin no puede ingresar', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'userToken',
        usuario: {
          nombre: 'User',
          email: 'user@test.com',
          rol: 'cliente'
        }
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'user@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('Acceso denegado')
        );
      });

      alertSpy.mockRestore();
    });

    it('✗ ERROR CASE: email no registrado', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(400, {
        message: 'Usuario no existe'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'noexiste@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Usuario no existe');
      });

      alertSpy.mockRestore();
    });

    it('✗ ERROR CASE: contraseña incorrecta', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(400, {
        message: 'Contraseña incorrecta'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'wrongpassword');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Contraseña incorrecta');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Registro de Admin', () => {
    it('✓ HAPPY PATH: registro admin con secretKey válida', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register-admin').reply(200, {
        message: '¡Administrador registrado con éxito!'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Admin Name');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'newadmin@test.com');
      await userEvent.type(screen.getAllByPlaceholderText('Contraseña')[0], 'adminpassword');
      await userEvent.type(screen.getByPlaceholderText('Clave Secreta de Admin'), 'admin123');
      fireEvent.click(screen.getByText('Registrar Administrador'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✗ EDGE CASE: secretKey incorrecta', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register-admin').reply(403, {
        error: 'Clave secreta incorrecta para registro de admin'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Admin Name');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getAllByPlaceholderText('Contraseña')[0], 'password123');
      await userEvent.type(screen.getByPlaceholderText('Clave Secreta de Admin'), 'wrongsecret');
      fireEvent.click(screen.getByText('Registrar Administrador'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✗ EDGE CASE: email duplicado', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register-admin').reply(400, {
        error: 'El correo electrónico ya está registrado.'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Admin');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'duplicate@test.com');
      await userEvent.type(screen.getAllByPlaceholderText('Contraseña')[0], 'password123');
      await userEvent.type(screen.getByPlaceholderText('Clave Secreta de Admin'), 'admin123');
      fireEvent.click(screen.getByText('Registrar Administrador'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✓ HAPPY PATH: toggle entre Login y Registro', () => {
      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      expect(screen.getByText('Acceso Admin')).toBeInTheDocument();

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      expect(screen.getByText('Nuevo Administrador')).toBeInTheDocument();

      fireEvent.click(screen.getByText('¿Ya tienes una cuenta? Inicia sesión'));

      expect(screen.getByText('Acceso Admin')).toBeInTheDocument();
    });

    it('✓ HAPPY PATH: limpiar formulario después de registro', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register-admin').reply(200, {
        message: '¡Registro exitoso!'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      const passwordInputs = screen.getAllByPlaceholderText('Contraseña');
      const secretKeyInput = screen.getByPlaceholderText('Clave Secreta de Admin');

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Admin');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(secretKeyInput, 'admin123');
      fireEvent.click(screen.getByText('Registrar Administrador'));

      await waitFor(() => {
        // Tras registrar, el componente vuelve al modo Login: la contraseña
        // se limpia y el campo de Clave Secreta deja de renderizarse.
        expect(passwordInputs[0].value).toBe('');
        expect(screen.queryByPlaceholderText('Clave Secreta de Admin')).not.toBeInTheDocument();
      });

      alertSpy.mockRestore();
    });
  });

  describe('Navegación', () => {
    it('✓ HAPPY PATH: link para volver a tienda', () => {
      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      const backLink = screen.getByText('← Volver a la Tienda');
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('✓ HAPPY PATH: cargar tema del localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(<AdminLogin theme="dark" toggleTheme={() => {}} />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('✓ HAPPY PATH: navbar se renderiza', () => {
      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      expect(screen.getByText('Panel de Control')).toBeInTheDocument();
    });

    it('usa el tema de localStorage cuando no se pasa la prop theme', () => {
      localStorage.setItem('theme', 'dark');

      render(<AdminLogin toggleTheme={() => {}} />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Mensajes por defecto', () => {
    it('login sin respuesta del servidor usa el mensaje por defecto', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').networkError();

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password');
      fireEvent.click(screen.getByText('Ingresar al Panel'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error en login de administrador');
      });

      alertSpy.mockRestore();
    });

    it('registro sin respuesta del servidor usa el mensaje por defecto', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register-admin').networkError();

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<AdminLogin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate como Admin'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Admin');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'admin@test.com');
      await userEvent.type(screen.getAllByPlaceholderText('Contraseña')[0], 'password');
      await userEvent.type(screen.getByPlaceholderText('Clave Secreta de Admin'), 'admin123');
      fireEvent.click(screen.getByText('Registrar Administrador'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error al registrar administrador');
      });

      alertSpy.mockRestore();
    });
  });
});
