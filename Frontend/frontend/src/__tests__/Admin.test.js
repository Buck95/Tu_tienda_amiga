import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Admin from '../Admin';

const mockAxios = new MockAdapter(axios);

describe('Admin Component', () => {
  beforeEach(() => {
    mockAxios.reset();
    localStorage.clear();
    localStorage.setItem('usuario', JSON.stringify({ nombre: 'Admin', rol: 'admin' }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Gestión de Productos (CRUD)', () => {
    it('✓ HAPPY PATH: crear producto con todos los campos', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });
      mockAxios.onPost('http://localhost:3000/api/productos').reply(200, { message: 'Producto creado' });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      const nombreInput = screen.getByPlaceholderText('Nombre del producto');
      const precioInput = screen.getByPlaceholderText('Precio');

      await userEvent.type(nombreInput, 'Nuevo Producto');
      await userEvent.type(precioInput, '100');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(mockAxios.history.post.length).toBeGreaterThan(0);
      });
    });

    it('✓ HAPPY PATH: crear producto sin descripción', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });
      mockAxios.onPost('http://localhost:3000/api/productos').reply(200, { message: 'Producto creado' });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'Producto');
      await userEvent.type(screen.getByPlaceholderText('Precio'), '100');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(mockAxios.history.post.length).toBeGreaterThan(0);
      });
    });

    it('✗ EDGE CASE: crear sin nombre (debe fallar)', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Precio')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByPlaceholderText('Precio'), '100');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Nombre y precio son obligatorios.');
      });

      alertSpy.mockRestore();
    });

    it('✗ EDGE CASE: crear sin precio (debe fallar)', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'Producto');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Nombre y precio son obligatorios.');
      });

      alertSpy.mockRestore();
    });

    it('✓ HAPPY PATH: editar producto existente', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, imagen: null }
      ];

      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, mockProductos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 1
      });
      mockAxios.onPut('http://localhost:3000/api/productos/1').reply(200, { message: 'Actualizado' });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Editar');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Producto 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Editar producto')).toBeInTheDocument();
    });

    it('✓ HAPPY PATH: eliminar producto con confirmación', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, imagen: null }
      ];

      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, mockProductos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 1
      });
      mockAxios.onDelete('http://localhost:3000/api/productos/1').reply(200, { message: 'Eliminado' });

      window.confirm = jest.fn(() => true);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Eliminar');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
      });
    });

    it('✗ EDGE CASE: intenta eliminar sin confirmar', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, imagen: null }
      ];

      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, mockProductos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 1
      });

      window.confirm = jest.fn(() => false);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Eliminar');
      fireEvent.click(deleteButtons[0]);

      expect(mockAxios.history.delete.length).toBe(0);
    });
  });

  describe('Manejo de Imágenes', () => {
    it('✓ HAPPY PATH: seleccionar imagen genera preview', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      // jsdom no implementa URL.createObjectURL; lo mockeamos para el preview.
      global.URL.createObjectURL = jest.fn(() => 'blob:preview');

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Seleccionar imagen')).toBeInTheDocument();
      });

      const fileInput = container.querySelector('input[type="file"]');

      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        const images = screen.queryAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Estadísticas y Ventas', () => {
    it('✓ HAPPY PATH: obtener estadísticas en mount', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 5000,
        totalPedidos: 10,
        totalProductos: 50,
        stockBajo: 5,
        sinStock: 2
      });

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      // Los valores usan toLocaleString (separador de miles dependiente del
      // locale); comparamos solo los dígitos para que sea robusto.
      await waitFor(() => {
        const valores = Array.from(container.querySelectorAll('.stat-value'))
          .map(e => e.textContent.replace(/\D/g, ''));
        expect(valores).toContain('5000');
        expect(valores).toContain('10');
      });
    });

    it('✓ HAPPY PATH: mostrar total de ventas', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 2500,
        totalPedidos: 0,
        totalProductos: 0
      });

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        const valores = Array.from(container.querySelectorAll('.stat-value'))
          .map(e => e.textContent.replace(/\D/g, ''));
        expect(valores).toContain('2500');
      });
    });

    it('✓ HAPPY PATH: ver detalle de pedido', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, [
        { id: 1, total: 250, fecha: '2026-06-07', cliente: 'Juan' }
      ]);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });
      mockAxios.onGet('http://localhost:3000/api/pedidos/1/detalle').reply(200, [
        { cantidad: 2, precio: 100, producto: 'Producto 1' }
      ]);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText(/Ventas/)).toBeInTheDocument();
      });

      const ventasTab = screen.getByText('Ventas');
      fireEvent.click(ventasTab);

      await waitFor(() => {
        expect(screen.getByText('Juan')).toBeInTheDocument();
      });
    });

    it('✗ EDGE CASE: sin ventas registradas', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        const ventasTab = screen.getByText('Ventas');
        fireEvent.click(ventasTab);
      });

      await waitFor(() => {
        expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
      });
    });
  });

  describe('Validación de Formulario', () => {
    it('✓ HAPPY PATH: validar campos requeridos', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
    });

    it('✓ HAPPY PATH: limpiar formulario correctamente', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      const nombreInput = screen.getByPlaceholderText('Nombre del producto');
      await userEvent.type(nombreInput, 'Test Producto');

      expect(nombreInput.value).toBe('Test Producto');
    });
  });

  describe('Navegación y UI', () => {
    it('✓ HAPPY PATH: tab navigation funciona', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(container.querySelector('.admin-tabs')).toBeInTheDocument();
      });

      // "Productos" también aparece como etiqueta de estadística; limitamos
      // la búsqueda a la barra de pestañas.
      const tabLabels = Array.from(container.querySelectorAll('.tab-btn'))
        .map(b => b.textContent.trim());
      expect(tabLabels).toContain('Productos');
      expect(tabLabels).toContain('Ventas');
    });

    it('✓ HAPPY PATH: navbar se renderiza', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, {
        totalVentas: 0,
        totalPedidos: 0,
        totalProductos: 0
      });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Panel de Administracion')).toBeInTheDocument();
      });
    });
  });

  describe('Cobertura adicional', () => {
    const okStats = {
      totalVentas: 0, totalPedidos: 0, totalProductos: 0
    };

    it('maneja errores al cargar productos, ventas y estadísticas', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').networkError();
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').networkError();
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').networkError();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      // Aun con fallos en las cargas, el panel se renderiza.
      await waitFor(() => {
        expect(screen.getByText('Panel de Administracion')).toBeInTheDocument();
      });
    });

    it('edita y actualiza un producto existente (PUT)', async () => {
      const productos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, descripcion: 'Desc', imagen: null }
      ];
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, productos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);
      mockAxios.onPut('http://localhost:3000/api/productos/1').reply(200, { message: 'Actualizado' });

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByTitle('Editar')[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar producto')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Actualizar'));

      await waitFor(() => {
        expect(mockAxios.history.put.length).toBeGreaterThan(0);
      });
    });

    it('cancela la edición y limpia el formulario', async () => {
      const productos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, imagen: null }
      ];
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, productos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByTitle('Editar')[0]);

      await waitFor(() => {
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancelar'));

      // Vuelve al modo de creación.
      await waitFor(() => {
        expect(screen.getByText('Nuevo producto')).toBeInTheDocument();
      });
    });

    it('muestra alerta cuando falla al guardar el producto', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);
      mockAxios.onPost('http://localhost:3000/api/productos').networkError();

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre del producto')).toBeInTheDocument();
      });

      await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'X');
      await userEvent.type(screen.getByPlaceholderText('Precio'), '5');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error al guardar producto.');
      });

      alertSpy.mockRestore();
    });

    it('muestra alerta cuando falla al eliminar el producto', async () => {
      const productos = [
        { id: 1, nombre: 'Producto 1', precio: 100, stock: 10, imagen: null }
      ];
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, productos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);
      mockAxios.onDelete('http://localhost:3000/api/productos/1').networkError();

      window.confirm = jest.fn(() => true);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByTitle('Eliminar')[0]);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error eliminando producto.');
      });

      alertSpy.mockRestore();
    });

    it('abre y cierra el detalle de una venta', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, [
        { id: 1, total: 250, fecha: '2026-06-07', cliente: 'Juan' }
      ]);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);
      mockAxios.onGet('http://localhost:3000/api/pedidos/1/detalle').reply(200, [
        { cantidad: 2, precio: 100, producto: 'Producto 1' }
      ]);

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      fireEvent.click(screen.getByText('Ventas'));

      await waitFor(() => {
        expect(screen.getByText('Juan')).toBeInTheDocument();
      });

      // Abrir detalle.
      fireEvent.click(container.querySelector('.venta-row'));
      await waitFor(() => {
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
      });

      // Volver a hacer clic cierra el detalle (toggle).
      fireEvent.click(container.querySelector('.venta-row'));
      await waitFor(() => {
        expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
      });
    });

    it('logout limpia el localStorage', async () => {
      delete window.location;
      window.location = { href: '', assign: jest.fn(), reload: jest.fn() };

      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Cerrar sesion')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cerrar sesion'));

      expect(localStorage.getItem('usuario')).toBeNull();
    });

    it('maneja selección vacía, preview, quitar imagen y guardar con imagen', async () => {
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);
      mockAxios.onPost('http://localhost:3000/api/productos').reply(200, { message: 'Producto creado' });

      global.URL.createObjectURL = jest.fn(() => 'blob:preview');

      const { container } = render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Seleccionar imagen')).toBeInTheDocument();
      });

      const fileInput = container.querySelector('input[type="file"]');

      // Rama "sin archivo".
      fireEvent.change(fileInput, { target: { files: [] } });

      // Rama "con archivo": genera preview.
      const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      });

      // Quitar la imagen del preview.
      fireEvent.click(container.querySelector('.preview-remove'));

      await waitFor(() => {
        expect(screen.getByText('Seleccionar imagen')).toBeInTheDocument();
      });

      // Volver a adjuntar y guardar con imagen (rama if (imagen)).
      fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
      await userEvent.type(screen.getByPlaceholderText('Nombre del producto'), 'Con imagen');
      await userEvent.type(screen.getByPlaceholderText('Precio'), '10');
      fireEvent.click(screen.getByText('Guardar Producto'));

      await waitFor(() => {
        expect(mockAxios.history.post.length).toBeGreaterThan(0);
      });
    });

    it('renderiza productos con imagen y descripción, y los edita', async () => {
      const productos = [
        { id: 1, nombre: 'P1', precio: 100, stock: 10, descripcion: 'Una desc', imagen: 'foto.jpg' }
      ];
      mockAxios.onGet('http://localhost:3000/api/productos').reply(200, productos);
      mockAxios.onGet('http://localhost:3000/api/pedidos/ventas').reply(200, []);
      mockAxios.onGet('http://localhost:3000/api/pedidos/estadisticas').reply(200, okStats);

      render(<Admin theme="light" toggleTheme={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('P1')).toBeInTheDocument();
      });

      // Producto con imagen y descripción.
      expect(screen.getByText('Una desc')).toBeInTheDocument();
      expect(screen.getByAltText('P1')).toBeInTheDocument();

      // Al editar un producto con imagen se muestra su preview.
      fireEvent.click(screen.getAllByTitle('Editar')[0]);

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
      });
    });
  });
});
