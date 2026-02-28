/**
 * Script: upload-product-images.mjs
 * Faz upload dos banners gerados para os produtos via API local.
 * Executar com: node scripts/upload-product-images.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = 'http://localhost:3000'
const BRAIN_DIR = 'C:\\Users\\leona\\.gemini\\antigravity\\brain\\8f4e12de-b551-42d5-bacd-1c0bbc8e3f49'

// Mapeamento: nome do produto → arquivo de banner
const PRODUCT_IMAGES = [
    { name: 'Bolsa Mini Crossbody', banner: path.join(BRAIN_DIR, 'bolsa_mini_crossbody_banner_1771893426583.png') },
    { name: 'Óculos Retrô Vintage', banner: path.join(BRAIN_DIR, 'oculos_retro_vintage_banner_1771893442460.png') },
    { name: 'Casaco Oversize Bege', banner: path.join(BRAIN_DIR, 'casaco_oversize_bege_banner_1771893458126.png') },
    { name: 'Jaqueta Bomber Classic', banner: path.join(BRAIN_DIR, 'jaqueta_bomber_classic_banner_1771893472088.png') },
    { name: 'Vestido Midi Elegance', banner: path.join(BRAIN_DIR, 'vestido_midi_elegance_banner_1771893502565.png') },
    { name: 'Vestido Floral Verão', banner: path.join(BRAIN_DIR, 'vestido_floral_verao_banner_1771893516511.png') },
]

async function getAdminToken() {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'admin' }),
    })
    const data = await res.json()
    return data.token
}

async function getProducts(token) {
    const res = await fetch(`${BASE_URL}/api/admin/products?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return data.products || []
}

async function uploadFile(filePath, token) {
    const buf = fs.readFileSync(filePath)
    const base64 = buf.toString('base64')
    const ext = path.extname(filePath).slice(1)
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
    const dataUrl = `data:${mime};base64,${base64}`
    return dataUrl
}

async function updateProduct(productId, updates, token) {
    const res = await fetch(`${BASE_URL}/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    })
    return res.ok
}

async function main() {
    console.log('🚀 Iniciando upload de imagens...\n')

    let token
    try {
        token = await getAdminToken()
        console.log('✅ Autenticado no admin\n')
    } catch (e) {
        console.log('⚠️  Sem autenticação necessária, tentando sem token...\n')
    }

    const products = await getProducts(token)
    console.log(`📦 ${products.length} produtos encontrados\n`)

    for (const { name, banner } of PRODUCT_IMAGES) {
        const product = products.find(p => p.name === name)
        if (!product) {
            console.log(`❌ Produto não encontrado: ${name}`)
            continue
        }

        if (!fs.existsSync(banner)) {
            console.log(`❌ Arquivo não encontrado: ${banner}`)
            continue
        }

        console.log(`📤 Processando: ${name}`)
        const dataUrl = await uploadFile(banner, token)

        // Gallery: usa o mesmo banner como primeira imagem da galeria
        const existingImages = product.images || []
        const images = existingImages.length > 0 ? existingImages : [dataUrl]

        const ok = await updateProduct(product.id, {
            bannerUrl: dataUrl,
            images: images.length > 0 ? images : [dataUrl],
        }, token)

        if (ok) {
            console.log(`  ✅ Banner e galeria atualizados para: ${name}`)
        } else {
            console.log(`  ❌ Falha ao salvar: ${name}`)
        }
    }

    console.log('\n🎉 Upload concluído!')
}

main().catch(console.error)
