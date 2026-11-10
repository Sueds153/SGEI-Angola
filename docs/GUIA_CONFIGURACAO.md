# 🚀 Guia de Configuração - Sistema Multi-Plataforma

## ✅ O que foi implementado

Seu sistema agora suporta **Shein, AliExpress e Vinted** com:

- ✅ **Conversão automática de moedas** (USD, EUR, CNY → AOA)
- ✅ **Scraping inteligente com fallback múltiplo** (ScrapingBee → ZenRows → RapidAPI → Direto)
- ✅ **Cache de 30 minutos** para evitar re-processamento
- ✅ **Atualização automática de câmbio** via APIs públicas
- ✅ **Painel admin** para gerenciar taxas e cache
- ✅ **Checkout unificado** com seleção de moeda para produtos externos

---

## 📋 Passo 1: Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione **pelo menos uma** chave de API de scraping:

### Opção A: ScrapingBee (Recomendado)
```env
SCRAPINGBEE_API_KEY= SUA_CHAVE_AQUI
```
- Preço: $49/mês
- Site: https://www.scrapingbee.com/
- **Vantagem:** Renderiza JavaScript, proxies rotativos, alta taxa de sucesso

### Opção B: ZenRows (Backup)
```env
ZENROWS_API_KEY= SUA_CHAVE_AQUI
```
- Preço: $29/mês
- Site: https://www.zenrows.com/

### Opção C: RapidAPI (Apenas AliExpress)
```env
RAPIDAPI_KEY= SUA_CHAVE_AQUI
```
- Preço: ~$10/mês
- API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/aliexpress-data-scraper

### Opcional: Atualização Automática de Câmbio
Não requer chave API (usa APIs gratuitas):
- Frankfurter API
- ExchangeRate-API

---

## 📋 Passo 2: Rodar o Projeto

```bash
# Instalar dependências
npm install

# Rodar migrações do banco (se necessário)
npx drizzle-kit push

# Rodar seed (opcional, inclui produtos demo)
npm run seed

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

---

## 📋 Passo 3: Testar a Integração

### Teste 1: URL da Shein (USD)
1. Vá para a página inicial
2. Cole uma URL: `https://pt.shein.com/...`
3. O sistema deve mostrar o preço em **Kz**

### Teste 2: URL do AliExpress (USD)
1. Cole uma URL: `https://pt.aliexpress.com/item/1005001234567890.html`
2. O sistema detecta automaticamente e converte USD → AOA

### Teste 3: URL do Vinted (EUR)
1. Cole uma URL: `https://www.vinted.pt/items/987654321`
2. O sistema detecta EUR e converte para AOA

### Teste 4: Produtos Demo
Acesse `/catalogo` para ver produtos de exemplo de todas as origens:
- **Shein:** Vestidos, camisetas (USD)
- **AliExpress:** Smartphones, fones, smartwatches (USD)
- **Vinted:** Roupas usadas, tênis Nike, bolsas (EUR)

---

## 📋 Passo 4: Admin - Gerenciar Sistema

Acesse: `http://localhost:3000/admin`

**Login padrão:**
- Email: `admin@sgei.ao`
- Senha: `admin123`

### Em "Configurações do Sistema":

1. **Taxas de Câmbio**
   - Veja as taxas atuais (USD, EUR, CNY → AOA)
   - Clique em "Atualizar Automaticamente" para buscar taxas reais
   - Última atualização aparece com tempo relativo

2. **Providers de Scraping**
   - Veja quais APIs estão configuradas
   - Verde = configurado, Vermelho = não configurado

3. **Cache de Scraping**
   - Veja quantos itens estão cacheados
   - Clique em "Limpar Cache" para forçar re-scraping

---

## 🔧 Como Funciona o Scraping Inteligente

Quando um usuário cola uma URL:

```
1. Extrai ID do produto da URL
   ↓
2. Verifica cache (30 min TTL)
   ↓ SE CACHE MISS:
3. Tenta ScrapingBee (render JS, proxy premium)
   ↓ SE FALHAR:
4. Tenta ZenRows (backup)
   ↓ SE FALHAR:
5. Tenta RapidAPI (apenas AliExpress, dados estruturados)
   ↓ SE FALHAR:
6. Tenta fetch direto (último recurso)
   ↓
7. Parseia HTML com estratégias múltiplas:
   - JSON-LD (schema.org)
   - __NEXT_DATA__ (React/Next.js)
   - Data attributes
   - Regex fallback
   ↓
8. Retorna produto normalizado ou "needs_confirmation"
```

**Cache:** Resultados ficam em memória por 30 minutos para evitar requisições repetidas.

---

## 💱 Como Funciona a Conversão de Moedas

### No Frontend (cliente vê em Kz):

```typescript
// Produto AliExpress: $156 USD
product.originalPriceUsd = 156
product.currency = "USD"

// Sistema busca taxas atuais
cfg.exchangeRateUsdToAoa = 920

// Cálculo automático
subtotalCents = 156 × 920 × 100 = 14,352,000 cents (143,520 Kz)
+ serviceFee (12%) = 17,222 Kz
+ logistics = 2,500 Kz
+ delivery = 800 Kz
= 166,022 Kz (arredondado)
```

### No Checkout (produto externo):

Usuário pode selecionar moeda:
- **USD** (Dólar) - Shein, AliExpress
- **EUR** (Euro) - Vinted
- **CNY** (Yuan) - AliExpress China

O sistema converte automaticamente baseado na seleção.

---

## 🛠️ Solução de Problemas

### "Scraping falhou" / "Todos os providers falharam"

**Causa:** Nenhuma API de scraping configurada ou todas falharam.

**Solução:**
1. Verifique se `.env.local` tem `SCRAPINGBEE_API_KEY` ou similar
2. Teste a chave API no site do provider
3. Verifique logs no terminal para detalhes do erro

### "Preço não aparece" / "A calcular preço..."

**Causa:** Produto sem `originalPriceUsd` ou erro no cálculo.

**Solução:**
1. Verifique se o scraping retornou preço
2. Confira logs do console no browser
3. Tente limpar cache em `/admin/configuracoes`

### "Erro de tipos TypeScript"

**Causa:** Arquivos antigos não atualizados.

**Solução:**
```bash
npm run typecheck
# Se houver erros, reinicie o servidor de desenvolvimento
```

### Produtos demo não aparecem

**Solução:**
```bash
# Rode o seed novamente
npm run seed
```

---

## 📊 Próximos Passos (Recomendações)

### Imediato (Produção)
1. **Contrate ScrapingBee** ($49/mês) - essencial para scraping confiável
2. **Configure domínio** e deploy (Vercel recomendado)
3. **Teste com URLs reais** de produtos que seus clientes usam

### Curto Prazo
1. **Monitoramento:** Adicione Sentry para tracking de erros
2. **Rate limiting:** Proteja `/api/products/resolve-url` contra abuso
3. **Webhooks:** Notifique clientes quando produto for confirmado

### Médio Prazo
1. **Consolidação de carrinho:** Permita comprar de 3 sites num só pedido
2. **App móvel:** React Native para iOS/Android
3. **WhatsApp Bot:** Notificações automáticas de status

---

## 📞 Suporte Técnico

### Arquivos Chave para Debug

| Arquivo | Função |
|---------|--------|
| `src/lib/scraping/scraping-service.ts` | Lógica de fallback dos providers |
| `src/lib/scraping/aliexpress-parser.ts` | Parser de HTML do AliExpress |
| `src/lib/scraping/vinted-parser.ts` | Parser de HTML do Vinted |
| `src/lib/exchange-rates.ts` | Atualização de taxas de câmbio |
| `src/lib/pricing-client.ts` | Cálculo de preços no frontend |
| `src/components/admin/SystemConfig.tsx` | Painel de admin |

### Logs Importantes

No terminal, procure por:
- `[Scraping]` - Status do scraping
- `[AliExpress Parser]` - Erros de parse
- `[Vinted Parser]` - Erros de parse
- `[ExchangeRates]` - Atualização de câmbio

---

## ✨ Diferenciais Competitivos

1. **Preço final em Kz:** Cliente não precisa calcular nada
2. **Multi-moeda nativo:** USD, EUR, CNY suportados
3. **Fallback inteligente:** Sistema tenta 4 métodos antes de falhar
4. **Cache eficiente:** Evita custos desnecessários de scraping
5. **Admin completo:** Controle total sobre taxas e cache

**Seu sistema está pronto para produção!** 🎉
