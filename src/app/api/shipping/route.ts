import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'
import { prisma } from '@/lib/prisma'

interface CartItemInput {
    id: string
    quantity: number
}

export async function POST(req: NextRequest) {
    let state = 'SP'
    let country: string | undefined
    let locale: string | undefined

    try {
        const body = await req.json()
        state = body.state || 'SP'
        country = body.country
        locale = body.locale
        const subtotal = parseFloat(body.subtotal || '0')
        const zipCode = body.zipCode
        const items = body.items

        let packageWeight: number | undefined
        let packageHeight: number | undefined
        let packageWidth: number | undefined
        let packageLength: number | undefined

        if (items && Array.isArray(items) && items.length > 0) {
            try {
                const productIds = items.map((i: CartItemInput) => i.id)
                const products = await prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, weight: true, height: true, width: true, length: true }
                })

                const productMap = new Map(products.map(p => [p.id, p]))

                let totalWeight = 0
                let maxHeight = 0
                let maxWidth = 0
                let totalLength = 0

                for (const item of items as CartItemInput[]) {
                    const product = productMap.get(item.id)
                    const qty = item.quantity || 1

                    if (product) {
                        totalWeight += (product.weight || 0) * qty
                        const h = product.height || 0
                        const w = product.width || 0
                        const l = product.length || 0

                        if (h > maxHeight) maxHeight = h
                        if (w > maxWidth) maxWidth = w
                        totalLength += l * qty
                    }
                }

                if (totalWeight > 0) packageWeight = totalWeight
                if (maxHeight > 0) packageHeight = maxHeight
                if (maxWidth > 0) packageWidth = maxWidth
                if (totalLength > 0) packageLength = Math.min(totalLength, 100)
            } catch (e) {
                console.warn('[Shipping] Erro ao buscar dimensões dos produtos:', e)
            }
        }

        const options = await calculateShipping(
            state,
            subtotal,
            zipCode,
            packageWeight,
            packageHeight,
            packageWidth,
            packageLength,
            country,
            locale,
        )
        return NextResponse.json({ options })
    } catch (e) {
        console.error('[Shipping Route] Erro:', e)
        try {
            const options = await calculateShipping(state, 0, undefined, undefined, undefined, undefined, undefined, country, locale)
            return NextResponse.json({ options })
        } catch {
            return NextResponse.json({
                options: [
                    { label: 'PAC (8 dias úteis)', value: 24.90, days: 8 },
                    { label: 'SEDEX (4 dias úteis)', value: 42.90, days: 4 },
                ]
            })
        }
    }
}
