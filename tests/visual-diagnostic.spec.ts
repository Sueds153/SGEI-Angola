import { test, expect } from '@playwright/test';

const BASE_URL = 'https://importeasy-angola.vercel.app';

test('Visual diagnostic - all pages', async ({ page }) => {
  const pages = ['/', '/produtos', '/comunidade', '/importar', '/rastrear'];
  
  for (const path of pages) {
    console.log(`\n=== ${path} ===`);
    const errors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', err => errors.push('PAGE:' + err.message));
    page.on('requestfailed', req => failedRequests.push(req.url() + ' ' + req.failure()?.errorText));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE:' + msg.text()); });

    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('goto error', e.message));
    await page.waitForTimeout(2000);

    const metrics = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const imgs = Array.from(document.querySelectorAll('img'));
      const brokenImgs = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
      const allEls = Array.from(document.querySelectorAll('*'));
      const zeroHeight = allEls.filter(el => {
        const r = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return r.height === 0 && r.width > 0 && style.display !== 'none' && style.visibility !== 'hidden' && !['SCRIPT','STYLE','LINK','META','BR','HR'].includes(el.tagName);
      }).length;
      return {
        scrollWidth: body.scrollWidth,
        scrollHeight: body.scrollHeight,
        clientWidth: html.clientWidth,
        overflow: body.scrollWidth > html.clientWidth + 1,
        imgCount: imgs.length,
        brokenImgs: brokenImgs.slice(0, 10),
        zeroHeightEls: zeroHeight,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.slice(0, 80),
        bodyTextLen: body.innerText.length,
      };
    });
    console.log(JSON.stringify(metrics, null, 2));
    console.log('ERRORS:', errors.slice(0, 10));
    console.log('FAILED:', failedRequests.slice(0, 10));
    
    page.removeAllListeners();
  }
});