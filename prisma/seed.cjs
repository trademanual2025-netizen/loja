const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const IMG_DIR = 'C:\\Users\\leona\\.gemini\\antigravity\\brain\\e88e1185-761b-4b15-a324-8d752c6d857a'

function imgToBase64(prefix) {
    const files = fs.readdirSync(IMG_DIR).filter(f => f.startsWith(prefix) && f.endsWith('.png'))
    if (files.length === 0) throw new Error(`Image not found: ${prefix}`)
    files.sort().reverse()
    const buffer = fs.readFileSync(path.join(IMG_DIR, files[0]))
    return `data:image/png;base64,${buffer.toString('base64')}`
}

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    console.log('Carregando imagens...')
    const imgs = {
        camisetaPreta: imgToBase64('camiseta_preta'),
        camisetaEstampada: imgToBase64('camiseta_estampada'),
        calcaJeans: imgToBase64('calca_jeans'),
        calcaCargo: imgToBase64('calca_cargo'),
        vestidoFloral: imgToBase64('vestido_floral'),
        vestidoMidi: imgToBase64('vestido_midi'),
        jaquetaBomber: imgToBase64('jaqueta_bomber'),
        casacoOversize: imgToBase64('casaco_oversize'),
        oculosRetro: imgToBase64('oculos_retro'),
        bolsaCrossbody: imgToBase64('bolsa_crossbody'),
    }
    console.log('Imagens OK!')

    console.log('Criando categorias...')
    const cats = {
        camisetas: await prisma.category.upsert({ where: { slug: 'camisetas' }, update: {}, create: { name: 'Camisetas', slug: 'camisetas' } }),
        calcas: await prisma.category.upsert({ where: { slug: 'calcas' }, update: {}, create: { name: 'Calças', slug: 'calcas' } }),
        vestidos: await prisma.category.upsert({ where: { slug: 'vestidos' }, update: {}, create: { name: 'Vestidos', slug: 'vestidos' } }),
        casacos: await prisma.category.upsert({ where: { slug: 'casacos-e-jaquetas' }, update: {}, create: { name: 'Casacos e Jaquetas', slug: 'casacos-e-jaquetas' } }),
        acessorios: await prisma.category.upsert({ where: { slug: 'acessorios' }, update: {}, create: { name: 'Acessórios', slug: 'acessorios' } }),
    }
    console.log('Categorias OK!')

    const produtos = [
        { name: 'Camiseta Básica Premium', slug: 'camiseta-basica-premium', description: 'Camiseta básica de algodão 100% com caimento perfeito. Disponível em P, M, G e GG. O essencial do seu guarda-roupa com conforto e durabilidade.', price: 59.90, comparePrice: 89.90, stock: 50, images: [imgs.camisetaPreta], categoryId: cats.camisetas.id },
        { name: 'Camiseta Urban Graphic', slug: 'camiseta-urban-graphic', description: 'Camiseta streetwear com estampa exclusiva Urban. Tecido premium, caimento oversized. Perfeita para o look do dia a dia com atitude.', price: 79.90, comparePrice: 119.90, stock: 35, images: [imgs.camisetaEstampada], categoryId: cats.camisetas.id },
        { name: 'Calça Jeans Slim Dark', slug: 'calca-jeans-slim-dark', description: 'Calça jeans slim fit em lavagem escura. Corte moderno e confortável com elastano para maior mobilidade.', price: 149.90, comparePrice: 199.90, stock: 30, images: [imgs.calcaJeans], categoryId: cats.calcas.id },
        { name: 'Calça Cargo Street', slug: 'calca-cargo-street', description: 'Calça cargo utilitária em verde musgo com múltiplos bolsos. O item mais versátil do streetwear moderno.', price: 199.90, comparePrice: 259.90, stock: 25, images: [imgs.calcaCargo], categoryId: cats.calcas.id },
        { name: 'Vestido Floral Verão', slug: 'vestido-floral-verao', description: 'Vestido midi floral em tecido leve e fluido, perfeito para dias quentes. Estampa exclusiva em tons pastéis.', price: 129.90, comparePrice: 169.90, stock: 20, images: [imgs.vestidoFloral], categoryId: cats.vestidos.id },
        { name: 'Vestido Midi Elegance', slug: 'vestido-midi-elegance', description: 'Vestido midi elegante em bordeaux com silhueta sofisticada. Ideal para ocasiões especiais, jantares e eventos.', price: 179.90, comparePrice: 239.90, stock: 15, images: [imgs.vestidoMidi], categoryId: cats.vestidos.id },
        { name: 'Jaqueta Bomber Classic', slug: 'jaqueta-bomber-classic', description: 'Jaqueta bomber preta clássica em nylon resistente com forro interno. O ícone do streetwear que nunca sai de moda.', price: 299.90, comparePrice: 399.90, stock: 18, images: [imgs.jaquetaBomber], categoryId: cats.casacos.id },
        { name: 'Casaco Oversize Bege', slug: 'casaco-oversize-bege', description: 'Casaco oversized em lã bege com corte estruturado. Peça-chave para o inverno com estilo minimalista.', price: 349.90, comparePrice: 449.90, stock: 12, images: [imgs.casacoOversize], categoryId: cats.casacos.id },
        { name: 'Óculos Retrô Vintage', slug: 'oculos-retro-vintage', description: 'Óculos de sol estilo retrô com armação redonda em dourado e lentes espelhadas. Proteção UV400.', price: 89.90, comparePrice: 129.90, stock: 40, images: [imgs.oculosRetro], categoryId: cats.acessorios.id },
        { name: 'Bolsa Mini Crossbody', slug: 'bolsa-mini-crossbody', description: 'Mini bolsa crossbody em couro legítimo caramelo. Alça ajustável, fecho magnético e dois compartimentos internos.', price: 119.90, comparePrice: 159.90, stock: 22, images: [imgs.bolsaCrossbody], categoryId: cats.acessorios.id },
    ]

    console.log('Criando produtos...')
    for (const p of produtos) {
        await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, active: true, bannerUrl: null } })
        console.log('  OK:', p.name)
    }

    console.log('Configurando settings...')
    const settings = [
        { key: 'store_name', value: 'Antigravity' },
        { key: 'store_footer_text', value: '© 2026 Antigravity. Todos os direitos reservados.' },
        { key: 'shipping_mode', value: 'fixed' },
        { key: 'shipping_fixed_value', value: '19.90' },
        { key: 'shipping_free_above', value: '299.00' },
    ]
    for (const s of settings) {
        await prisma.settings.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
    }

    console.log('\nSeed concluido! 10 produtos + 5 categorias criadas.')
    await prisma.$disconnect()
    await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
