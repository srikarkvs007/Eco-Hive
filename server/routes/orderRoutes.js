const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.post('/add', async (req, res) => {
    try {
        const newOrder = await prisma.order.create({
            data: {
                pickupLocation: req.body.pickupLocation,
                dropLocation: req.body.dropLocation,
                packageType: req.body.packageType,
                deliveryMode: req.body.deliveryMode,
            }
        });
        res.json({ message: 'Order Added', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const orders = await prisma.order.findMany();
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
