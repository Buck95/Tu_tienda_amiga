const { test, expect, request } = require('@playwright/test');

/**
 * Flujos E2E reales de Tu Tienda Amiga (Playwright + Chromium).
 *
 * ⚙️ Credenciales de prueba — DEBEN existir en la base de datos del backend:
 *    - Cliente: registrado desde la tienda (POST /api/auth/register).
 *    - Admin:   registrado en /admin-login con la clave secreta 'admin123'.
 *    Ajusta estos valores a un usuario real de tu BD.
 *
 * 📝 Nota: esta SPA renderiza por estado (no usa React Router). Tras el login
 *    la URL sigue siendo "/", por lo que verificamos el CAMBIO DE VISTA al
 *    catálogo (aparición del catálogo / botón Salir), no un cambio de ruta.
 */

const API = 'http://localhost:3000';
const CLIENTE = { nombre: 'Cliente E2E', email: 'cliente.e2e@tienda.com', password: 'Cliente12345' };
const ADMIN = { nombre: 'Admin E2E', email: 'admin.e2e@tienda.com', password: 'Admin12345', secretKey: 'admin123' };

// 🌱 Antes de los flujos, registramos los usuarios vía API del backend.
//    Es idempotente: si ya existen (email duplicado → 400), se ignora.
//    REQUISITO: el backend (puerto 3000) y PostgreSQL deben estar corriendo.
test.beforeAll(async () => {
  const ctx = await request.newContext();
  await ctx.post(`${API}/api/auth/register`, {
    data: { nombre: CLIENTE.nombre, email: CLIENTE.email, contraseña: CLIENTE.password, rol: 'cliente' },
  }).catch(() => {});
  await ctx.post(`${API}/api/auth/register-admin`, {
    data: { nombre: ADMIN.nombre, email: ADMIN.email, contraseña: ADMIN.password, secretKey: ADMIN.secretKey },
  }).catch(() => {});
  await ctx.dispose();
});

test.describe('Tu Tienda Amiga — Flujos E2E', () => {

  // 1️⃣ FLUJO DE ACCESO
  test('Flujo de Acceso: login de cliente lleva al catálogo', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Correo electrónico').fill(CLIENTE.email);
    await page.getByPlaceholder('Contraseña').fill(CLIENTE.password);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // El catálogo es visible: aparece el botón "Salir" y el carrito flotante.
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
    await expect(page.locator('.cart-fab')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3001/');
  });

  // 2️⃣ FLUJO DE COMPRA
  test('Flujo de Compra: agregar al carrito y confirmar pedido', async ({ page }) => {
    // Login del cliente.
    await page.goto('/');
    await page.getByPlaceholder('Correo electrónico').fill(CLIENTE.email);
    await page.getByPlaceholder('Contraseña').fill(CLIENTE.password);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();

    // "Añadir al carrito" → botón "Agregar" del primer producto.
    await page.getByRole('button', { name: 'Agregar' }).first().click();

    // Abrir el carrito (botón flotante).
    await page.locator('.cart-fab').click();
    await expect(page.locator('.cart-drawer')).toHaveClass(/open/);

    // "Confirmar pedido" → botón "Finalizar Compra".
    await page.getByRole('button', { name: 'Finalizar Compra' }).click();

    // Confirmación de compra exitosa.
    await expect(page.getByText('Compra exitosa')).toBeVisible();
  });

  // 3️⃣ FLUJO DE ADMIN
  test('Flujo de Admin: login admin y dashboard con "Nuevo producto"', async ({ page }) => {
    await page.goto('/admin-login');

    await page.getByPlaceholder('Correo electrónico').fill(ADMIN.email);
    await page.getByPlaceholder('Contraseña').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Ingresar al Panel' }).click();

    // Dashboard del administrador.
    await expect(page.getByText('Panel de Administracion')).toBeVisible();
    // El formulario de alta muestra "Nuevo producto" (equivale al botón de alta).
    await expect(page.getByText('Nuevo producto')).toBeVisible();
  });

});
