import { test, expect } from "@playwright/test";
import {
  parseAliExpress,
  parseShein,
  parseSheinMarkdown,
  parseVinted,
} from "../src/lib/scraping/parsers";

/**
 * Testes dos parsers do scraper. Usam amostras de markdown/HTML reais dos
 * fornecedores, para impedir regressões que fariam o cron voltar a recolher zero
 * produtos.
 */

test.describe("parsers do scraper", () => {
  test("Vinted extrai título, preço e imagem", () => {
    const markdown = [
      "![Image 1: iPhone 13 128GB, Marca: Apple, Modelo: iPhone 13, Estado: Bom, 300.00 €, 310.00 €](https://images1.vinted.net/t/abc/310x430/x.webp?s=1)",
      "",
      '[](https://www.vinted.pt/items/10864641322-iphone-13 "iPhone 13 128GB")',
    ].join("\n");

    const listings = parseVinted(markdown);

    expect(listings).toHaveLength(1);
    expect(listings[0]).toMatchObject({
      title: "iPhone 13 128GB",
      price: 300,
      currency: "EUR",
      externalId: "10864641322",
    });
    expect(listings[0].image).toContain("images1.vinted.net");
  });

  test("Vinted ignora anúncios sem preço", () => {
    const markdown =
      "![Image 1: Capa iPhone, Marca: Apple](https://images1.vinted.net/t/abc/310x430/x.webp)\n\n[](https://www.vinted.pt/items/999)";
    expect(parseVinted(markdown)).toHaveLength(0);
  });

  test("AliExpress extrai anúncio a partir da galeria e do preço promocional", () => {
    const markdown = [
      "[![Image 6: Smartwatch AMOLED Men New 1400mAh Big Battery Smart Watch Men Outdoor GPS Flashlight](https://ae-pic-a1.aliexpress-media.com/kf/abc.jpg_480x480q75.jpg_.avif)](https://example.com)",
      "### Smartwatch AMOLED Men New 1400mAh Big Battery Smart Watch Men Outdoor GPS Flashlight World Time · Turkish",
      "4.9 $24.46$24.46 **$51.00** saved New shoppers - $51",
      "[Similar items](https://www.aliexpress.us/item/3256812288588680.html?algo_pvid=abc)",
    ].join("\n");

    const listings = parseAliExpress(markdown);

    expect(listings).toHaveLength(1);
    expect(listings[0]).toMatchObject({
      title:
        "Smartwatch AMOLED Men New 1400mAh Big Battery Smart Watch Men Outdoor GPS Flashlight",
      price: 24.46,
      currency: "USD",
      externalId: "3256812288588680",
    });
    expect(listings[0].image).toContain("480x480");
  });

  test("AliExpress ignora preços de novo comprador", () => {
    const markdown = [
      "![Image 1: Smartwatch Military GPS Offline Map Smart Watch Waterproof](https://ae-pic-a1.aliexpress-media.com/kf/def.jpg_480x480q75.jpg_.avif)",
      "### Smartwatch Military GPS Offline Map Smart Watch Waterproof",
      "4.9 $1.09$1.09 **$15.19** saved New shoppers - $15.19",
      "[Similar items](https://www.aliexpress.us/item/3256813224514540.html)",
    ].join("\n");

    expect(parseAliExpress(markdown)).toHaveLength(0);
  });

  test("SHEIN extrai produtos do markdown do site português", () => {
    const markdown = `![Image 30: Easowa Women's Elegant Autumn Maxi Dress, Burgundy Chiffon](https://img.ltwebstatic.com/v4/j/dps/PS1/abc_thumbnail_405x.avif) ![Image 31: icon](https://img.ltwebstatic.com/v4/p/pics1/icon.png) 8](https://pt.shein.com/Easowa-Women-s-Elegant-Autumn-Maxi-Dress-p-241116319.html)

#4 Bestseller | in Shirred Women Dresses 22.99€ 22.99€`;

    const listings = parseSheinMarkdown(markdown);

    expect(listings).toHaveLength(1);
    expect(listings[0]).toMatchObject({
      title: "Easowa Women's Elegant Autumn Maxi Dress, Burgundy Chiffon",
      price: 22.99,
      currency: "EUR",
      externalId: "241116319",
      url: "https://pt.shein.com/Easowa-Women-s-Elegant-Autumn-Maxi-Dress-p-241116319.html",
    });
  });

  test("SHEIN extrai produtos do JSON embutido", () => {
    const html = `
      {"goods_id":"12345678","goods_name":"Vestido midi plissado","salePrice":{"amount":"12.50"}}
      {"goods_id":"12345679","goods_name":"Conjunto blazer feminino","salePrice":{"amount":"29.90"}}
    `;

    const listings = parseShein(html);

    expect(listings).toHaveLength(2);
    expect(listings[0]).toMatchObject({ title: "Vestido midi plissado", price: 12.5 });
    expect(listings[1]).toMatchObject({
      title: "Conjunto blazer feminino",
      price: 29.9,
    });
  });
});
