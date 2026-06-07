import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import App from '../App';

const mockAxios = new MockAdapter(axios);

// Helpers: el contador del carrito aparece en .cart-badge (FAB) y el botón
// flotante no tiene nombre accesible, por eso lo buscamos por clase.
const badge = (container) => container.querySelector('.cart-badge');
const cartFab = (container) => container.querySelector('.cart-fab');

describe('App Component - Gestión del Carrito', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
    localStorage.setItem('usuario', JSON.stringify({ id: 1, nombre: 'Juan', rol: 'cliente' }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Gestión del Carrito', () => {
    it('✓ HAPPY PATH: agregar producto al carrito vacío', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('1');
      });
    });

    it('✓ HAPPY PATH: agregar producto existente (incrementa cantidad)', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Agregar');
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('2');
      });
    });

    it('✓ HAPPY PATH: calcular total correctamente', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 },
        { id: 2, nombre: 'Producto 2', precio: 50, stock: 5 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getAllByText(/Agregar/).length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByText('Agregar');
      fireEvent.click(addButtons[0]);
      fireEvent.click(addButtons[1]);

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('2');
      });
    });

    it('✓ HAPPY PATH: calcular totalItems correctamente', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Agregar');
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('3');
      });
    });

    it('✗ EDGE CASE: intentar agregar producto con precio "0"', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 0, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('1');
      });
    });

    it('✓ HAPPY PATH: eliminar producto del carrito', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('1');
      });

      // Abrimos el carrito y eliminamos el producto.
      fireEvent.click(cartFab(container));
      fireEvent.click(container.querySelector('.btn-remove'));

      await waitFor(() => {
        expect(badge(container)).toBeNull();
      });
    });

    it('✓ HAPPY PATH: sumar cantidad a producto', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));

      // Botón "+" dentro de los controles de cantidad.
      const plusButton = container.querySelectorAll('.qty-btn')[1];
      fireEvent.click(plusButton);

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('2');
      });
    });

    it('✓ HAPPY PATH: restar cantidad (no menor a 1)', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Agregar');
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(cartFab(container));

      // Botón "-": resta una unidad, quedando en 1.
      const minusButton = container.querySelectorAll('.qty-btn')[0];
      fireEvent.click(minusButton);

      await waitFor(() => {
        expect(badge(container)).toHaveTextContent('1');
      });
    });

    it('✗ EDGE CASE: carrito vacío después de eliminar último producto', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));
      fireEvent.click(container.querySelector('.btn-remove'));

      await waitFor(() => {
        expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument();
      });
    });
  });

  describe('Procesamiento de Compra', () => {
    it('✓ HAPPY PATH: procesar compra exitosa', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);
      mockAxios.onPost('http://localhost:3000/api/pedidos').reply(200, { message: 'Pedido guardado' });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));
      fireEvent.click(screen.getByText('Finalizar Compra'));

      await waitFor(() => {
        expect(screen.getByText('Compra exitosa')).toBeInTheDocument();
      });
    });

    it('✗ EDGE CASE: intentar comprar con carrito vacío', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(cartFab(container));

      // Con el carrito vacío no se renderiza el botón de checkout.
      expect(screen.queryByText('Finalizar Compra')).not.toBeInTheDocument();
      expect(screen.getByText('Tu carrito esta vacio')).toBeInTheDocument();
    });

    it('✗ ERROR CASE: manejo de error en axios.post', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);
      mockAxios.onPost('http://localhost:3000/api/pedidos').reply(500, { error: 'Server error' });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));
      fireEvent.click(screen.getByText('Finalizar Compra'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error al procesar compra.');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Obtención de Productos', () => {
    it('✓ HAPPY PATH: obtener productos del backend', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });
    });

    it('✓ HAPPY PATH: renderizar listado de productos', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 },
        { id: 2, nombre: 'Producto 2', precio: 200, stock: 5 }
      ]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
        expect(screen.getByText('Producto 2')).toBeInTheDocument();
      });
    });

    it('✗ EDGE CASE: respuesta vacía del backend', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      await waitFor(() => {
        const addButtons = screen.queryAllByText('Agregar');
        expect(addButtons.length).toBe(0);
      });
    });
  });

  describe('Persistencia de Datos', () => {
    it('✓ HAPPY PATH: guardar tema en localStorage', () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      expect(localStorage.getItem('theme')).toBeTruthy();
    });

    it('✓ HAPPY PATH: cargar tema del localStorage', () => {
      localStorage.setItem('theme', 'dark');
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('✓ HAPPY PATH: toggle de tema light ↔ dark', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      expect(localStorage.getItem('theme')).toBeTruthy();
    });

    it('✓ HAPPY PATH: logout borra localStorage', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      expect(localStorage.getItem('usuario')).toBeTruthy();
    });
  });

  describe('Autenticación y Enrutamiento', () => {
    it('✓ HAPPY PATH: usuario autenticado ve tienda', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });
    });

    it('✓ HAPPY PATH: mostrar nombre de usuario en navbar', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Hola, Juan/)).toBeInTheDocument();
      });
    });

    it('✓ HAPPY PATH: botón logout disponible', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Salir')).toBeInTheDocument();
      });
    });
  });

  describe('Interfaz de Usuario', () => {
    it('✓ HAPPY PATH: botón carrito flotante se renderiza', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(cartFab(container)).toBeInTheDocument();
      });
    });

    it('✓ HAPPY PATH: drawer del carrito se abre y cierra', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));

      await waitFor(() => {
        expect(container.querySelector('.cart-drawer')).toHaveClass('open');
      });

      // Cerramos con el botón de cierre del drawer.
      fireEvent.click(container.querySelector('.drawer-close'));

      await waitFor(() => {
        expect(container.querySelector('.cart-drawer')).not.toHaveClass('open');
      });
    });

    it('✓ HAPPY PATH: mensaje de compra exitosa se muestra', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);
      mockAxios.onPost('http://localhost:3000/api/pedidos').reply(200, { message: 'Pedido guardado' });

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));
      fireEvent.click(screen.getByText('Finalizar Compra'));

      await waitFor(() => {
        expect(screen.getByText('Compra exitosa')).toBeInTheDocument();
      });
    });

    it('✓ HAPPY PATH: cerrar el carrito con el overlay', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10 }
      ]);

      const { container } = render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Agregar'));
      fireEvent.click(cartFab(container));

      await waitFor(() => {
        expect(container.querySelector('.drawer-overlay')).toBeInTheDocument();
      });

      fireEvent.click(container.querySelector('.drawer-overlay'));

      await waitFor(() => {
        expect(container.querySelector('.cart-drawer')).not.toHaveClass('open');
      });
    });
  });

  describe('Enrutamiento y sesión', () => {
    it('muestra Login cuando no hay usuario', () => {
      localStorage.clear();
      delete window.location;
      window.location = { pathname: '/', href: '', reload: jest.fn() };

      render(<App />);

      expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    });

    it('muestra AdminLogin en la ruta /admin-login', () => {
      localStorage.clear();
      delete window.location;
      window.location = { pathname: '/admin-login', href: '', reload: jest.fn() };

      render(<App />);

      expect(screen.getByText('Acceso Admin')).toBeInTheDocument();
    });

    it('renderiza el panel de Admin para un usuario admin', async () => {
      localStorage.setItem('usuario', JSON.stringify({ id: 1, nombre: 'Admin', rol: 'admin' }));
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0, totalPedidos: 0, totalProductos: 0
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Panel de Administracion')).toBeInTheDocument();
      });
    });

    it('logout borra el usuario del localStorage', async () => {
      delete window.location;
      window.location = { pathname: '/', href: '', reload: jest.fn() };
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Salir')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Salir'));

      expect(localStorage.getItem('usuario')).toBeNull();
    });
  });
});
