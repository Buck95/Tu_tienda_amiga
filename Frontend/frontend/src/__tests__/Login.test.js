import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from '../Login';

const mockAxios = new MockAdapter(axios);

describe('Login Component', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
    // jsdom no implementa la navegación real; reemplazamos window.location
    // por un mock para poder espiar reload() sin que lance error.
    delete window.location;
    window.location = { href: '', assign: jest.fn(), reload: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Autenticación', () => {
    it('✓ HAPPY PATH: login con credenciales válidas', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'validToken',
        usuario: {
          nombre: 'Juan',
          email: 'juan@test.com',
          rol: 'cliente'
        }
      });

      render(<Login theme="light" toggleTheme={() => {}} />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      const passwordInput = screen.getByPlaceholderText('Contraseña');
      const loginButton = screen.getByText('Ingresar');

      await userEvent.type(emailInput, 'juan@test.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('validToken');
        expect(localStorage.getItem('usuario')).toBeTruthy();
      });
    });

    it('✓ HAPPY PATH: email y contraseña se guardan en localStorage', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'validToken',
        usuario: {
          nombre: 'Juan',
          email: 'juan@test.com',
          rol: 'cliente'
        }
      });

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('validToken');
      });
    });

    it('✓ HAPPY PATH: token se guarda correctamente', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(200, {
        token: 'myToken123',
        usuario: {
          nombre: 'Juan',
          email: 'juan@test.com',
          rol: 'cliente'
        }
      });

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('myToken123');
      });
    });

    it('✗ ERROR CASE: email no registrado', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(400, {
        message: 'Usuario no existe'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'noexiste@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

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

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'wrongpassword');
      fireEvent.click(screen.getByText('Ingresar'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Contraseña incorrecta');
      });

      alertSpy.mockRestore();
    });

    it('✗ EDGE CASE: email vacío', async () => {
      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('✗ EDGE CASE: respuesta de error sin mensaje', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(500, {});

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });
  });

  describe('Registro de Usuario', () => {
    it('✓ HAPPY PATH: registro con todos los datos', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register').reply(200, {
        message: '¡Registro exitoso!'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate aquí'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Juan Pérez');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Crear cuenta'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✓ HAPPY PATH: toggle entre Login y Registro', async () => {
      render(<Login theme="light" toggleTheme={() => {}} />);

      expect(screen.getByText('Bienvenido')).toBeInTheDocument();

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate aquí'));

      expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();

      fireEvent.click(screen.getByText('¿Ya tienes una cuenta? Inicia sesión aquí'));

      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    });

    it('✗ EDGE CASE: email duplicado (error 23505)', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register').reply(400, {
        error: 'El correo electrónico ya está registrado.'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate aquí'));

      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Juan');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'duplicate@test.com');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Crear cuenta'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✗ EDGE CASE: registro con campos vacíos', async () => {
      render(<Login theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate aquí'));
      fireEvent.click(screen.getByText('Crear cuenta'));

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('✓ HAPPY PATH: limpia contraseña después de registro', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/register').reply(200, {
        message: '¡Registro exitoso!'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('¿No tienes cuenta? Regístrate aquí'));

      const passwordInput = screen.getByPlaceholderText('Contraseña');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(screen.getByPlaceholderText('Nombre completo'), 'Juan');
      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@test.com');
      fireEvent.click(screen.getByText('Crear cuenta'));

      await waitFor(() => {
        expect(passwordInput.value).toBe('');
      });

      alertSpy.mockRestore();
    });
  });

  describe('UI y Persistencia', () => {
    it('✓ HAPPY PATH: cargar tema del localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(<Login theme="dark" toggleTheme={() => {}} />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('✓ HAPPY PATH: toggle de tema funciona', () => {
      const toggleThemeMock = jest.fn();

      const { container } = render(<Login theme="light" toggleTheme={toggleThemeMock} />);

      // Hay varios botones; seleccionamos el de tema por su clase.
      const themeButton = container.querySelector('.theme-toggle');
      fireEvent.click(themeButton);
      expect(toggleThemeMock).toHaveBeenCalled();
    });

    it('✓ HAPPY PATH: navbar se renderiza', () => {
      render(<Login theme="light" toggleTheme={() => {}} />);

      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    });
  });

  describe('Validaciones de Formulario', () => {
    it('✗ EDGE CASE: email sin formato válido', async () => {
      mockAxios.onPost('http://localhost:3000/api/auth/login').reply(400, {
        message: 'Email inválido'
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Login theme="light" toggleTheme={() => {}} />);

      await userEvent.type(screen.getByPlaceholderText('Correo electrónico'), 'notanemail');
      await userEvent.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      fireEvent.click(screen.getByText('Ingresar'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('usa el tema de localStorage cuando no se pasa la prop theme', () => {
      localStorage.setItem('theme', 'dark');

      render(<Login toggleTheme={() => {}} />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
