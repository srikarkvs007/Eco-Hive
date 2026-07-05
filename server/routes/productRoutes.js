const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get community forest stats
router.get('/community-forest/stats', async (req, res) => {
    try {
        const totalOrders = await prisma.customerOrder.count();
        const treeRedemptions = await prisma.userActivity.count({
            where: {
                action: 'Redeemed Reward',
                details: {
                    contains: 'Planted a tree'
                }
            }
        });
        
        const baseOffset = 1500; // Premium starting milestone offset
        const totalPlanted = totalOrders + treeRedemptions + baseOffset;
        const targetGoal = 5000;
        
        res.json({
            totalPlanted,
            targetGoal,
            percentage: Math.min(Math.round((totalPlanted / targetGoal) * 100), 100),
            ordersPlanted: totalOrders,
            rewardsPlanted: treeRedemptions
        });
    } catch (err) {
        console.error("Error fetching community forest stats:", err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all products (with optional search and category filters)
router.get('/', async (req, res) => {
    try {
        const { search, categoryId, categoryName, minPrice, maxPrice, ecoFriendlyOnly, inStockOnly, sortBy } = req.query;
        let queryOptions = {
            include: { category: true, reviews: true }
        };

        let whereClause = {};
        
        if (search) {
            const searchTerms = search.split(' ').filter(term => term.trim().length > 0);
            
            if (searchTerms.length > 0) {
                whereClause.OR = searchTerms.flatMap(term => [
                    { title: { contains: term, mode: 'insensitive' } },
                    { features: { contains: term, mode: 'insensitive' } },
                    { description: { contains: term, mode: 'insensitive' } }
                ]);
            }
        }
        
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }
        
        if (categoryName) {
            whereClause.category = {
                name: categoryName
            };
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            whereClause.price = {};
            if (minPrice) whereClause.price.gte = parseFloat(minPrice);
            if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
        }
        
        if (ecoFriendlyOnly === 'true') {
            whereClause.isEcoFriendly = true;
        }
        
        if (inStockOnly === 'true') {
            whereClause.stockQuantity = { gt: 0 };
        }

        if (Object.keys(whereClause).length > 0) {
            queryOptions.where = whereClause;
        }
        
        if (sortBy === 'price_asc') queryOptions.orderBy = { price: 'asc' };
        else if (sortBy === 'price_desc') queryOptions.orderBy = { price: 'desc' };
        else if (sortBy === 'newest') queryOptions.orderBy = { createdAt: 'desc' };
        else queryOptions.orderBy = { createdAt: 'desc' };

        const products = await prisma.product.findMany(queryOptions);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all reviews across all products (Admin only)
// GET /api/products/reviews/all
router.get('/reviews/all', verifyAdmin, async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            include: { 
                user: { select: { name: true, email: true } },
                product: { select: { title: true } }
            }
        });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching all reviews' });
    }
});

// Delete a review (Admin only)
// DELETE /api/products/reviews/:id
router.delete('/reviews/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({
            where: { id }
        });
        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting review' });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { 
                category: true,
                reviews: {
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new product (Admin route)
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { title, description, features, specifications, perfectFor, price, stockQuantity, imageUrl, isEcoFriendly, categoryId, sku, regionId } = req.body;
        
        const newProduct = await prisma.product.create({
            data: {
                title,
                description,
                features,
                specifications,
                perfectFor,
                price: parseFloat(price),
                stockQuantity: parseInt(stockQuantity),
                imageUrl,
                isEcoFriendly: Boolean(isEcoFriendly),
                categoryId,
                sku: sku || null,
                regionId: regionId || null
            }
        });

        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a product (Admin route)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, features, specifications, perfectFor, price, stockQuantity, imageUrl, isEcoFriendly, categoryId, sku, regionId } = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                title,
                description,
                features,
                specifications,
                perfectFor,
                price: price !== undefined ? parseFloat(price) : undefined,
                stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
                imageUrl,
                isEcoFriendly: isEcoFriendly !== undefined ? Boolean(isEcoFriendly) : undefined,
                categoryId,
                sku: sku !== undefined ? (sku || null) : undefined,
                regionId: regionId !== undefined ? (regionId || null) : undefined
            }
        });

        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating product' });
    }
});

// Delete a product (Admin route)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // First delete all cart items and order items associated with this product to prevent foreign key constraint errors
        await prisma.cartItem.deleteMany({
            where: { productId: id }
        });

        await prisma.orderItem.deleteMany({
            where: { productId: id }
        });

        // Now delete the product
        await prisma.product.delete({
            where: { id }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await prisma.review.findMany({
            where: { productId: id },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a review
router.post('/:id/reviews', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rating, comment } = req.body;
        
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only post reviews on your own behalf.' });
        }

        const review = await prisma.review.create({
            data: {
                productId: id,
                userId,
                rating: parseInt(rating),
                comment
            },
            include: { user: { select: { name: true, email: true } } }
        });
        res.status(201).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
