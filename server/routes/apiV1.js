const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { encrypt, decrypt, deterministicEncrypt } = require('../utils/encryption');
const otpStore = require('../utils/otpStore');
const activeDeliveries = require('../trackingStore');
const { sendReceiptEmail } = require('../utils/emailService');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_stripe_secret_key_for_development');

// Order fulfillment helper logic (replicated from paymentRoutes.js)
async function fulfillOrder(orderId, userId) {
    const order = await prisma.customerOrder.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
    });

    if (!order || order.paymentStatus === 'Paid') return;

    const plainAddress = decrypt(order.shippingAddress) || 'Customer Address';

    // Deduct stock for each item
    for (const item of order.items) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
        });
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
        where: { userId }
    });

    // Award Eco-Points
    const earnedPoints = Math.floor(order.totalAmount / 10);
    await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: earnedPoints } }
    });

    // Track Order Activity
    await prisma.userActivity.create({
        data: {
            userId,
            action: 'Placed Order',
            details: `Order #${order.id.slice(0,8)} placed for $${order.totalAmount.toFixed(2)}`
        }
    });

    // Create Logistics Order (Smart Dispatching)
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryMode = totalQuantity > 3 ? 'Van' : 'Drone';
    const weight = totalQuantity * 1.5;
    const assignedDrones = deliveryMode === 'Drone' ? 1 : 0;

    const logisticsOrder = await prisma.order.create({
        data: {
            pickupLocation: encrypt('Eco-Hive Main Warehouse'),
            dropLocation: encrypt(plainAddress),
            packageType: 'Eco-Friendly Box',
            weight: weight,
            sensitivity: 'Standard',
            isPremium: true,
            deliveryMode: deliveryMode,
            assignedDrones: assignedDrones,
            status: 'Pending',
            customerOrderId: order.id
        }
    });

    // Add to active deliveries for live tracking map
    activeDeliveries.set(logisticsOrder.id, {
        id: logisticsOrder.id,
        customerOrderId: order.id,
        mode: deliveryMode,
        isPremium: true,
        drones: assignedDrones,
        lat: 48.8566 + (Math.random() * 0.02 - 0.01),
        lng: 2.3522 + (Math.random() * 0.02 - 0.01),
        pickup: 'Eco-Hive Main Warehouse',
        drop: plainAddress
    });

    console.log(`[API V1] Order ${order.id} fulfilled. Logistics order created: ${logisticsOrder.id}`);
}

/* ==========================================
   2.1 USER & AUTHENTICATION ENDPOINTS
   ========================================== */

// POST /api/v1/auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Track Login Activity
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: 'Logged In',
                details: 'User authenticated successfully via API v1'
            }
        });

        res.json({ 
            token, 
            message: 'Login Success', 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                themePreference: user.themePreference,
                ecoPoints: user.ecoPoints,
                regionId: user.regionId,
                phone: decrypt(user.phone),
                address: decrypt(user.address),
                contactInfo: decrypt(user.contactInfo)
            } 
        });
    } catch (err) {
        console.error("V1 Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/v1/auth/otp/send
router.post('/auth/otp/send', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. You can only request OTP verification for yourself.' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        otpStore.set(userId, { code: otpCode, expiresAt });

        const userEmail = user.email;
        let previewUrl = null;
        
        try {
            const nodemailer = require('nodemailer');
            const testAccount = await nodemailer.createTestAccount();
            const transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            const info = await transporter.sendMail({
                from: '"Eco-Hive Secure" <security@eco-hive.com>',
                to: userEmail,
                subject: "Eco-Hive Security - Two-Factor OTP Verification Code",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 500px; margin: auto; background: #f9f9f9; border-radius: 12px; border: 1px solid #eee;">
                        <h2 style="color: #1d9e75; text-align: center;">EcoHive Security</h2>
                        <p>Hello ${user.name || 'Valued Customer'},</p>
                        <p>We received a request to authorize a transaction. Please use the following One-Time Password (OTP) to complete your checkout process. This code is valid for 5 minutes:</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #333; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                            ${otpCode}
                        </div>
                        <p style="color: #888; font-size: 12px; text-align: center;">If you did not initiate this transaction, please secure your account immediately.</p>
                    </div>
                `
            });
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[OTP v1] Email sent. Preview URL: ${previewUrl}`);
        } catch (emailErr) {
            console.error("Nodemailer failed to send OTP v1 email:", emailErr);
        }

        console.log(`[OTP v1] Generated OTP for user ${userId} (${user.email}): ${otpCode}`);
        res.json({ message: 'OTP sent successfully', code: otpCode, previewUrl });
    } catch (err) {
        console.error("V1 OTP Send Error:", err);
        res.status(500).json({ error: 'Server error generating OTP' });
    }
});

// POST /api/v1/auth/otp/verify
router.post('/auth/otp/verify', verifyToken, async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code) return res.status(400).json({ error: 'Missing userId or code' });

        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. You can only verify OTP for yourself.' });
        }

        const record = otpStore.get(userId);
        if (!record) {
            return res.status(400).json({ success: false, message: 'No OTP code generated. Please request a new one.' });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(userId);
            return res.status(400).json({ success: false, message: 'OTP code has expired.' });
        }

        if (record.code !== code) {
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        otpStore.delete(userId);
        res.json({ success: true, message: 'OTP verified successfully.' });
    } catch (err) {
        console.error("V1 OTP Verify Error:", err);
        res.status(500).json({ error: 'Server error during OTP verification' });
    }
});

// GET /api/v1/users/profile
router.get('/users/profile', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, profilePicture: true, phone: true, address: true, regionId: true, contactInfo: true, ecoPoints: true, giftCardBalance: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.json({
            ...user,
            phone: decrypt(user.phone),
            address: decrypt(user.address),
            contactInfo: decrypt(user.contactInfo)
        });
    } catch (err) {
        console.error("V1 Fetch Profile Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ==========================================
   2.2 ORDER & DISPATCH ENDPOINTS
   ========================================== */

// POST /api/v1/orders/checkout
router.post('/orders/checkout', verifyToken, async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingAddress, useGiftCardBalance } = req.body;

        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied. You can only checkout for yourself.' });
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

        // Calculate subtotal and tax (8%)
        const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const taxAmount = subtotal * 0.08;
        const finalTotal = subtotal + taxAmount;

        // Verify gift card balance deduction
        let appliedGiftCardAmount = 0;
        if (useGiftCardBalance && customer && customer.giftCardBalance > 0) {
            appliedGiftCardAmount = Math.min(customer.giftCardBalance, finalTotal);
        }

        const remainingTotal = finalTotal - appliedGiftCardAmount;

        // Create CustomerOrder with 'Pending' status and 'Unpaid' payment status
        const order = await prisma.customerOrder.create({
            data: {
                userId,
                totalAmount: parseFloat(finalTotal),
                status: 'Pending',
                paymentStatus: 'Unpaid',
                shippingAddress: encrypt(shippingAddress),
                regionId,
                assignedAdminId,
                items: {
                    create: items.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        priceAtPurchase: item.product.price
                    }))
                }
            }
        });

        // Deduct Gift Card balance if applied
        if (appliedGiftCardAmount > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { giftCardBalance: { decrement: appliedGiftCardAmount } }
            });

            // Track activity for gift card usage
            await prisma.userActivity.create({
                data: {
                    userId,
                    action: 'Applied Gift Card Balance',
                    details: `Applied $${appliedGiftCardAmount.toFixed(2)} from gift card balance to Order #${order.id.slice(0, 8)}`
                }
            });
        }

        // If order is fully covered by gift card balance
        if (remainingTotal <= 0.01) {
            // Mark order paid instantly
            await prisma.customerOrder.update({
                where: { id: order.id },
                data: { paymentStatus: 'Paid', status: 'Paid', paymentIntentId: `giftcard_pay_${order.id}` }
            });

            // Create Payment record
            await prisma.payment.create({
                data: {
                    userId: userId,
                    customerOrderId: order.id,
                    amount: parseFloat(finalTotal),
                    status: 'Succeeded',
                    paymentIntentId: deterministicEncrypt(`giftcard_pay_${order.id}`),
                    receiptUrl: null
                }
            });

            // Fulfill the order
            await fulfillOrder(order.id, userId);

            // Return success URL
            const sessionUrl = `http://localhost:3000/order-success?session_id=giftcard_pay_${order.id}`;
            return res.json({ id: `giftcard_pay_${order.id}`, url: sessionUrl });
        }

        // Format Line Items for Stripe based on remaining amount
        const discountFactor = remainingTotal / finalTotal;
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.title,
                    images: (item.product.imageUrl && (item.product.imageUrl.startsWith('http://') || item.product.imageUrl.startsWith('https://'))) ? [item.product.imageUrl] : [],
                },
                unit_amount: Math.round(item.product.price * discountFactor * 100),
            },
            quantity: item.quantity,
        }));

        // Append tax line item
        if (taxAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Sales Tax (8%)',
                    },
                    unit_amount: Math.round(taxAmount * discountFactor * 100),
                },
                quantity: 1,
            });
        }

        let sessionUrl = '';
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        const isValidStripeKey = stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_');

        if (!isValidStripeKey) {
            // Mock checkout session for development environment
            const mockIntentId = `mock_session_${order.id}`;
            const encryptedMockIntent = deterministicEncrypt(mockIntentId);
            sessionUrl = `http://localhost:3000/order-success?session_id=${mockIntentId}`;
            
            // Mark order paid instantly for development
            await prisma.customerOrder.update({
                where: { id: order.id },
                data: { paymentStatus: 'Paid', status: 'Paid', paymentIntentId: mockIntentId }
            });

            // Create relational Payment record
            await prisma.payment.create({
                data: {
                    userId: userId,
                    customerOrderId: order.id,
                    amount: parseFloat(remainingTotal),
                    status: 'Succeeded',
                    paymentIntentId: encryptedMockIntent,
                    receiptUrl: null
                }
            });

            // Fulfill the order
            await fulfillOrder(order.id, userId);

            return res.json({ id: 'mock_id', url: sessionUrl });
        } else {
            // Live Stripe session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `http://localhost:3000/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
                cancel_url: `http://localhost:3000/gateway?canceled=true`,
                metadata: {
                    orderId: order.id,
                    userId: userId
                }
            });

            await prisma.customerOrder.update({
                where: { id: order.id },
                data: { paymentIntentId: session.id }
            });

            sessionUrl = session.url;
            return res.json({ id: session.id, url: sessionUrl });
        }
    } catch (err) {
        console.error("V1 Checkout Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/admin/orders?regionId={id}
router.get('/admin/orders', verifyAdmin, async (req, res) => {
    try {
        const regionId = req.query.regionId || req.admin.regionId;

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

        if (regionId) {
            queryOptions.where = {
                regionId: regionId
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
        console.error("V1 Fetch Admin Orders Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/v1/admin/orders/{orderId}/status
router.patch('/admin/orders/:orderId/status', verifyAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['Dispatched', 'Delivered', 'Processing', 'Paid', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status transition' });
        }

        const updated = await prisma.customerOrder.update({
            where: { id: orderId },
            data: { status },
            include: { items: true }
        });

        // Sync linked logistics order status
        if (status === 'Dispatched') {
            await prisma.order.updateMany({
                where: { customerOrderId: orderId },
                data: { status: 'In Transit' }
            });
        } else if (status === 'Delivered') {
            await prisma.order.updateMany({
                where: { customerOrderId: orderId },
                data: { status: 'Delivered' }
            });
            // Remove from live tracking store
            const logistics = await prisma.order.findMany({ where: { customerOrderId: orderId } });
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
        console.error("V1 Patch Order Status Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
