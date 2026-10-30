# Juro, é Real: planejamento da v1

## 1. Objetivo
Um site de simuladores financeiros pra leigos, que complementa os vídeos do @juroereal. Projeto de portfólio público.

## 2. Escopo da v1

**Entra:**
- Página inicial com a lista de simuladores
- Simulador "Parcelado ou à vista?" com veredito em reais
- Preview do link (Open Graph)
- Sincronização da Selic e do IPCA com o Banco Central
- CI e deploy

**Não entra:**
- Login ou cadastro
- Simulador de horas de trabalho e "antes e agora" (ficam pra v2)
- Pixel da Meta, painel admin, dark/light toggle

## 3. Stack

| O que | Tecnologia | Por quê |

Linguagem: TypeScript em tudo; Tipos compartilhados entre front, back e core
Monorepo: npm workspaces; Nativo do npm, sem ferramenta extra
Cálculos: `packages/core` + Vitest; Funções puras, testáveis e usadas pelo front
Front: Next.js (App Router) + Tailwind; Preview de links, SEO e cache no servidor
Back: NestJS; sincronização agendada e API
Banco: PostgreSQL + Prisma; Guardar os indicadores e não depender do BCB a cada acesso
Testes da API: Jest + Supertest; Padrão do Nest (não brigue com o framework)
Qualidade: ESLint + Prettier; Padrão único nos três pacotes
Local: Docker Compose (só o Postgres); Qualquer pessoa clona e roda
CI: GitHub Actions; Lint, typecheck, testes e build em todo push
Deploy: Vercel (web), Render (api) + UptimeRobot, Neon (Postgres); Free tier
Analytics: Umami Cloud; Sem cookies, registra eventos

**Bibliotecas da API:** `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/schedule`, `@nestjs/swagger`, `@nestjs/throttler`, `helmet`, `prisma`/`@prisma/client`.

**Bibliotecas do front:** `html-to-image`.

**Qualquer biblioteca fora dessas listas precisa de um motivo escrito no PR.**

## 4. Estrutura de pastas
```
juroereal/
├─ apps/
│  ├─ api/              NestJS
│  │  ├─ prisma/        schema.prisma, migrations, seed
│  │  └─ src/
│  │     ├─ indicadores/   module, controller, service, sincronizacao.service, dto
│  │     ├─ prisma/        PrismaService
│  │     ├─ saude/         /health
│  │     └─ main.ts · app.module.ts
│  └─ web/              Next.js
│     └─ src/
│        ├─ app/           page.tsx (home), parcelado/page.tsx, layout, sitemap, robots
│        ├─ components/
│        └─ lib/           cliente da API, moeda, analytics, compartilhar
├─ packages/
│  └─ core/             src/parcelado.ts, src/financeiro.ts + testes
├─ docs/PLANEJAMENTO.md
├─ .github/workflows/   ci.yml, sincronizar.yml
├─ docker-compose.yml
├─ package.json         workspaces + scripts
├─ tsconfig.base.json · .eslintrc · .prettierrc · .nvmrc · .gitignore
└─ README.md · LICENSE
```

## 5. Fluxo dos dados
```
Banco Central (SGS 432 e 433)
      │  cron diário + POST /admin/sincronizar
      ▼
API NestJS ──► PostgreSQL
      │  GET /indicadores/selic/atual
      ▼
Next.js (busca no servidor, revalidate 1h)
      ▼
Navegador: formulário → packages/core calcula → resultado + card
```
O front nunca chama o Banco Central diretamente.

## 6. Banco de dados
```prisma
model Indicador {
  id          Int      @id @default(autoincrement())
  codigoSerie Int      // 432 = Selic meta, 433 = IPCA
  data        DateTime
  valor       Decimal
  criadoEm    DateTime @default(now())
  @@unique([codigoSerie, data])
}

model Sincronizacao {
  id           Int      @id @default(autoincrement())
  codigoSerie  Int
  executadaEm  DateTime @default(now())
  sucesso      Boolean
  mensagemErro String?
}
```

## 7. Endpoints da API

| Método | Rota | O que faz |

GET: `/indicadores/selic/atual`; `{ valorAnual, dataReferencia, atualizadoEm }`
GET: `/indicadores/ipca?de=AAAA-MM&ate=AAAA-MM`; Lista mensal
POST: `/admin/sincronizar` - Exige o header `x-admin-token`; dispara a sincronização
GET: `/health`; Status da API e do banco
GET: `/docs`; Swagger

**Erro sem dado no banco:** `503` com mensagem clara, sem inventar valor.

## 8. Regras do cálculo (`packages/core`)

**Entradas:** preço à vista, número de parcelas (1 a 48), valor da parcela, se a 1ª parcela é paga no ato, onde o dinheiro fica (100% do CDI ou poupança) e a Selic anual.

**Juro implícito mensal (i), achado por bisseção:**
- 1ª parcela em 30 dias: `vista = parcela × (1 − (1+i)^−n) / i`
- 1ª parcela no ato: `vista = parcela × (1+i) × (1 − (1+i)^−n) / i`

**Rendimento líquido mensal (r):**
- 100% do CDI: Selic convertida pra mensal, menos o IR pelo prazo da compra (22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720, 15% acima disso).
- Poupança: 0,5% a.m. se a Selic estiver acima de 8,5%; senão, 70% da Selic convertida pra mensal. Não paga IR.

**Veredito:**
- Calcule o valor presente das parcelas descontado por `r` e compare com o preço à vista.
- A margem de empate é o maior valor entre R$ 5 e 0,5% do preço à vista.
- O resultado é "à vista", "parcelar" ou "tanto faz", sempre com o valor em reais.

**Casos de teste obrigatórios:**

| Caso | Esperado |

R$ 2.160 à vista, 12x de R$ 200, 1ª parcela em 30 dias; i ≈ 1,66% a.m. (21,83% a.a.), paga R$ 240 a mais
Mesmo caso, 1ª parcela no ato; i ≈ 1,976% a.m.
R$ 1.200 à vista, 12x de R$ 100; sem juros
R$ 1.300 à vista, 12x de R$ 100; parcelado sai mais barato
1ª parcela no ato cobrindo o preço à vista; erro tratado
R$ 2.160, 12x de R$ 200, Selic 13,75%, 100% do CDI; veredito: à vista
R$ 2.400, 12x de R$ 200 (sem desconto), Selic 13,75%; veredito: parcelar
Faixas de IR nos limites (6, 7, 12, 13, 24 e 25 meses); alíquota correta em cada uma
Entradas inválidas; erro tipado

## 9. Git Flow
- **Branches:** `main` sempre funcionando; uma branch por etapa (`feat/core-parcelado`).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- **Pull request:** abra um por etapa, mesmo trabalhando sozinho.
- **CI verde** é condição pro merge.
- **Segredos:** nunca entram no repositório; só o `.env.example`.

## 10. Etapas

| # | Etapa | Pronto quando |

| 0 | Este documento, README inicial, LICENSE no seu nome, `.gitignore`; Commit na `main`
| 1 | Esqueleto do monorepo, tsconfig base, ESLint, Prettier, scripts na raiz; `npm run lint` e `npm run typecheck` rodando
| 2 | `packages/core`: **testes primeiro, você escrevendo as funções** | Todos os casos da seção 8 passando
| 3 | API: Nest, Docker Compose, Prisma, schema e migration | `docker compose up` e migration aplicada
| 4 | API: sincronização com o BCB, cron, endpoint admin, testes | Dados reais da Selic e do IPCA no banco
| 5 | API: endpoints de leitura, validação de env, Swagger, helmet, CORS, throttler | `/docs` funcionando, testes e2e passando
| 6 | Web: Next, home, `/parcelado` usando o core, Selic buscada no servidor | Simulação funcionando com a API local
| 7 | Web: card, preview do link, parâmetros de URL, `?origem=`, Umami | Card gerado e preview aparecendo
| 8 | CI, README completo em inglês, deploy, UptimeRobot, sincronização agendada | Link no ar e na bio

## 11. Ideias pra depois (não mexer na v1)
- Simulador de horas de trabalho
- "Antes e agora" com o IPCA
- Pixel da Meta, quando houver anúncio

## 12. Riscos conhecidos

| Risco | Plano |

Card não funciona no navegador interno do Instagram; Mostrar a imagem na tela com "segure pra salvar"
Banco Central fora do ar; Banco local guarda o último valor, 2 tentativas na sincronização
Regra do IR mudar; Tabela num único arquivo de constantes

---

## Plano priorizado
1. **Agora (etapa 0):** criar `docs/PLANEJAMENTO.md` com o texto acima, um `README.md` com uma linha e a LICENSE MIT com o seu nome. Commit: `docs: planejamento da v1`.
2. **Hoje à noite ou amanhã:** conversa nova com o prompt "modo mentor" e etapa 1.
3. **Neste fim de semana:** etapa 2, o core. É a única parte que você escreve sem a IA te dar a resposta.
4. **Nos próximos três fins de semana:** etapas 3 a 8, uma ou duas por vez.