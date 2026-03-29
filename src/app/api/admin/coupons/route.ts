import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { orders: true } } },
        })
        return NextResponse.json(coupons)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, type, value, scope, categoryIds, productIds, maxUses, expiresAt, active } = body

        if (!code || !type || value === undefined) {
            return NextResponse.json({ error: 'Código, tipo e valor são obrigatórios.' }, { status: 400 })
        }

        const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } })
        if (existing) {
            return NextResponse.json({ error: 'Já existe um cupom com este código.' }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                type,
                value: Number(value),
                scope: scope || 'all',
                categoryIds: categoryIds || null,
                productIds: productIds || null,
                maxUses: maxUses ? Number(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: active !== false,
            },
        })

        return NextResponse.json(coupon)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, code, type, value, scope, categoryIds, productIds, maxUses, expiresAt, active } = body

        if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

        if (code) {
            const existing = await prisma.coupon.findFirst({
                where: { code: code.toUpperCase().trim(), id: { not: id } },
            })
            if (existing) {
                return NextResponse.json({ error: 'Já existe outro cupom com este código.' }, { status: 400 })
            }
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                ...(code !== undefined && { code: code.toUpperCase().trim() }),
                ...(type !== undefined && { type }),
                ...(value !== undefined && { value: Number(value) }),
                ...(scope !== undefined && { scope }),
                ...(categoryIds !== undefined && { categoryIds }),
                ...(productIds !== undefined && { productIds }),
                ...(maxUses !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
                ...(active !== undefined && { active }),
            },
        })

        return NextResponse.json(coupon)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 })

        await prisma.order.updateMany({ where: { couponId: id }, data: { couponId: null } })
        await prisma.coupon.delete({ where: { id } })

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
