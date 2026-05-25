const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Get all cart items for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true }
        });
        res.json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add an item to the cart
router.post('/', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        const requestedQuantity = quantity || 1;

        // Verify product exists and check stock
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if item already in cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: { userId, productId }
        });

        const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
        const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

        if (product.stockQuantity < totalRequestedQuantity) {
            return res.status(400).json({ message: `Cannot add to cart. Only ${product.stockQuantity} items left in stock.` });
        }

        if (existingCartItem) {
            // Update quantity
            const updatedItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: totalRequestedQuantity }
            });
            return res.json(updatedItem);
        }

        // Add new item
        const newCartItem = await prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity: requestedQuantity
            }
        });

        res.status(201).json(newCartItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove an item from the cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await prisma.cartItem.delete({
            where: { id }
        });

        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update item quantity
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        
        // Ensure quantity is positive
        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const item = await prisma.cartItem.findUnique({
            where: { id },
            include: { product: true }
        });

        if (!item) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (item.product.stockQuantity < quantity) {
            return res.status(400).json({ message: `Only ${item.product.stockQuantity} items left in stock.` });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id },
            data: { quantity: parseInt(quantity) }
        });

        res.json(updatedItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
