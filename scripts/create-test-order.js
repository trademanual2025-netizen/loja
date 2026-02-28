const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    // Get first user and product
    const user = await prisma.user.findFirst();
    const product = await prisma.product.findFirst();

    if (!user) { console.log('No users found. Skipping.'); return; }
    if (!product) { console.log('No products found. Skipping.'); return; }

    const order = await prisma.order.create({
        data: {
            userId: user.id,
            status: 'PAID',
            gateway: 'mercadopago',
            total: 119.90,
            shippingCost: 15.00,
            zipCode: '01310-100',
            street: 'Av Paulista',
            number: '100',
            complement: '',
            neighborhood: 'Bela Vista',
            city: 'Sao Paulo',
            state: 'SP',
            items: {
                create: {
                    productId: product.id,
                    quantity: 1,
                    price: product.price,
                }
            }
        }
    });

    console.log('Test order created:', order.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
