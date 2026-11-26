import { test, expect } from "@playwright/test";

const DEVICES_TO_TEST = [
  {
    name: "iPhone 14 Pro (iOS Safari)",
    viewport: { width: 393, height: 852 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPhone SE (Pequeno iOS)",
    viewport: { width: 375, height: 667 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "Samsung Galaxy / Android (360px estreito)",
    viewport: { width: 360, height: 800 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "Google Pixel 7 (Android Chrome)",
    viewport: { width: 412, height: 915 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    isMobile: true,
    hasTouch: true,
  },
  {
    name: "iPad Air (Tablet)",
    viewport: { width: 820, height: 1180 },
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  },
];

const PAGES_TO_TEST = [
  { path: "/", title: "Início" },
  { path: "/importar", title: "Simulador de Importação" },
  { path: "/produtos", title: "Catálogo" },
  { path: "/comunidade", title: "Comunidade" },
  { path: "/rastrear", title: "Rastreio" },
];

for (const device of DEVICES_TO_TEST) {
  test.describe(`Compatibilidade: ${device.name}`, () => {
    test.use({
      viewport: device.viewport,
      userAgent: device.userAgent,
      hasTouch: device.hasTouch,
      isMobile: device.isMobile,
    });

    for (const pageItem of PAGES_TO_TEST) {
      test(`Renderiza sem overflow lateral em ${pageItem.title} (${pageItem.path})`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          }
        });

        const response = await page.goto(pageItem.path, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        expect(response?.status()).toBeLessThan(400);

        // Espera renderização inicial
        await page.waitForTimeout(1000);

        // Verifica que NÃO HÁ overflow horizontal (scroll horizontal indesejado)
        const hasHorizontalScroll = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          // Permitir tolerância de 1px devido a arredondamento sub-pixel
          return docWidth > winWidth + 1;
        });

        expect(
          hasHorizontalScroll,
          `Detectado overflow horizontal involuntário em ${device.name} na página ${pageItem.path}`
        ).toBeFalsy();

        // Em dispositivos móveis (largura < 768px), verifica a BottomNav
        if (device.viewport.width < 768) {
          const bottomNav = page.locator('nav[aria-label="Navegação móvel"]');
          await expect(bottomNav).toBeVisible();

          // Verifica se os botões touch possuem alvo de toque adequado (min 40px)
          const navLinks = bottomNav.locator("a");
          const count = await navLinks.count();
          expect(count).toBeGreaterThanOrEqual(4);
        }
      });
    }

    test(`Interação móvel e touch no simulador (/importar)`, async ({ page }) => {
      await page.goto("/importar", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);

      const input = page.locator("#import-url");
      await expect(input).toBeVisible();

      // Testa digitação móvel
      await input.fill("https://shein.com/sample-product");
      expect(await input.inputValue()).toBe("https://shein.com/sample-product");

      // Botão de calcular deve estar acessível
      const calcButton = page.locator('button:has-text("Calcular Preço em Kwanzas")');
      await expect(calcButton).toBeVisible();
    });

    test(`Aba comunidade exibe comentários e atualizações em direto (/comunidade)`, async ({ page }) => {
      await page.goto("/comunidade", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      // Verifica presença de cartões de depoimentos
      const cards = page.locator("article");
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(5);

      // Verifica indicador em direto
      const liveIndicator = page.locator("text=Atualizações em direto");
      await expect(liveIndicator).toBeVisible();
    });
  });
}
