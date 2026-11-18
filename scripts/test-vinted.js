async function test() {
  const itemUrl = 'https://www.vinted.pt/items/10867322690-zara-fringes-bag';
  const itemRes = await fetch(itemUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-PT,pt;q=0.9'
    }
  });
  const html = await itemRes.text();
  const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    console.log('FULL JSON-LD:', jsonLdMatch[1]);
  }

  // Procurar "price", "buyer_protection", "protection" no HTML
  const matches = [...html.matchAll(/"price":\{[^}]+\}/g)].map(m => m[0]);
  console.log('Price objects:', matches.slice(0, 5));

  const totalItemPrice = [...html.matchAll(/"total_item_price":\{[^}]+\}/g)].map(m => m[0]);
  console.log('Total item price objects:', totalItemPrice.slice(0, 5));

  const serviceFee = [...html.matchAll(/"service_fee":\{[^}]+\}/g)].map(m => m[0]);
  console.log('Service fee objects:', serviceFee.slice(0, 5));
}
test().catch(console.error);
