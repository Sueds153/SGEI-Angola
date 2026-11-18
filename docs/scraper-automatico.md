# Scraper automático de produtos

O catálogo é alimentado por recolha automática de anúncios reais da Vinted,
AliExpress e SHEIN. Não é preciso correr nada manualmente.

## Agendamento

`vercel.json` define dois cron jobs diários (plano Hobby permite dois):

| Hora (UTC) | Hora em Angola | Rota |
| --- | --- | --- |
| 02:00 | 03:00 | `/api/cron/daily-scraper` |
| 14:00 | 15:00 | `/api/cron/daily-scraper-pm` |

A segunda passagem continua a partir do ponto onde a primeira parou.

## Como funciona

1. Cada invocação tem um orçamento de 32 segundos (a função serverless tem um
   limite de 60 segundos).
2. As tarefas (plataforma + termo de pesquisa) são percorridas em ciclo. O índice
   da próxima tarefa fica guardado em `scraper_runs.next_cursor`.
3. A página de resultados roda com o dia do mês (1 a 3), para que o catálogo
   cresça em vez de repetir os mesmos anúncios.
4. Cada lote é gravado com uma única leitura e uma única inserção, para não
   gastar o orçamento em dezenas de consultas.
5. Anúncios já existentes só são atualizados quando o preço muda.

## Fonte de dados

| Plataforma | Acesso | Moeda |
| --- | --- | --- |
| Vinted | leitor `r.jina.ai` sobre `vinted.pt` | EUR |
| AliExpress | leitor `r.jina.ai` sobre `pt.aliexpress.com` | USD |
| SHEIN | leitor `r.jina.ai` sobre `pt.shein.com` | EUR |

O domínio principal da SHEIN devolve um desafio anti-bot; o site português
responde. Se falhar, o scraper tenta o ScrapingBee (variável
`SCRAPINGBEE_API_KEY`, tem custo por pedido).

As imagens ficam guardadas como URL remoto: o sistema de ficheiros das funções
serverless é efémero e as imagens descarregadas desapareceriam no deploy
seguinte.

## Operação

- Estado e histórico: `GET /api/admin/scraper/status` (sessão de administrador).
- Execução manual: `POST /api/admin/scraper/run` (sessão de administrador).
- Execução por cron: `GET /api/cron/daily-scraper` com o cabeçalho
  `Authorization: Bearer $CRON_SECRET`.
- Histórico em base de dados: tabela `scraper_runs` (tarefas, criados,
  atualizados, erros, duração, cursor).

## Variáveis de ambiente (produção)

| Nome | Uso |
| --- | --- |
| `DATABASE_URL` | base de dados Neon |
| `CRON_SECRET` | autenticação das rotas de cron (a Vercel envia-a sozinha) |
| `SCRAPINGBEE_API_KEY` | alternativa paga para a SHEIN |

## Filtros de qualidade

- Vinted: apenas iPhone, com preço mínimo de 60 EUR, excluindo capas, cabos,
  películas, telemóveis bloqueados, avariados ou para peças.
- AliExpress: ignora preços de "novo comprador" (promoções não replicáveis).
- SHEIN: apenas vestuário feminino, conforme os termos de pesquisa definidos.
