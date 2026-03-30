import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import pg from 'pg'

const { Client } = pg

const keyId = process.env.B2_KEY_ID
const appKey = process.env.B2_APP_KEY
const bucketName = process.env.B2_BUCKET_NAME || 'giovana-dias-imagens'

if (!keyId || !appKey) {
    console.error('B2_KEY_ID and B2_APP_KEY required')
    process.exit(1)
}

const dbUrl = process.env.NEON_DATABASE_URL || (() => {
    try {
        const env = readFileSync('.env', 'utf8')
        const m = env.match(/DATABASE_URL="?([^"\n]+)/)
        return m?.[1] || process.env.DATABASE_URL
    } catch { return process.env.DATABASE_URL }
})()

if (!dbUrl) {
    console.error('DATABASE_URL required')
    process.exit(1)
}

let auth = null
let bucketId = null

async function b2Authorize() {
    const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
        method: 'GET',
        headers: { Authorization: 'Basic ' + Buffer.from(`${keyId}:${appKey}`).toString('base64') },
    })
    if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
    const data = await res.json()
    auth = {
        apiUrl: data.apiInfo?.storageApi?.apiUrl || data.apiUrl,
        authToken: data.authorizationToken,
        downloadUrl: data.apiInfo?.storageApi?.downloadUrl || data.downloadUrl,
        accountId: data.accountId,
    }
    return auth
}

async function getBucketId() {
    const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_buckets`, {
        method: 'POST',
        headers: { Authorization: auth.authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: auth.accountId }),
    })
    const data = await res.json()
    const bucket = data.buckets?.find(b => b.bucketName === bucketName)
    if (!bucket) throw new Error(`Bucket "${bucketName}" not found`)
    bucketId = bucket.bucketId
    return bucketId
}

async function uploadBuffer(buffer, fileName, contentType) {
    const upRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: 'POST',
        headers: { Authorization: auth.authToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketId }),
    })
    if (!upRes.ok) throw new Error(`get_upload_url failed: ${upRes.status}`)
    const upData = await upRes.json()

    const sha1 = createHash('sha1').update(buffer).digest('hex')

    const res = await fetch(upData.uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: upData.authorizationToken,
            'X-Bz-File-Name': encodeURIComponent(fileName),
            'Content-Type': contentType,
            'Content-Length': String(buffer.length),
            'X-Bz-Content-Sha1': sha1,
            'X-Bz-Info-b2-cache-control': encodeURIComponent('public, max-age=31536000, immutable'),
        },
        body: buffer,
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Upload failed (${res.status}): ${err}`)
    }

    await res.json()
    return `${auth.downloadUrl}/file/${bucketName}/${fileName}`
}

function base64ToBuffer(dataUrl) {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) return null
    return { buffer: Buffer.from(match[2], 'base64'), contentType: match[1] }
}

function extFromType(contentType) {
    const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
    return map[contentType] || 'jpg'
}

async function main() {
    console.log('Connecting to database...')
    const db = new Client({ connectionString: dbUrl })
    await db.connect()

    console.log('Authenticating with B2...')
    await b2Authorize()
    await getBucketId()
    console.log('Bucket ID:', bucketId)

    let totalUploaded = 0
    let totalErrors = 0

    // ── 1. Product images ──
    const { rows: products } = await db.query(
        `SELECT id, slug, images FROM "Product" WHERE active = true`
    )
    console.log(`\n=== PRODUCTS: ${products.length} active ===`)

    for (const product of products) {
        const images = product.images || []
        const newImages = []
        let changed = false

        for (let i = 0; i < images.length; i++) {
            const img = images[i]

            if (!img.startsWith('data:')) {
                newImages.push(img)
                continue
            }

            const parsed = base64ToBuffer(img)
            if (!parsed) {
                console.warn(`  [${product.slug}] img ${i}: invalid base64, keeping`)
                newImages.push(img)
                continue
            }

            try {
                const ext = extFromType(parsed.contentType)
                const fileName = `products/${product.slug}-${i}.${ext}`
                const url = await uploadBuffer(parsed.buffer, fileName, parsed.contentType)

                const check = await fetch(url, { method: 'HEAD' })
                if (!check.ok) throw new Error(`URL check failed: ${check.status}`)

                newImages.push(url)
                changed = true
                totalUploaded++
                console.log(`  [${product.slug}] img ${i} -> ${url}`)
            } catch (err) {
                console.error(`  [${product.slug}] img ${i} FAILED: ${err.message}`)
                newImages.push(img)
                totalErrors++
            }
        }

        if (changed) {
            await db.query(
                `UPDATE "Product" SET images = $1, "updatedAt" = NOW() WHERE id = $2`,
                [newImages, product.id]
            )
        }
    }

    // ── 2. ProductVariant images ──
    const { rows: variants } = await db.query(
        `SELECT v.id, v.image, p.slug FROM "ProductVariant" v JOIN "Product" p ON v."productId" = p.id WHERE v.image IS NOT NULL AND v.image LIKE 'data:%'`
    )
    console.log(`\n=== VARIANTS: ${variants.length} with base64 ===`)

    for (const v of variants) {
        const parsed = base64ToBuffer(v.image)
        if (!parsed) continue

        try {
            const ext = extFromType(parsed.contentType)
            const fileName = `variants/${v.slug}-${v.id}.${ext}`
            const url = await uploadBuffer(parsed.buffer, fileName, parsed.contentType)

            const check = await fetch(url, { method: 'HEAD' })
            if (!check.ok) throw new Error(`URL check failed: ${check.status}`)

            await db.query(`UPDATE "ProductVariant" SET image = $1 WHERE id = $2`, [url, v.id])
            totalUploaded++
            console.log(`  [variant ${v.id}] -> ${url}`)
        } catch (err) {
            console.error(`  [variant ${v.id}] FAILED: ${err.message}`)
            totalErrors++
        }
    }

    // ── 3. Settings images ──
    const { rows: settings } = await db.query(
        `SELECT key, value FROM "Settings" WHERE value LIKE 'data:%'`
    )
    console.log(`\n=== SETTINGS: ${settings.length} with base64 ===`)

    for (const s of settings) {
        const parsed = base64ToBuffer(s.value)
        if (!parsed) continue

        try {
            const ext = extFromType(parsed.contentType)
            const fileName = `settings/${s.key}.${ext}`
            const url = await uploadBuffer(parsed.buffer, fileName, parsed.contentType)

            const check = await fetch(url, { method: 'HEAD' })
            if (!check.ok) throw new Error(`URL check failed: ${check.status}`)

            await db.query(`UPDATE "Settings" SET value = $1 WHERE key = $2`, [url, s.key])
            totalUploaded++
            console.log(`  [${s.key}] -> ${url}`)
        } catch (err) {
            console.error(`  [${s.key}] FAILED: ${err.message}`)
            totalErrors++
        }
    }

    await db.end()
    console.log(`\n=== MIGRATION COMPLETE ===`)
    console.log(`Uploaded: ${totalUploaded}`)
    console.log(`Errors: ${totalErrors}`)
}

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
