const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const newCategories = ['Apparel', 'Accessories', 'Tech'];
    for (const name of newCategories) {
        await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    }
    
    const categories = await prisma.category.findMany();
    const catMap = {};
    for (const cat of categories) catMap[cat.name] = cat.id;

    const products = await prisma.product.findMany();
    
    for (const p of products) {
        const title = p.title.toLowerCase();
        let catId = p.categoryId;
        
        // Re-map based on title to the new top-level categories if they match
        if (title.includes('shirt') || title.includes('hoodie') || title.includes('jacket') || title.includes('jeans') || title.includes('wear') || title.includes('scarf')) {
            catId = catMap['Apparel'];
        } else if (title.includes('keyboard') || title.includes('laptop') || title.includes('speaker') || title.includes('charger') || title.includes('power') || title.includes('case')) {
            catId = catMap['Tech'];
        } else if (title.includes('wallet') || title.includes('sunglasses') || title.includes('watch') || title.includes('bracelet') || title.includes('belt') || title.includes('tote')) {
            catId = catMap['Accessories'];
        }

        if (catId !== p.categoryId) {
            await prisma.product.update({
                where: { id: p.id },
                data: { categoryId: catId }
            });
            console.log(`Re-mapped ${p.title} -> category ID ${catId}`);
        }
    }
}

run().finally(() => prisma.$disconnect());
