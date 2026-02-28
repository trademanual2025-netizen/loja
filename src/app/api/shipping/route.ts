import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(req: NextRequest) {
    const { state, subtotal, zipCode } = await req.json()
    if (!state || subtotal === undefined) {
        return NextResponse.json({ error: 'state e subtotal são obrigatórios.' }, { status: 400 })
    }

    const options = await calculateShipping(state, parseFloat(subtotal), zipCode)
    return NextResponse.json({ options })
}
