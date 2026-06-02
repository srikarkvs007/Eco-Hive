const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken } = require('../middleware/auth');

// Get user's wishlist
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const wishlist = await prisma.wishlistItem.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(wishlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to wishlist
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.body;
        // Check if already exists to prevent unique constraint error
        const existing = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: { userId, productId }
            }
        });
        if (existing) {
            return res.status(200).json(existing);
        }

        const item = await prisma.wishlistItem.create({
            data: { userId, productId },
            include: { product: true }
        });
        res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from wishlist
router.delete('/:userId/:productId', verifyToken, async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await prisma.wishlistItem.deleteMany({
            where: { userId, productId }
        });
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
