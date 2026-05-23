const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const activeDeliveries = require('../trackingStore');

// POST /api/customer-orders/checkout
// Convert user cart to a CustomerOrder
router.post('/checkout', async (req, res) => {
    try {
        const { userId, shippingAddress } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Fetch cart items for the user
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Verify stock
        for (const item of cartItems) {
            if (item.product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.product.title}. Only ${item.product.stockQuantity} left.` });
            }
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

        // Deduct stock for each item
        for (const item of cartItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity } }
            });
        }

        // Create the CustomerOrder
        const newOrder = await prisma.customerOrder.create({
            data: {
                userId,
                totalAmount,
                shippingAddress,
                status: 'Paid', // Assuming payment went through mock gateway
                items: {
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        priceAtPurchase: item.product.price
                    }))
                }
            }
        });

        // Clear the user's cart
        await prisma.cartItem.deleteMany({
            where: { userId }
        });

        // Track Order Activity
        await prisma.userActivity.create({
            data: {
                userId,
                action: 'Placed Order',
                details: `Order #${newOrder.id.slice(0,8)} placed for $${totalAmount.toFixed(2)}`
            }
        });

        // 🚀 SMART DISPATCHING INTEGRATION (Automatic on Buy)
        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const deliveryMode = totalQuantity > 3 ? 'Van' : 'Drone';
        const weight = totalQuantity * 1.5; // Dummy weight calculation
        const assignedDrones = deliveryMode === 'Drone' ? 1 : 0;

        const logisticsOrder = await prisma.order.create({
            data: {
                pickupLocation: 'Eco-Hive Main Warehouse',
                dropLocation: shippingAddress || 'Customer Address',
                packageType: 'Eco-Friendly Box',
                weight: weight,
                sensitivity: 'Standard',
                isPremium: true,
                deliveryMode: deliveryMode,
                assignedDrones: assignedDrones,
                status: 'Pending',
                customerOrderId: newOrder.id
            }
        });
        
        // Add to active deliveries for live tracking map
        activeDeliveries.set(logisticsOrder.id, {
            id: logisticsOrder.id,
            customerOrderId: newOrder.id,
            mode: deliveryMode,
            isPremium: true,
            drones: assignedDrones,
            lat: 48.8566 + (Math.random() * 0.02 - 0.01),
            lng: 2.3522 + (Math.random() * 0.02 - 0.01),
            pickup: 'Eco-Hive Main Warehouse',
            drop: shippingAddress || 'Customer Address'
        });
        
        console.log(`Smart Dispatch: Order ${newOrder.id} automatically assigned to ${deliveryMode} upon checkout.`);

        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder.id });
    } catch (err) {
        console.error("Error during checkout:", err);
        res.status(500).json({ message: 'Server error during checkout' });
    }
});

// GET /api/customer-orders/all
// Admin: Get all e-commerce orders with details
router.get('/all', async (req, res) => {
    try {
        const orders = await prisma.customerOrder.findMany({
            include: {
                user: { select: { name: true, email: true } },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/customer-orders/:id
// Get details for a specific order (for Success Page)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.customerOrder.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error("Error fetching order by ID:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/customer-orders/user/:userId
// User: Get past orders for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await prisma.customerOrder.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/customer-orders/update-status/:id
// Admin: Update Status
router.put('/update-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.customerOrder.update({
            where: { id },
            data: { status },
            include: { items: true } // Include items to calculate total quantity for smart dispatch
        });

        // Removed: Smart Dispatch is now handled automatically during Checkout
        
        res.json(updated);
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
