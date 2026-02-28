// Script: seed-images.cjs
// Injeta banners e imagens de galeria nos produtos diretamente no banco via Prisma
// Executar: node scripts/seed-images.cjs

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BRAIN = 'C:\\Users\\leona\\.gemini\\antigravity\\brain\\8f4e12de-b551-42d5-bacd-1c0bbc8e3f49'

const IMAGES = [
    {
        name: 'Bolsa Mini Crossbody',
        banner: path.join(BRAIN, 'bolsa_mini_crossbody_banner_1771893426583.png'),
    },
    {
        name: 'Óculos Retrô Vintage',
        banner: path.join(BRAIN, 'oculos_retro_vintage_banner_1771893442460.png'),
    },
    {
        name: 'Casaco Oversize Bege',
        banner: path.join(BRAIN, 'casaco_oversize_bege_banner_1771893458126.png'),
    },
    {
        name: 'Jaqueta Bomber Classic',
        banner: path.join(BRAIN, 'jaqueta_bomber_classic_banner_1771893472088.png'),
    },
    {
        name: 'Vestido Midi Elegance',
        banner: path.join(BRAIN, 'vestido_midi_elegance_banner_1771893502565.png'),
    },
    {
        name: 'Vestido Floral Verão',
        banner: path.join(BRAIN, 'vestido_floral_verao_banner_1771893516511.png'),
    },
]

function toDataUrl(filePath) {
    const buf = fs.readFileSync(filePath)
    return `data:image/png;base64,${buf.toString('base64')}`
}

async function main() {
    console.log('🚀 Iniciando injeção de imagens nos produtos...\n')

    for (const { name, banner } of IMAGES) {
        const product = await prisma.product.findFirst({ where: { name } })
        if (!product) {
            console.log(`❌ Produto não encontrado: "${name}"`)
            continue
        }

        if (!fs.existsSync(banner)) {
            console.log(`❌ Arquivo de banner não encontrado para: "${name}"`)
            continue
        }

        const dataUrl = toDataUrl(banner)
        // Usa o banner como galeria também (primeira imagem), mantendo as existentes
        const images = product.images.length > 0 ? product.images : [dataUrl]

        await prisma.product.update({
            where: { id: product.id },
            data: {
                bannerUrl: dataUrl,
                images,
            },
        })

        console.log(`✅ "${name}" — banner + galeria atualizados`)
    }

    console.log('\n🎉 Concluído!')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
