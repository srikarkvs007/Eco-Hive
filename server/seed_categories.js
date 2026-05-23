const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const categories = ['Personal Care', 'Home & Kitchen', 'Reusable Essentials', 'Tech & Lighting'];
    
    // Create categories if they don't exist
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }

    const personalCare = await prisma.category.findUnique({ where: { name: 'Personal Care' } });
    const kitchen = await prisma.category.findUnique({ where: { name: 'Home & Kitchen' } });
    const reusable = await prisma.category.findUnique({ where: { name: 'Reusable Essentials' } });
    const tech = await prisma.category.findUnique({ where: { name: 'Tech & Lighting' } });

    // Map existing products to categories
    const products = await prisma.product.findMany();
    
    for (const p of products) {
        let catId = null;
        if (p.title.includes('Toothbrush')) catId = personalCare.id;
        else if (p.title.includes('WaterBottle') || p.title.includes('Straws')) catId = reusable.id;
        else if (p.title.includes('Wraps')) catId = kitchen.id;
        else if (p.title.includes('Lamp')) catId = tech.id;
        else catId = reusable.id; // fallback

        if (catId) {
            await prisma.product.update({
                where: { id: p.id },
                data: { categoryId: catId }
            });
        }
    }
    console.log("Categories seeded successfully!");
}

run()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
