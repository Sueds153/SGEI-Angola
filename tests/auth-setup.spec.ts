import { test, expect } from '@playwright/test';

const BASE_URL = 'https://importeasy-angola.vercel.app';

test('Setup - create admin auth storage state', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'admin@sgei.ao');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/**', { timeout: 15000 });
  
  await context.storageState({ path: 'tests/auth/admin-auth.json' });
  await context.close();
  
  console.log('Admin auth state saved');
});