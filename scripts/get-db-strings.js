const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const products = await prisma.product.findMany({ select: { name: true, description: true } });
    const settings = await prisma.settings.findMany({ where: { key: { in: ['STORE_BANNER_TITLE', 'STORE_BANNER_SUBTITLE'] } } });
    console.log('--- PRODUCTS ---');
    console.log(JSON.stringify(products, null, 2));
    console.log('--- SETTINGS ---');
    console.log(JSON.stringify(settings, null, 2));
}
main().finally(() => prisma.$disconnect());
