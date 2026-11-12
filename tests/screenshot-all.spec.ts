import { test, expect } from '@playwright/test';

const BASE_URL = 'https://importeasy-angola.vercel.app';

test('Homepage screenshot', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
});

test('Produtos screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/produtos.png', fullPage: true });
});

test('Comunidade screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/comunidade`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/comunidade.png', fullPage: true });
});

test('Importar screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/importar`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/importar.png', fullPage: true });
});

test('Rastrear screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/rastrear`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/rastrear.png', fullPage: true });
});

test('Admin Configuracoes screenshot', async ({ page }) => {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@sgei.ao');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**', { timeout: 15000 });
  await page.goto(`${BASE_URL}/admin/configuracoes`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/admin-config.png', fullPage: true });
});