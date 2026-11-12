# Arquitetura Multi-Plataforma - SGEI Angola

## Visão Geral

Esta plataforma permite que clientes em Angola comprem produtos de **Shein**, **AliExpress** e **Vinted**, vendo todos os preços em **Kwanza (AOA)** e pagando em uma única transação consolidada.

---

## 🎯 Como Funciona (Jornada do Cliente)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Cliente cola URL de qualquer site suportado                 │
│     • Shein (USD)                                               │
│     • AliExpress (USD/CNY)                                      │
│     • Vinted (EUR)                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Sistema resolve URL e normaliza dados                       │
│     • Extrai ID do produto                                      │
│     • Busca preço, imagens, variantes                           │
│     • Detecta moeda original                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Conversão automática para AOA                               │
│     • USD → AOA (taxa: 1190)                                     │
│     • EUR → AOA (taxa: 1200 = 920 × 1.06)                        │
│     • CNY → AOA (taxa: 127 = 920 × 0.138)                       │
│     • + Taxas de serviço, logística, entrega                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Cliente vê preço final em Kz e faz checkout                 │
│     • Preço único em Kwanza                                     │
│     • Sem confusão com câmbio                                   │
│     • Paga via transferência, referência ou digital             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Equipe compra nos sites originais                           │
│     • Consolida múltiplos pedidos                               │
│     • Gerencia logística internacional                          │
│     • Entrega em Angola                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitetura Técnica

### Camadas

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js App Router)                               │
│  • UrlResolverForm.tsx - Cola URL, mostra preview            │
│  • ProductCard.tsx - Exibe badge de origem + preço em Kz     │
│  • ProductDetail.tsx - Detalhe com breakdown de taxas        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  API ROUTES (Next.js)                                        │
│  • /api/products/resolve-url - Roteia para provider correto  │
│  • /api/pricing/config - Retorna taxas de câmbio             │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  PROVIDERS (Adapter Pattern)                                 │
│  • unified-provider.ts - Router inteligente                  │
│  • shein-provider.ts (mock)                                  │
│  • aliexpress-provider.ts - Scraper/API                      │
│  • vinted-provider.ts - Scraper/API                          │
│  • admin-provider.ts - Catálogo próprio (DB)                 │
│  • mock-provider.ts - Demo products                          │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  CORE (Lógica de Negócio)                                    │
│  • currency.ts - Conversão multi-moeda                       │
│  • pricing.ts - Cálculo de preços (servidor)                 │
│  • pricing-client.ts - Cálculo de preços (cliente)           │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL + Drizzle ORM)                         │
│  • products (source: SHEIN|ALIEXPRESS|VINTED|ADMIN|MOCK)     │
│  • pricing_configs (taxas de câmbio)                         │
│  • orders, order_items, shipments                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 💱 Sistema Multi-Moeda

### Arquivo Chave: `src/lib/currency.ts`

```typescript
// Detecta moeda baseada na origem
export function detectCurrencyFromSource(source: string): SupportedCurrency {
  switch (source.toUpperCase()) {
    case "SHEIN": return "USD";
    case "ALIEXPRESS": return "USD"; // ou CNY se API chinesa
    case "VINTED": return "EUR";
    default: return "USD";
  }
}

// Converte para AOA cêntimos
export function convertToAoaCents(
  amount: number,
  fromCurrency: SupportedCurrency,
  rates: ExchangeRates
): number {
  let rate: number;
  switch (fromCurrency) {
    case "USD": rate = rates.USD_TO_AOA; break;
    case "EUR": rate = rates.EUR_TO_AOA; break;
    case "CNY": rate = rates.CNY_TO_AOA; break;
    case "AOA": rate = 1; break;
  }
  return Math.round(amount * rate * 100);
}
```

### Taxas de Câmbio

As taxas são configuráveis via admin e retornadas pelo endpoint `/api/pricing/config`:

```json
{
  "exchangeRateUsdToAoa": 920,
  "exchangeRateEurToAoa": 980,
  "exchangeRateCnyToAoa": 127,
  "serviceFeePct": 0.12,
  "logisticsBaseCents": 250000,
  ...
}
```

**Fórmula de cálculo:**
```
EUR_TO_AOA = USD_TO_AOA × 1.06  (EUR vale ~6% mais que USD)
CNY_TO_AOA = USD_TO_AOA × 0.138 (1 CNY ≈ 0.138 USD)
```

---

## 🔌 Providers (Adapter Pattern)

### Interface Comum

Todos os providers implementam `ProductProvider`:

```typescript
interface ProductProvider {
  id: ProductSource; // "SHEIN" | "ALIEXPRESS" | "VINTED" | "ADMIN" | "MOCK"
  
  resolveProductFromUrl(url: string): Promise<{
    status: "found" | "needs_confirmation" | "unsupported";
    externalId?: string;
    product?: NormalizedProduct | null;
  }>;
  
  getProductByExternalId(externalId: string): Promise<NormalizedProduct | null>;
  searchProducts(query: string, params?: any): Promise<NormalizedProduct[]>;
  // ...
}
```

### Unified Provider

O `unified-provider.ts` é o **router inteligente**:

```typescript
// Detecta provider pela URL
const provider = findProvider(url);
// 1. shein.com → mockProductProvider (ou shein-provider futuro)
// 2. aliexpress.com → aliexpressProvider
// 3. vinted.pt → vintedProvider

// Cache em memória
providerCache.set(`${providerId}:${externalId}`, product);
```

---

## 🛠️ Implementação Real (Produção)

### Opção 1: APIs Oficiais

| Plataforma | API | Status |
|------------|-----|--------|
| Shein | Parceiros oficiais | Requer aprovação |
| AliExpress | [AliExpress Open Platform](https://open.aliexpress.com/) | Requer cadastro |
| Vinted | Não possui API pública | ❌ |

### Opção 2: Scraping (Recomendado para MVP)

**Serviços de Proxy/Scraping:**

| Serviço | Preço | Vantagens |
|---------|-------|-----------|
| [ScrapingBee](https://www.scrapingbee.com/) | $49/mês | Render JS, proxies rotativos |
| [ZenRows](https://www.zenrows.com/) | $29/mês | Bom custo-benefício |
| [Bright Data](https://brightdata.com/) | $15/GB | Enterprise-grade |

**Exemplo ScrapingBee:**

```typescript
// src/lib/providers/aliexpress-provider.ts
async function fetchAliExpressProduct(productId: string) {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  const targetUrl = `https://www.aliexpress.com/item/${productId}.html`;
  
  const resp = await fetch(
    `https://app.scrapingbee.com/api/v1/` +
    `?api_key=${apiKey}` +
    `&url=${encodeURIComponent(targetUrl)}` +
    `&render_js=true` +
    `&premium_proxy=true`
  );
  
  const html = await resp.text();
  // Parse HTML → JSON-LD ou __NEXT_DATA__
  return parseAliExpressHtml(html);
}
```

### Opção 3: APIs de Terceiros (RapidAPI)

- [AliExpress Data Scraper](https://rapidapi.com/letscrape-6bRBa3QguO5/api/aliexpress-data-scraper)
- [Vinted Scraper](https://rapidapi.com/search?term=vinted) (pesquisar no RapidAPI)

---

## 📦 Produtos Demo Incluídos

O `mock-provider.ts` inclui produtos de exemplo de todas as origens:

| ID | Origem | Moeda | Preço Original | Preço em Kz (aprox) |
|----|--------|-------|----------------|---------------------|
| demo-1 a demo-12 | MOCK | USD | $7.50 - $42.50 | 6.900 - 39.100 Kz |
| aliexpress-1005... | AliExpress | USD | $28.90 - $156.00 | 26.600 - 143.500 Kz |
| vinted-987... | Vinted | EUR | €22 - €89 | 21.560 - 87.220 Kz |

---

## 🚀 Próximos Passos (Roadmap)

### Fase 1: MVP Funcional (✅ Concluído)
- [x] Arquitetura multi-provider
- [x] Conversão multi-moeda (USD/EUR/CNY → AOA)
- [x] UI com badges de origem
- [x] Produtos demo AliExpress e Vinted

### Fase 2: Integração Real (Próximo)
- [ ] Contratar ScrapingBee ou similar
- [ ] Implementar `fetchAliExpressProduct()` real
- [ ] Implementar `fetchVintedItem()` real
- [ ] Cache Redis para evitar re-scraping

### Fase 3: Otimizações
- [ ] Job diário para atualizar câmbio (API externa)
- [ ] Monitoramento de preços (alertas de variação)
- [ ] Consolidação de carrinho (múltiplas origens)

### Fase 4: Expansão
- [ ] Adicionar mais sites (Zara, ASOS, Amazon ES)
- [ ] App móvel (React Native)
- [ ] Integração WhatsApp Business API

---

## 📝 Notas Importantes

### Para o Cliente
- **Preço final em Kz**: Não precisa se preocupar com câmbio
- **Pagamento único**: Mesmo se comprar de 3 sites diferentes
- **Rastreio unificado**: Acompanha tudo em um lugar só

### Para a Equipe
- **Margem de segurança**: Sistema bloqueia se margem < 15%
- **Revisão manual**: Produtos novos vão para confirmação
- **Cache inteligente**: Evita re-processar mesma URL

### Para Desenvolvedores
- **Type-safe**: Tudo tipado com TypeScript
- **Sem dependências circulares**: Providers importam via `index.ts`
- **Testável**: Providers são isolados, fáceis de mockar

---

## 🔐 Segurança

- **API Keys**: Nunca exponha no frontend (use apenas em API Routes)
- **Rate Limiting**: Implementar no futuro para `/api/products/resolve-url`
- **Validação de URL**: Apenas domínios conhecidos são aceitos

---

## 📞 Suporte

Dúvidas técnicas? Consulte:
- `src/lib/currency.ts` - Lógica de conversão
- `src/lib/providers/unified-provider.ts` - Router de providers
- `src/components/home/UrlResolverForm.tsx` - UX de resolução de URLs
