const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const categories = await prisma.category.findMany();
    const catMap = {};
    for (const cat of categories) catMap[cat.name] = cat.id;
    
    const products = await prisma.product.findMany({ where: { categoryId: null } });
    
    for (const p of products) {
        const title = p.title.toLowerCase();
        let catId = null;
        
        if (title.includes('soap') || title.includes('shampoo') || title.includes('care') || title.includes('brush') || title.includes('cotton')) {
            catId = catMap['Personal Care'];
        } else if (title.includes('kitchen') || title.includes('clean') || title.includes('bowl') || title.includes('plate') || title.includes('towel') || title.includes('wrap')) {
            catId = catMap['Home & Kitchen'];
        } else if (title.includes('solar') || title.includes('light') || title.includes('lamp') || title.includes('tech') || title.includes('charger') || title.includes('battery')) {
            catId = catMap['Tech & Lighting'];
        } else {
            catId = catMap['Reusable Essentials']; // default catch-all
        }
        
        await prisma.product.update({
            where: { id: p.id },
            data: { categoryId: catId }
        });
        console.log(`Updated ${p.title} -> category ${catId}`);
    }
}

run().finally(() => prisma.$disconnect());
