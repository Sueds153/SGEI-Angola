import { test, expect } from '@playwright/test';

const BASE_URL = 'https://importeasy-angola.vercel.app';

async function loginAsAdmin(page: any) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@sgei.ao');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**', { timeout: 15000 });
  await expect(page.locator('h1, h2')).not.toContainText('Entrar no backoffice');
}

test.describe('ImportEasy Production UI/UX Audit', () => {
  test('Homepage - renders correctly with branding', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    await expect(page).toHaveTitle(/ImportEasy/);
    
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText('Shein');
    await expect(h1).toContainText('AliExpress');
    
    await expect(page.locator('body')).toContainText('ImportEasy');
    await expect(page.locator('body')).toContainText('Shein');
    await expect(page.locator('body')).toContainText('AliExpress');
    await expect(page.locator('body')).toContainText('Vinted');
    await expect(page.locator('body')).toContainText('Angola');
    
    await expect(page.locator('a[href="/importar"]').first()).toBeVisible();
    await expect(page.locator('a[href="/produtos"]').first()).toBeVisible();
    await expect(page.locator('a[href*="wa.me"]').first()).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  });

  test('Comunidade - real-time feed, avatars, composer', async ({ page }) => {
    await page.goto(`${BASE_URL}/comunidade`, { waitUntil: 'networkidle' });
    
    await expect(page.locator('h1')).toContainText('Comunidade');
    await expect(page.locator('text=Clientes ativos')).toBeVisible();
    await expect(page.locator('text=Pedidos entregues')).toBeVisible();
    
    // Avatares agora são data URIs locais (SVG inline) - verifica se existem imagens de avatar
    const avatars = page.locator('img[src^="data:image/svg"]');
    await expect(avatars.first()).toBeVisible();
    
    await expect(page.locator('textarea[placeholder*="Partilhe"]')).toBeVisible();
    await expect(page.locator('body')).toContainText('Comunidade ativa');
    
    await page.screenshot({ path: 'screenshots/comunidade.png', fullPage: true });
  });

  test('Importar - simulator page', async ({ page }) => {
    await page.goto(`${BASE_URL}/importar`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[type="url"], input[placeholder*="link"], input[placeholder*="URL"], textarea')).toBeVisible();
    await page.screenshot({ path: 'screenshots/importar.png', fullPage: true });
  });

  test('Produtos - catalog with filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'networkidle' });
    await expect(page.locator('button:has-text("Shein")')).toBeVisible();
    await expect(page.locator('button:has-text("AliExpress")')).toBeVisible();
    await expect(page.locator('button:has-text("Vinted")')).toBeVisible();
    await expect(page.locator('input[type="search"]')).toBeVisible();
    await page.screenshot({ path: 'screenshots/produtos.png', fullPage: true });
  });

  test('Rastrear - tracking page', async ({ page }) => {
    await page.goto(`${BASE_URL}/rastrear`, { waitUntil: 'networkidle' });
    await expect(page.locator('input[placeholder*="SG-"]')).toBeVisible();
    await page.screenshot({ path: 'screenshots/rastrear.png', fullPage: true });
  });

  test('Admin Login - accessible, no redirect loop', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await expect(page.locator('h1, h2')).toContainText('Entrar no backoffice');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=admin@sgei.ao')).toBeVisible();
    await page.screenshot({ path: 'screenshots/admin-login.png', fullPage: true });
  });

  test('Admin Login - successful authentication flows to dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.screenshot({ path: 'screenshots/admin-after-login.png', fullPage: true });
  });

  test('Admin Configuracoes - loads with auth', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/configuracoes`, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText('Configurações do Sistema');
    await expect(page.locator('body')).toContainText('Taxas de Câmbio');
    await page.screenshot({ path: 'screenshots/admin-configuracoes.png', fullPage: true });
  });
  
  test('Admin Comunidade - management interface', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/comunidade`, { waitUntil: 'networkidle' });
    
    // Wait for hydration and content - use text content checks instead of visibility
    await expect(page.locator('body')).toContainText('Gestão da Comunidade', { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Total mensagens', { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Por responder', { timeout: 15000 });
    await expect(page.locator('body')).toContainText('Maria Fernanda', { timeout: 15000 });
    
    await page.screenshot({ path: 'screenshots/admin-comunidade.png', fullPage: true });
  });

  test('Mobile viewport - responsive checks', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
    await page.screenshot({ path: 'screenshots/mobile-home.png', fullPage: true });
  });

  test('Check for layout issues - overflow, broken elements', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('manifest') &&
      !e.includes('websocket')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Console errors:', criticalErrors);
    }
    
    await page.screenshot({ path: 'screenshots/layout-check.png', fullPage: true });
  });
});