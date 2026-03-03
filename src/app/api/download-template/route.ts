import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'public', 'modelo_produtos.xlsx')
        const fileBuffer = await readFile(filePath)

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="modelo_produtos.xlsx"',
            },
        })
    } catch {
        return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }
}
