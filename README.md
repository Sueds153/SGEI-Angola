# SGEI — Plataforma de intermediação SHEIN → Angola

Plataforma web completa (Next.js 16 + TypeScript + PostgreSQL + Drizzle ORM) para intermediação de compras de produtos SHEIN para clientes em Angola, com:

- Catálogo + pesquisa + categoria
- Resolução de link SHEIN (precisa confirmação para produtos externos)
- Motor de preços em Kz (câmbio, taxa de serviço, logística, entrega)
- Checkout em 3 passos (dados / morada / pagamento)
- Pedido com referência `SG-XXXXX`, snapshot de preço congelado
- Rastreio com timeline público
- Painel administrativo completo com dashboard, pedidos, clientes, pagamentos, logística, preços, categorias, logs
- Autenticação JWT segura (admin e cliente)
- Logs de auditoria de todas as ações administrativas
- Arquitetura de providers (pronta para SHEIN API oficial futura)
- Design system em estilo Apple/preto (mobile first, premium, tipografia grande, radius generoso)

## Stack

- Next.js 16 (App Router, RSC, Server Actions, Route Handlers)
- React 19 + TypeScript
- Tailwind CSS v4
- PostgreSQL + Drizzle ORM
- JOSE (JWT), bcryptjs, zod
- Lucide Icons

## Estrutura do projeto

```
src/
  app/                 # Rotas (públicas + admin + API)
    admin/             # Backoffice (layout com sidebar)
    api/               # API routes
  components/
    layout/            # Header, Footer
    ui/                # Design system (Button, Input, Card, Badge, Alert, ...)
    home/              # Secções da home
    product/           # ProductCard, ProductDetail
    checkout/          # CheckoutFlow
    order/             # TrackingTimeline, OrderLookupForm, OrderActions
    admin/             # Componentes do backoffice
    account/           # Formulários login/registo cliente
  db/
    schema.ts          # Schema Postgres (tabelas + enums + relações)
    index.ts           # Conexão pg
  lib/
    types.ts           # Tipos partilhados + constantes + helpers
    pricing.ts         # Motor de preços (server)
    pricing-client.ts  # Cálculo no cliente
    auth.ts            # Hash, sessão JWT, autorização admin
    orders.ts          # Criação e consulta de pedidos
    providers/         # ProductProvider + MockProvider + AdminProvider
    seed.ts            # Seed da BD (categorias, admin, clientes, pedidos demo)
    utils.ts           # Utilitários (slugify, extractProductId, etc.)
```

## Setup local

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Copiar `.env.example` para `.env` e configurar `DATABASE_URL` e `JWT_SECRET`.
3. Aplicar schema na BD:
   ```bash
   npx drizzle-kit push
   ```
4. Correr seed (admin + categorias + pedidos demo):
   ```bash
   npx tsx src/scripts/run-seed.ts
   ```
5. Arrancar em dev:
   ```bash
   npm run dev
   ```
6. Build de produção:
   ```bash
   npm run build
   npm start
   ```

## Credenciais demo

- **Admin:** `admin@sgei.ao` / `admin123`
- **Cliente:** `cliente@exemplo.ao` / `cliente123`

## Rotas principais

### Público
| Rota | Descrição |
|---|---|
| `/` | Home com hero, categorias, produtos em destaque |
| `/catalogo` | Catálogo completo |
| `/categoria/[slug]` | Categoria |
| `/pesquisa?q=` | Pesquisa |
| `/produto/[slug]` | Página de produto |
| `/checkout` | Checkout em 3 passos |
| `/pedido/[reference]` | Tracking público do pedido |
| `/pedidos` | Lookup por referência ou telefone |
| `/conta` | Login / registo de cliente |
| `/como-funciona` | Explicação em 4 passos |
| `/ajuda` | FAQ |

### Admin
| Rota | Descrição |
|---|---|
| `/admin/login` | Login |
| `/admin` | Dashboard (KPIs, pedidos recentes, logs) |
| `/admin/pedidos` | Lista com filtros |
| `/admin/pedidos/[id]` | Detalhe + alteração de estado/pagamento |
| `/admin/produtos` | Produtos do catálogo admin |
| `/admin/categorias` | Categorias |
| `/admin/clientes` | Lista de clientes |
| `/admin/pagamentos` | Pagamentos |
| `/admin/logistica` | Envios |
| `/admin/precos` | Câmbio, comissões, margens |
| `/admin/configuracoes` | Configurações gerais + integrações futuras |
| `/admin/logs` | Auditoria |

## Motor de preços

O preço final em Kz é calculado centralizadamente em `src/lib/pricing.ts` (server) e espelhado em `src/lib/pricing-client.ts` (cliente):

```
(produto_usd × câmbio × quantidade)
  + taxa_serviço (%, min)
  + logística (base + por peso)
  + entrega (base, ou por província)
= total (arredondado ao step configurável)
```

Todas as configurações são editáveis em `/admin/precos`. O preço é **snapshot** em cada `OrderItem` no momento da criação do pedido — pedidos antigos não mudam quando o admin ajusta câmbio/margens.

## Preparado para integrações futuras

A arquitetura já prevê, sem implementar endpoints falsos:

- `ProductProvider` em `src/lib/providers/` — hoje usa `AdminCatalogProvider` (catálogo da BD + mock). Basta adicionar `SheinProvider` depois de aprovação e trocar em `getActiveProvider()`.
- `SHEIN_API_ENABLED` e credenciais em `.env.example`.
- Interfaces abstratas para pagamentos, notificações (WhatsApp/email) e logística.
- `PaymentProvider`, `NotificationService` e `ShippingProvider` podem ser adicionados sem refactor.

## Notas importantes

- A V1 usa catálogo demo e produtos inseridos pelo admin. **Nenhum produto demo é apresentado como produto real da SHEIN** (todos tem badge "DEMO").
- Nunca redirecionamos o cliente para a SHEIN.
- Pagamentos são em Kz, apenas em Angola. Confirmação é manual no admin.
- O cliente não precisa de cartão internacional.
- Todo o acesso admin é protegido no servidor (JWT + `requireAdmin()`).
- Logs de auditoria registam todas as alterações de preço/estado/pagamento.
