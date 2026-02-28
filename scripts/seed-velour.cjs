const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Aplicando configurações de exemplo...')

    const settings = [
        { key: 'store_name', value: 'Velour' },
        { key: 'store_primary_color', value: '#1a1a1a' }, // Um preto elegante
        { key: 'seo_meta_title', value: 'Velour | Moda Elegante & Essencial' },
        { key: 'seo_meta_description', value: 'Descubra a coleção de moda essencial e elegante da Velour. Peças atemporais.' },
        { key: 'store_banner_title', value: 'Coleção Essenciais Primavera' },
        { key: 'store_banner_subtitle', value: 'Silhuetas atemporais e tecidos refinados para o seu dia a dia.' },
        { key: 'store_banner_url', value: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop' }
    ]

    for (const s of settings) {
        await prisma.settings.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value }
        })
    }

    console.log('✅ Configurações de exemplo aplicadas com sucesso!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
