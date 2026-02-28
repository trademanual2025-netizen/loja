import { prisma } from './prisma'

export async function decreaseStock(items: { productId: string; variantId?: string | null; quantity: number }[]) {
    return prisma.$transaction(async (tx) => {
        for (const item of items) {
            if (item.variantId) {
                // Diminuir estoque da variante
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } }
                })
            } else {
                // Diminuir estoque do produto base
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            }
        }
    })
}
