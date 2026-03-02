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
- ThemeProvider customizado (sem next-themes) para evitar hydration mismatch; suporta `storageKey` e `applyTo` (html ou wrapper) para independência loja vs admin
- Tema da loja salvo em localStorage key `theme` (aplica no `<html>`), tema do admin em `admin-theme` (aplica em wrapper div) — totalmente independentes
- PostgreSQL: `uselibpqcompat=true` + `sslmode=no-verify` para suprimir warning de SSL do pg v9
- `channel_binding=require` removido da URL de conexão (incompatível com lib pg)
- Estoque validado antes de decremento para evitar valores negativos
- Cálculo de frete nunca falha: se Correios indisponível, usa tabela de preços por região (PAC/SEDEX)
- Fallback em 3 camadas: Correios → cálculo por região → valores fixos padrão
- Timeout de 8s na API dos Correios para não travar checkout
- Helper `cepToState()` converte CEP em estado para fallback regional
- Cada produto pode ter peso/dimensões próprias (weight, height, width, length no model Product)
- Frete calcula peso/volume total do pacote somando itens do carrinho (peso soma, altura/largura máxima, comprimento soma)
- Se produto não tem dimensões, usa valores padrão das configurações da loja
- Mínimos dos Correios: 0.3kg, 2cm altura, 11cm largura, 16cm comprimento
- Carrinho do cliente sincronizado com servidor via `/api/user/sync-cart` (debounce 2s)
- Campo `cartData` (JSON) no model User armazena itens do carrinho do usuário logado
- Admin Leads exibe produtos do carrinho de cada lead com detalhes (nome, imagem, variante, quantidade, total)
- Campo `gatewayData` (JSON string) no model Order armazena dados do gateway de pagamento (PIX QR code, boleto URL, validade, status_detail)
- Componente `PaymentInfo` exibe dados de pagamento na página do pedido (QR Code Pix com cópia, link boleto, status cartão, countdown de expiração)
- Página minha-conta mostra indicadores de pagamento pendente (Pix/Boleto) com link para ver dados de pagamento
- Pedidos pendentes podem ser cancelados pelo usuário para alterar forma de pagamento: cancela o pedido, restaura itens no carrinho e redireciona ao checkout
- API `/api/orders/cancel` cancela pedido PENDING do próprio usuário e retorna itens para o carrinho
- Componente `ChangePaymentMethod` com confirmação em 2 passos (botão → card de confirmação → execução)
- Pedidos cancelados por troca de pagamento exibem badge "Alterou pagamento" (roxo) em vez de "Cancelado" na minha-conta
- Webhook MercadoPago trata: approved→PAID, rejected/cancelled→CANCELLED, refunded/charged_back→REFUNDED
- Webhook Stripe trata: payment_intent.succeeded→PAID, payment_intent.payment_failed→CANCELLED, charge.refunded→REFUNDED
- Ambos webhooks atualizam `gatewayData` com lastWebhookStatus, lastWebhookAt e statusDetail
- Webhook field mapping: admin pode escolher quais campos enviar e personalizar nomes dos campos para compatibilidade com ferramentas externas
- Mapeamento salvo em settings `webhook_lead_fields` e `webhook_buyer_fields` (JSON)
- Campos organizados por grupo: meta (envelope), data, address (buyer only)
- Definições de campos compartilhadas em `src/lib/webhook-fields.ts` (safe for client import)
- Componente `WebhooksTab` em `src/components/admin/WebhooksTab.tsx` com preview JSON em tempo real
