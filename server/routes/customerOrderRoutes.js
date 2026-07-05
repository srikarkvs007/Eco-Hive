const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const activeDeliveries = require('../trackingStore');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

// POST /api/customer-orders/checkout
// Convert user cart to a CustomerOrder
router.post('/checkout', verifyToken, async (req, res) => {
    try {
        const { userId, shippingAddress } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only checkout for yourself.' });
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

        // Fetch customer region to assign matching Admin
        const customer = await prisma.user.findUnique({
            where: { id: userId }
        });
        const regionId = customer ? customer.regionId : null;
        let assignedAdminId = null;
        if (regionId) {
            const admin = await prisma.user.findFirst({
                where: { role: 'Admin', regionId }
            });
            if (admin) {
                assignedAdminId = admin.id;
            }
        }

        // Create the CustomerOrder
        const newOrder = await prisma.customerOrder.create({
            data: {
                userId,
                totalAmount,
                shippingAddress: encrypt(shippingAddress),
                status: 'Paid', // Assuming payment went through mock gateway
                regionId,
                assignedAdminId,
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

        // Award Eco-Points (e.g., 1 point per $10 spent)
        const earnedPoints = Math.floor(totalAmount / 10);
        await prisma.user.update({
            where: { id: userId },
            data: { ecoPoints: { increment: earnedPoints } }
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
                pickupLocation: encrypt('Eco-Hive Main Warehouse'),
                dropLocation: encrypt(shippingAddress || 'Customer Address'),
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
// Admin: Get all e-commerce orders with details (geographically assigned to admin)
router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const adminRegion = req.admin.regionId;
        const queryOptions = {
            include: {
                user: { select: { name: true, email: true, phone: true, address: true, contactInfo: true } },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        };

        // Filter orders by admin's region if set
        if (adminRegion) {
            queryOptions.where = {
                regionId: adminRegion
            };
        }

        const orders = await prisma.customerOrder.findMany(queryOptions);
        
        const decryptedOrders = orders.map(o => ({
            ...o,
            shippingAddress: decrypt(o.shippingAddress),
            user: o.user ? {
                ...o.user,
                phone: decrypt(o.user.phone),
                address: decrypt(o.user.address),
                contactInfo: decrypt(o.user.contactInfo)
            } : null
        }));
        
        res.json(decryptedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/customer-orders/:id
// Get details for a specific order (for Success Page)
router.get('/:id', verifyToken, async (req, res) => {
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

        if (order.userId !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
        }
        
        res.json({
            ...order,
            shippingAddress: decrypt(order.shippingAddress)
        });
    } catch (err) {
        console.error("Error fetching order by ID:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/customer-orders/user/:userId
// User: Get past orders for a specific user
router.get('/user/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own order history.' });
        }
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
        
        const decryptedOrders = orders.map(o => ({
            ...o,
            shippingAddress: decrypt(o.shippingAddress)
        }));
        
        res.json(decryptedOrders);
    } catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/customer-orders/update-status/:id
// Admin: Update Status
router.put('/update-status/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.customerOrder.update({
            where: { id },
            data: { status },
            include: { items: true }
        });

        // Also update any linked logistics orders status
        if (status === 'Dispatched') {
            await prisma.order.updateMany({
                where: { customerOrderId: id },
                data: { status: 'In Transit' }
            });
        } else if (status === 'Delivered') {
            await prisma.order.updateMany({
                where: { customerOrderId: id },
                data: { status: 'Delivered' }
            });
            // Also clean up from active tracking map
            const logistics = await prisma.order.findMany({ where: { customerOrderId: id } });
            logistics.forEach(l => activeDeliveries.delete(l.id));
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('order_status_updated', {
                orderId: updated.id,
                status: status
            });
        }
        
        res.json({
            ...updated,
            shippingAddress: decrypt(updated.shippingAddress)
        });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
