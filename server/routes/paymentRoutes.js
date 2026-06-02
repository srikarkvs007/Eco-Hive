const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { sendReceiptEmail } = require('../utils/emailService');
const activeDeliveries = require('../trackingStore');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { encrypt, decrypt, deterministicEncrypt } = require('../utils/encryption');

// We use a test secret key. In production, this should be in .env
// We can fall back to a mock/test key for development.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_stripe_secret_key_for_development');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_MockWebhookSecret';

// Helper function to centralize order fulfillment logic
async function fulfillOrder(orderId, userId) {
    // 1. Fetch the order with items
    const order = await prisma.customerOrder.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
    });

    if (!order || order.paymentStatus === 'Paid') return;

    // Decrypt shipping address for logistics and active tracking
    const plainAddress = decrypt(order.shippingAddress) || 'Customer Address';

    // 2. Deduct stock for each item
    for (const item of order.items) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
        });
    }

    // 3. Clear the user's cart
    await prisma.cartItem.deleteMany({
        where: { userId }
    });

    // 4. Award Eco-Points (e.g., 1 point per $10 spent)
    const earnedPoints = Math.floor(order.totalAmount / 10);
    await prisma.user.update({
        where: { id: userId },
        data: { ecoPoints: { increment: earnedPoints } }
    });

    // 5. Track Order Activity
    await prisma.userActivity.create({
        data: {
            userId,
            action: 'Placed Order',
            details: `Order #${order.id.slice(0,8)} placed for $${order.totalAmount.toFixed(2)}`
        }
    });

    // 6. Create Logistics Order (Smart Dispatching)
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

    console.log(`Order ${order.id} fulfilled. Logistics order created: ${logisticsOrder.id}`);
}

// Create a Checkout Session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingAddress } = req.body;

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

        // 1. Create a CustomerOrder with 'Pending' / 'Unpaid' status first
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

        // 2. Format Line Items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product.title,
                    images: item.product.imageUrl ? [item.product.imageUrl] : [],
                },
                unit_amount: Math.round(item.product.price * 100), // Stripe expects cents
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
                    unit_amount: Math.round(taxAmount * 100),
                },
                quantity: 1,
            });
        }

        let sessionUrl = '';
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        const isValidStripeKey = stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_');

        if (!isValidStripeKey) {
            const mockIntentId = `mock_session_${order.id}`;
            const encryptedMockIntent = deterministicEncrypt(mockIntentId);
            sessionUrl = `http://localhost:3000/order-success?session_id=${mockIntentId}`;
            
            // Mark order as paid instantly for dev purposes
            await prisma.customerOrder.update({
                where: { id: order.id },
                data: { paymentStatus: 'Paid', status: 'Paid', paymentIntentId: mockIntentId }
            });

            // Create relational Payment record
            await prisma.payment.create({
                data: {
                    userId: userId,
                    customerOrderId: order.id,
                    amount: parseFloat(finalTotal),
                    status: 'Succeeded',
                    paymentIntentId: encryptedMockIntent,
                    receiptUrl: null
                }
            });

            // Fulfill order (clears cart, awards eco-points, creates logistics order)
            await fulfillOrder(order.id, userId);

            return res.json({ id: 'mock_id', url: sessionUrl });
        } else {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `http://localhost:3000/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
                cancel_url: `http://localhost:3000/checkout?canceled=true`,
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
        console.error("Stripe Session Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Stripe Webhook for payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // If we are using a real secret, verify. Otherwise, simulate.
        if (process.env.STRIPE_SECRET_KEY) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // For mock dev environment without real webhook config, parse manually
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            // Fulfill the order
            const orderId = session.metadata.orderId;
            const userId = session.metadata.userId;

            // Fulfill order (clears cart, awards eco-points, creates logistics order)
            await fulfillOrder(orderId, userId);

            const encryptedPaymentIntent = deterministicEncrypt(session.id);
            const encryptedReceiptUrl = session.receipt_url ? encrypt(session.receipt_url) : null;

            const updatedOrder = await prisma.customerOrder.update({
                where: { id: orderId },
                data: {
                    paymentStatus: 'Paid',
                    status: 'Paid', // Move main status to Paid
                    receiptUrl: encryptedReceiptUrl
                },
                include: { user: true }
            });

            // Create relational Payment record
            await prisma.payment.create({
                data: {
                    userId: userId,
                    customerOrderId: orderId,
                    amount: session.amount_total / 100,
                    status: 'Succeeded',
                    paymentIntentId: encryptedPaymentIntent,
                    receiptUrl: encryptedReceiptUrl
                }
            });

            // Log activity
            await prisma.userActivity.create({
                data: {
                    userId: session.metadata.userId,
                    action: "Payment Successful",
                    details: `Paid ${session.amount_total / 100} USD for order ${orderId.substring(0, 8)}...`
                }
            });

            // Send Premium HTML Email Receipt
            if (updatedOrder.user && updatedOrder.user.email) {
                try {
                    await sendReceiptEmail(updatedOrder.user.email, {
                        id: updatedOrder.id,
                        totalAmount: updatedOrder.totalAmount
                    });
                } catch (emailErr) {
                    console.error('Failed to send receipt email, but order was paid:', emailErr);
                }
            }

        } catch (err) {
            console.error("Error fulfilling order:", err);
        }
    }

    res.json({ received: true });
});

// Simple in-memory OTP store
const otpStore = require('../utils/otpStore');


// Send OTP code
router.post('/send-otp', verifyToken, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

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
            console.log(`[OTP] Email sent. Preview URL: ${previewUrl}`);
        } catch (emailErr) {
            console.error("Nodemailer failed to send OTP email:", emailErr);
        }

        console.log(`[OTP] Generated OTP for user ${userId} (${user.email}): ${otpCode}`);
        res.json({ message: 'OTP sent successfully', code: otpCode, previewUrl });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ error: 'Server error generating OTP' });
    }
});

// Verify OTP code
router.post('/verify-otp', verifyToken, async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code) return res.status(400).json({ error: 'Missing userId or code' });

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
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: 'Server error during OTP verification' });
    }
});

module.exports = router;
