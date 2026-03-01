import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(req: NextRequest) {
    try {
        const { state, subtotal, zipCode } = await req.json()
        const options = await calculateShipping(state || 'SP', parseFloat(subtotal || '0'), zipCode)
        return NextResponse.json({ options })
    } catch (e) {
        console.error('[Shipping Route] Erro:', e)
        return NextResponse.json({
            options: [
                { label: 'PAC (8 dias úteis)', value: 24.90, days: 8 },
                { label: 'SEDEX (4 dias úteis)', value: 42.90, days: 4 },
            ]
        })
    }
}
