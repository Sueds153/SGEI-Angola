const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

async function testUrl(targetUrl) {
  console.log('\n--- TESTING URL:', targetUrl);
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENTS[2],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: 'follow',
    });
    console.log('Status:', res.status, 'Final URL:', res.url);
    const html = await res.text();
    console.log('HTML Length:', html.length);

    const images = [];
    // 1. JSON-LD
    const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item["@type"] === "Product" || item["@type"] === "IndividualProduct") {
            if (item.image) {
              const imgArray = Array.isArray(item.image) ? item.image : [item.image];
              imgArray.forEach((im) => {
                const src = typeof im === "string" ? im : im.url || im.contentUrl;
                if (src && !images.includes(src)) images.push(src);
              });
            }
          }
        }
      } catch (e) {}
    }

    // 2. OpenGraph
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogImage && ogImage[1]) {
      images.unshift(ogImage[1]);
    }

    const twitterImage = html.match(/<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["']/i);
    if (twitterImage && twitterImage[1]) {
      images.push(twitterImage[1]);
    }

    console.log('Images extracted count:', images.length);
    console.log('Images:', images.slice(0, 3));
  } catch(e) {
    console.error('Fetch error:', e.message);
  }
}

async function main() {
  await testUrl('https://www.vinted.pt/items/10867322690-zara-fringes-bag');
  await testUrl('https://pt.aliexpress.com');
}
main();
