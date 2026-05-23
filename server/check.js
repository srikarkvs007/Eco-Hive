const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);
    const products = await prisma.product.findMany();
    console.log('Products:', products.map(p => ({ title: p.title, categoryId: p.categoryId })));
}
run().finally(() => prisma.$disconnect());
