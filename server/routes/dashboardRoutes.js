const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const activeDeliveries = require('../trackingStore');
const { verifyAdmin } = require('../middleware/auth');

router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        // Aggregate E-commerce Revenue
        const paidOrders = await prisma.customerOrder.aggregate({
            _sum: { totalAmount: true },
            where: { status: { in: ['Paid', 'Processing', 'Dispatched', 'Delivered'] } }
        });
        
        // Active Logistics Routes
        const pendingOrders = await prisma.order.count({
            where: { status: 'Pending' }
        });
        const inTransitOrders = await prisma.order.count({
            where: { status: 'In Transit' }
        });

        // Inventory Warnings
        const lowStockProducts = await prisma.product.count({
            where: { stockQuantity: { lt: 10 } }
        });

        // Calculate Drones vs Vans based on the live tracking store
        let activeDrones = 0;
        let activeVans = 0;
        
        for (const delivery of activeDeliveries.values()) {
            if (delivery.mode && delivery.mode.includes('Drone')) {
                activeDrones += (delivery.drones || 1);
            } else {
                activeVans += 1;
            }
        }

        // Total Products
        const totalProducts = await prisma.product.count();

        // Orders Today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const ordersToday = await prisma.customerOrder.count({
            where: { createdAt: { gte: startOfToday } }
        });

        // Expanded KPIs
        const totalVehicles = await prisma.vehicle.count();
        const totalUsers = await prisma.user.count({ where: { role: 'User' } });
        const totalReviews = await prisma.review.count();
        const activeGiftCards = await prisma.giftCard.count({ where: { status: 'Active' } });

        res.json({
            totalRevenue: paidOrders._sum.totalAmount || 0,
            pendingDeliveries: pendingOrders,
            inTransit: inTransitOrders,
            activeDrones,
            activeVans,
            lowStockAlerts: lowStockProducts,
            totalProducts,
            ordersToday,
            totalVehicles,
            totalUsers,
            totalReviews,
            activeGiftCards
        });
    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

router.get('/sales-trend', verifyAdmin, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const orders = await prisma.customerOrder.findMany({
            where: {
                status: { in: ['Paid', 'Shipped', 'Delivered'] },
                createdAt: { gte: sevenDaysAgo }
            },
            select: { createdAt: true, totalAmount: true }
        });

        // Initialize array for last 7 days
        const grouped = {};
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            grouped[dateStr] = 0;
        }

        // Aggregate
        orders.forEach(o => {
            const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (grouped[dateStr] !== undefined) {
                grouped[dateStr] += o.totalAmount;
            }
        });

        const trend = Object.keys(grouped).map(key => ({
            name: key,
            revenue: parseFloat(grouped[key].toFixed(2))
        }));

        res.json(trend);
    } catch (err) {
        console.error("Error fetching sales trend:", err);
        res.status(500).json({ error: "Failed to fetch trend" });
    }
});

module.exports = router;
