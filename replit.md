# Loja - E-commerce Next.js

## Visão Geral
Loja online construída com Next.js 16, Prisma 7, PostgreSQL (Neon) e TailwindCSS 4.

## Estrutura
- `app/` - Páginas e rotas da aplicação (Next.js App Router)
  - `app/api/` - Rotas de API (auth, admin, checkout, webhooks)
  - `app/admin/` - Painel administrativo
  - `app/auth/` - Login/cadastro de usuários
  - `app/carrinho/` - Carrinho de compras
  - `app/checkout/` - Finalização de compra
  - `app/embed/` - Widget para embed em outros sites
  - `app/minha-conta/` - Área do usuário
  - `app/pedido/[id]/` - Detalhes do pedido
  - `app/produto/[slug]/` - Página de produto
- `lib/` - Módulos utilitários (prisma, auth, settings, webhook)
- `prisma/` - Schema do banco de dados

## Banco de Dados
- PostgreSQL hospedado no Neon (externo ao Replit)
- Conexão via secret `NEON_DATABASE_URL`
- O `channel_binding=require` é removido automaticamente no código (incompatível com a lib `pg` do Node.js)
- Prisma 7 com adapter `@prisma/adapter-pg`

## Dependências Principais
- Next.js 16, React 19, TailwindCSS 4
- Prisma 7 com adapter PostgreSQL
- bcryptjs (hash de senhas), jsonwebtoken (JWT)
- Stripe e MercadoPago (pagamentos)
- sonner (notificações), zustand (estado), lucide-react (ícones)

## Variáveis de Ambiente
- `NEON_DATABASE_URL` - URL do PostgreSQL Neon (secret)
- `JWT_SECRET` - Chave para tokens JWT de usuários (via .env)
- `ADMIN_JWT_SECRET` - Chave para tokens JWT de admin (via .env)

## Comandos
- `npm run dev` - Servidor de desenvolvimento na porta 5000
- `npm run build` - Build de produção
- `npx prisma generate` - Gerar client Prisma
- `npx prisma db push` - Sincronizar schema com banco
