const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const images = [
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop'
    ];
    const banner = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2000&auto=format&fit=crop';

    const product = await prisma.product.update({
        where: { slug: 'bolsa-mini-crossbody' },
        data: {
            images: images,
            bannerUrl: banner
        }
    });

    console.log('Successfully updated product images');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
