async function test() {
  const imgUrl = 'https://images1.vinted.net/t/05_001cd_SVKa1VCX3hzGZEXFA6PJrZWk/f800/f2e2cabe.webp?s=835cc1cc3d6199e85993d61b7fa5f898498289e6';

  // 1. Sem referer
  const resNoRef = await fetch(imgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  console.log('Sem Referer: status =', resNoRef.status, resNoRef.headers.get('content-type'));

  // 2. Com referer do site https://importeasy-angola.vercel.app
  const resWithRef = await fetch(imgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://importeasy-angola.vercel.app/'
    }
  });
  console.log('Com Referer importeasy: status =', resWithRef.status, resWithRef.headers.get('content-type'));
}
test().catch(console.error);
