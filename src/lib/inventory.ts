import { prisma } from './prisma'

type StockItem = { productId: string; variantId?: string | null; quantity: number }

export async function decreaseStock(items: StockItem[]) {
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
                    throw new Error(`Estoque insuficiente para o produto ${item.productId}`)
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            }
        }
    })
}

export async function increaseStock(items: StockItem[]) {
    return prisma.$transaction(async (tx) => {
        for (const item of items) {
            if (item.variantId) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { increment: item.quantity } }
                })
            } else {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                })
            }
        }
    })
}
