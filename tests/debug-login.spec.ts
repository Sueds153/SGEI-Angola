import { test, expect } from '@playwright/test';

const BASE_URL = 'https://importeasy-angola.vercel.app';

test('Debug - check login cookie behavior', async ({ page }) => {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  
  // Check cookies before login
  const cookiesBefore = await page.context().cookies();
  console.log('Cookies before login:', cookiesBefore);
  
  await page.fill('input[type="email"]', 'admin@sgei.ao');
  await page.fill('input[type="password"]', 'admin123');
  
  // Listen for response
  const responsePromise = page.waitForResponse(r => r.url().includes('/api/auth/login'));
  await page.click('button[type="submit"]');
  const response = await responsePromise;
  
  console.log('Login response status:', response.status());
  console.log('Login response headers:', response.headers());
  
  // Check cookies after login
  await page.waitForTimeout(2000);
  const cookiesAfter = await page.context().cookies();
  console.log('Cookies after login:', cookiesAfter);
  
  // Try to navigate to configuracoes
  await page.goto(`${BASE_URL}/admin/configuracoes`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const finalCookies = await page.context().cookies();
  console.log('Cookies after navigation:', finalCookies);
  
  // Check page content
  const content = await page.content();
  console.log('Page title:', await page.title());
  console.log('Has login text:', content.includes('Entrar no backoffice'));
  console.log('Has config text:', content.includes('Configurações'));
});