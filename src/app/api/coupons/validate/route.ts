import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { code, items } = await req.json()

        if (!code) return NextResponse.json({ error: 'Código obrigatório.' }, { status: 400 })

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() },
        })

        if (!coupon || !coupon.active) {
            return NextResponse.json({ error: 'Cupom inválido ou inativo.' }, { status: 400 })
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return NextResponse.json({ error: 'Este cupom expirou.' }, { status: 400 })
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: 'Este cupom atingiu o limite de uso.' }, { status: 400 })
        }

        let eligibleItems = items || []
        let eligibleSubtotal = 0

        if (coupon.scope === 'products' && coupon.productIds) {
            const allowedIds = coupon.productIds.split(',').map((s: string) => s.trim())
            eligibleItems = eligibleItems.filter((i: any) => allowedIds.includes(i.id))
        } else if (coupon.scope === 'categories' && coupon.categoryIds) {
            const allowedCats = coupon.categoryIds.split(',').map((s: string) => s.trim())
            const products = await prisma.product.findMany({
                where: { categoryId: { in: allowedCats } },
                select: { id: true },
            })
            const productIdSet = new Set(products.map(p => p.id))
            eligibleItems = eligibleItems.filter((i: any) => productIdSet.has(i.id))
        }

        if (eligibleItems.length === 0) {
            return NextResponse.json({ error: 'Nenhum item do carrinho é elegível para este cupom.' }, { status: 400 })
        }

        eligibleSubtotal = eligibleItems.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0)

        let discountAmount = 0
        if (coupon.type === 'percentage') {
            discountAmount = Math.round(eligibleSubtotal * (coupon.value / 100) * 100) / 100
        } else {
            discountAmount = Math.min(coupon.value, eligibleSubtotal)
        }

        return NextResponse.json({
            valid: true,
            couponId: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount: discountAmount,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
