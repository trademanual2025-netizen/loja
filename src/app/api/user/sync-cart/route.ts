import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    try {
        const { items } = await req.json()

        const cartData = Array.isArray(items) && items.length > 0
            ? JSON.stringify(items.map((i: any) => ({
                id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image || null,
                variantName: i.variantName || null,
            })))
            : null

        await prisma.user.update({
            where: { id: user.id },
            data: { cartData },
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: 'Erro ao sincronizar carrinho' }, { status: 500 })
    }
}
