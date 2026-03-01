# Loja - E-commerce Next.js

## Visão Geral
Loja online construída com Next.js 16, Prisma 7, PostgreSQL (Neon) e TailwindCSS 4.

## Estrutura
- `src/app/` - Páginas e rotas da aplicação (Next.js App Router)
  - `src/app/api/` - Rotas de API (auth, admin, checkout, webhooks)
  - `src/app/admin/` - Painel administrativo
  - `src/app/auth/` - Login/cadastro de usuários
  - `src/app/carrinho/` - Carrinho de compras
  - `src/app/checkout/` - Finalização de compra
  - `src/app/embed/` - Widget para embed em outros sites
  - `src/app/minha-conta/` - Área do usuário
  - `src/app/pedido/[id]/` - Detalhes do pedido
  - `src/app/produto/[slug]/` - Página de produto
- `src/lib/` - Módulos utilitários (prisma, auth, admin-auth, config, cart, i18n, inventory, shipping, webhooks)
- `src/components/` - Componentes React compartilhados
- `src/proxy.ts` - Proxy/middleware do Next.js 16 (protege rotas admin e checkout)
- `src/app/error.tsx` - Error boundary global
- `prisma/` - Schema do banco de dados
- `prisma.config.ts` - Configuração do Prisma (usa NEON_DATABASE_URL)

## Banco de Dados
- PostgreSQL hospedado no Neon (externo ao Replit)
- Conexão via env var `NEON_DATABASE_URL`
- O `channel_binding=require` é removido automaticamente no código (incompatível com a lib `pg` do Node.js)
- Prisma 7 com adapter `@prisma/adapter-pg`

## Segurança
- Senhas hasheadas com bcrypt (10 rounds) — login compatível com SHA-256 legado (migra automaticamente)
- JWT sem fallback hardcoded — falha se JWT_SECRET/ADMIN_JWT_SECRET não estiver configurado
- Proxy (middleware) protege rotas `/admin/*` e `/api/admin/*` (exceto setup/login)
- Verificação de assinatura HMAC no webhook do MercadoPago (se `mp_webhook_secret` configurado)
- Webhook do Stripe já verificava assinatura nativamente
- Verificação de conta ativa no login e no getAuthUser

## Dependências Principais
- Next.js 16, React 19, TailwindCSS 4
- Prisma 7 com adapter PostgreSQL
- bcryptjs (hash de senhas), jsonwebtoken (JWT)
- Stripe e MercadoPago (pagamentos)
- sonner (notificações), zustand (estado), lucide-react (ícones)

## Variáveis de Ambiente
- `NEON_DATABASE_URL` - URL do PostgreSQL Neon (env var compartilhada)
- `JWT_SECRET` - Chave para tokens JWT de usuários
- `ADMIN_JWT_SECRET` - Chave para tokens JWT de admin

## Comandos
- `npm run dev` - Servidor de desenvolvimento na porta 5000
- `npm run build` - Build de produção
- `npx prisma generate` - Gerar client Prisma
- `npx prisma db push` - Sincronizar schema com banco

## Performance
- Queries Prisma usam `select` em vez de `include` para buscar apenas campos necessários
- API `/api/products` retorna apenas 7 campos do produto (id, name, slug, price, comparePrice, images, stock)
- Cache HTTP nos endpoints de listagem (`s-maxage=30, stale-while-revalidate=60`)
- Settings do banco com cache per-key e TTL de 60s (`src/lib/config.ts`)
- `getAuthUser` cacheia status `active` do usuário por 60s (evita query ao banco a cada page load)
- Admin dashboard usa `prisma.order.aggregate()` para receita (em vez de buscar todos os pedidos pagos)
- Página de produto paraleliza queries (produto + settings + auth + cookies em Promise.all)
- Pool de conexões pg limitado a 5 conexões com idle timeout de 30s

## Notas Técnicas
- Next.js 16 usa `proxy.ts` em vez de `middleware.ts` (com `export default`)
- `allowedDevOrigins` vai na raiz do next.config (não em experimental)
- `devIndicators: false` desativa indicador de rota no dev mode
- Fonte Inter carregada via `next/font/google` (não via `<link>` manual no `<head>`)
- ThemeProvider customizado (sem next-themes) para evitar hydration mismatch
- PostgreSQL: `uselibpqcompat=true` + `sslmode=no-verify` para suprimir warning de SSL do pg v9
- `channel_binding=require` removido da URL de conexão (incompatível com lib pg)
- Estoque validado antes de decremento para evitar valores negativos
- Cálculo de frete nunca falha: se Correios indisponível, usa tabela de preços por região (PAC/SEDEX)
- Fallback em 3 camadas: Correios → cálculo por região → valores fixos padrão
- Timeout de 8s na API dos Correios para não travar checkout
- Helper `cepToState()` converte CEP em estado para fallback regional
