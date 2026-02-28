import { prisma } from './prisma'

export async function decreaseStock(items: { productId: string; variantId?: string | null; quantity: number }[]) {
    return prisma.$transaction(async (tx) => {
        for (const item of items) {
            if (item.variantId) {
                const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } })
                if (!variant || variant.stock < item.quantity) {
                    throw new Error(`Estoque insuficiente para variante ${item.variantId}`)
                }
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } }
                })
            } else {
                const product = await tx.product.findUnique({ where: { id: item.productId } })
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Estoque insuficiente para produto ${item.productId}`)
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            }
        }
    })
}
