const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { sendReceiptEmail } = require('../utils/emailService');

// We use a test secret key. In production, this should be in .env
// We can fall back to a mock/test key for development.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'mock_stripe_secret_key_for_development');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_MockWebhookSecret';

// Create a Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { userId, items, totalAmount, shippingAddress } = req.body;

        // 1. Create a CustomerOrder with 'Pending' / 'Unpaid' status first
        const order = await prisma.customerOrder.create({
            data: {
                userId,
                totalAmount: parseFloat(totalAmount),
                status: 'Pending',
                paymentStatus: 'Unpaid',
                shippingAddress: shippingAddress,
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
        let sessionUrl = '';
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        const isValidStripeKey = stripeKey.startsWith('sk_') || stripeKey.startsWith('rk_');

        if (!isValidStripeKey) {
            sessionUrl = `http://localhost:3000/order-success?session_id=mock_session_${order.id}`;
            // Mark order as paid instantly for dev purposes
            await prisma.customerOrder.update({
                where: { id: order.id },
                data: { paymentStatus: 'Paid', status: 'Processing', paymentIntentId: `mock_session_${order.id}` }
            });
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
            const updatedOrder = await prisma.customerOrder.update({
                where: { id: orderId },
                data: {
                    paymentStatus: 'Paid',
                    status: 'Paid', // Move main status to Paid
                    receiptUrl: session.payment_intent // we could fetch actual receipt url if we expand the intent
                },
                include: { user: true }
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

module.exports = router;
