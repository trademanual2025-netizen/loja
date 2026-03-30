const keyId = process.env.B2_KEY_ID
const appKey = process.env.B2_APP_KEY
const bucketName = process.env.B2_BUCKET_NAME

interface B2Auth {
    apiUrl: string
    authToken: string
    downloadUrl: string
    allowed: { bucketId?: string }
}

interface B2UploadUrl {
    uploadUrl: string
    authToken: string
}

let cachedAuth: B2Auth | null = null
let authExpiry = 0

async function authorize(): Promise<B2Auth> {
    if (cachedAuth && Date.now() < authExpiry) return cachedAuth

    const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
        method: 'GET',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${keyId}:${appKey}`).toString('base64'),
        },
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`B2 authorize failed (${res.status}): ${err}`)
    }

    const data = await res.json()
    cachedAuth = {
        apiUrl: data.apiInfo?.storageApi?.apiUrl || data.apiUrl,
        authToken: data.authorizationToken,
        downloadUrl: data.apiInfo?.storageApi?.downloadUrl || data.downloadUrl,
        allowed: data.allowed || {},
    }
    authExpiry = Date.now() + 23 * 60 * 60 * 1000
    return cachedAuth!
}

async function getBucketId(auth: B2Auth): Promise<string> {
    if (auth.allowed.bucketId) return auth.allowed.bucketId

    const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_buckets`, {
        method: 'POST',
        headers: {
            Authorization: auth.authToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketName }),
    })

    if (!res.ok) throw new Error(`B2 list_buckets failed: ${res.status}`)
    const data = await res.json()
    const bucket = data.buckets?.find((b: { bucketName: string }) => b.bucketName === bucketName)
    if (!bucket) throw new Error(`Bucket "${bucketName}" not found`)
    return bucket.bucketId
}

async function getUploadUrl(auth: B2Auth, bucketId: string): Promise<B2UploadUrl> {
    const res = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: 'POST',
        headers: {
            Authorization: auth.authToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bucketId }),
    })

    if (!res.ok) throw new Error(`B2 get_upload_url failed: ${res.status}`)
    const data = await res.json()
    return { uploadUrl: data.uploadUrl, authToken: data.authorizationToken }
}

export async function uploadToB2(
    buffer: Buffer,
    filename: string,
    contentType: string
): Promise<string | null> {
    if (!keyId || !appKey || !bucketName) return null

    const auth = await authorize()
    const bucketId = await getBucketId(auth)
    const { uploadUrl, authToken } = await getUploadUrl(auth, bucketId)

    const key = `products/${Date.now()}-${filename}`
    const sha1 = await computeSha1(buffer)

    const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: authToken,
            'X-Bz-File-Name': encodeURIComponent(key),
            'Content-Type': contentType,
            'Content-Length': String(buffer.length),
            'X-Bz-Content-Sha1': sha1,
            'X-Bz-Info-b2-cache-control': 'public, max-age=31536000, immutable',
        },
        body: new Uint8Array(buffer),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`B2 upload failed (${res.status}): ${err}`)
    }

    const publicUrl = `${auth.downloadUrl}/file/${bucketName}/${key}`
    return publicUrl
}

async function computeSha1(buffer: Buffer): Promise<string> {
    const crypto = await import('crypto')
    return crypto.createHash('sha1').update(buffer).digest('hex')
}

export function isB2Configured(): boolean {
    return !!(keyId && appKey && bucketName)
}
