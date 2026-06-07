// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuración de Playwright para los flujos E2E de Tu Tienda Amiga.
 *
 * Requisitos para que los tests pasen de verdad:
 *  1. Backend corriendo:   (en /Backend)  ->  node src/app.js   (puerto 3000)
 *  2. PostgreSQL activo con usuarios sembrados (cliente y admin).
 *  3. Frontend en el puerto 3001 (este config lo arranca solo si no está ya).
 */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Arranca el frontend automáticamente. Si ya tienes `npm start` corriendo
  // en el 3001, Playwright lo reutiliza en vez de levantar otro.
  webServer: {
    command: 'npm run start:e2e',
    url: 'http://localhost:3001',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
