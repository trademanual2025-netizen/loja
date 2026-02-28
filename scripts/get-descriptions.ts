import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const products = await prisma.product.findMany({ select: { name: true, description: true } })
    products.forEach(p => {
        console.log(`[NAME] ${p.name}`)
        console.log(`[DESC] ${p.description}`)
    })
}

main().finally(() => prisma.$disconnect())
