import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "https://importeasy-angola.vercel.app";

const adminRoutes = [
  "/admin",
  "/admin/pedidos",
  "/admin/rastreio",
  "/admin/cambio",
  "/admin/pagamentos",
  "/admin/logistica",
  "/admin/produtos",
  "/admin/categorias",
  "/admin/clientes",
  "/admin/precos",
  "/admin/comunidade",
  "/admin/configuracoes",
  "/admin/logs",
];

/**
 * Regressão: o painel admin já devolveu "This page couldn't load / A server error
 * occurred" porque o layout passava componentes de ícone (funções) de um Server
 * Component para um Client Component — algo que o React não consegue serializar.
 */
test("admin panel carrega todas as secções sem erro de servidor", async ({ page }) => {
  test.setTimeout(420000);
  const failures: string[] = [];

  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });

  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  await page.fill('input[type="email"]', "admin@sgei.ao");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/admin", { timeout: 60000 });

  for (const href of adminRoutes) {
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Dashboard", { timeout: 25000 }).catch(() => {});

    const text = await page.locator("body").innerText();
    const broken =
      /couldn.t load|A server error occurred|Página não encontrada/i.test(text) ||
      !text.includes("Dashboard");

    expect(broken, `${href} falhou: ${text.slice(0, 200)}`).toBe(false);
  }

  expect([...new Set(failures)], failures.join("\n")).toEqual([]);
});
