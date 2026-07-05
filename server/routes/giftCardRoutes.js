const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Helper to generate secure random Gift Card code: ECO-XXXX-XXXX-XXXX
function generateGiftCardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codeParts = [];
    for (let i = 0; i < 3; i++) {
        let part = '';
        for (let j = 0; j < 4; j++) {
            part += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        codeParts.push(part);
    }
    return `ECO-${codeParts.join('-')}`;
}

// 1. Purchase a Gift Card
// POST /api/gift-cards/purchase
router.post('/purchase', verifyToken, async (req, res) => {
    try {
        const { amount, recipientName, recipientEmail, senderName, senderEmail, message, design } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }
        if (!recipientEmail || !recipientName || !senderName || !senderEmail) {
            return res.status(400).json({ message: 'Missing required recipient or sender details' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email !== senderEmail && user.role !== 'Admin') {
            return res.status(403).json({ message: 'Sender email must match your registered email.' });
        }

        const code = generateGiftCardCode();

        const giftCard = await prisma.giftCard.create({
            data: {
                code,
                amount: parseFloat(amount),
                balance: parseFloat(amount),
                senderName,
                senderEmail,
                recipientName,
                recipientEmail,
                message: message || '',
                design: design || 'Classic',
                status: 'Active'
            }
        });

        // Track user activity
        await prisma.userActivity.create({
            data: {
                userId,
                action: 'Purchased Gift Card',
                details: `Gift Card code generated for $${parseFloat(amount).toFixed(2)} to ${recipientEmail}`
            }
        });

        res.status(201).json({
            message: 'Gift Card purchased successfully',
            giftCard
        });
    } catch (err) {
        console.error('Error purchasing gift card:', err);
        res.status(500).json({ message: 'Server error purchasing gift card' });
    }
});

// 2. Redeem a Gift Card
// POST /api/gift-cards/redeem
router.post('/redeem', verifyToken, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ message: 'Gift Card code is required' });
        }

        // Find the gift card
        const giftCard = await prisma.giftCard.findUnique({
            where: { code }
        });

        if (!giftCard) {
            return res.status(404).json({ message: 'Gift Card not found. Please verify the code.' });
        }

        if (giftCard.status !== 'Active' || giftCard.balance <= 0) {
            return res.status(400).json({ message: 'This Gift Card has already been redeemed or has expired.' });
        }

        // Add balance to user and mark card redeemed
        const balanceToRedeem = giftCard.balance;

        await prisma.$transaction([
            // Update User's giftCardBalance
            prisma.user.update({
                where: { id: userId },
                data: { giftCardBalance: { increment: balanceToRedeem } }
            }),
            // Update GiftCard status
            prisma.giftCard.update({
                where: { id: giftCard.id },
                data: {
                    balance: 0.0,
                    status: 'Redeemed',
                    redeemedAt: new Date(),
                    redeemedById: userId
                }
            }),
            // Track activity
            prisma.userActivity.create({
                data: {
                    userId,
                    action: 'Redeemed Gift Card',
                    details: `Redeemed Gift Card code ${giftCard.code} for $${balanceToRedeem.toFixed(2)}`
                }
            })
        ]);

        res.json({
            message: 'Gift Card redeemed successfully!',
            amountRedeemed: balanceToRedeem
        });
    } catch (err) {
        console.error('Error redeeming gift card:', err);
        res.status(500).json({ message: 'Server error redeeming gift card' });
    }
});

// 3. Get Wallet Balance
// GET /api/gift-cards/balance
router.get('/balance', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { giftCardBalance: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ giftCardBalance: user.giftCardBalance });
    } catch (err) {
        console.error('Error fetching gift card balance:', err);
        res.status(500).json({ message: 'Server error fetching balance' });
    }
});

// 4. Get User's Gift Card Activity History
// GET /api/gift-cards/my-activity
router.get('/my-activity', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch User's email to match cards purchased for/by them
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find cards redeemed by this user or purchased from/to this user's email
        const cards = await prisma.giftCard.findMany({
            where: {
                OR: [
                    { redeemedById: userId },
                    { senderEmail: user.email },
                    { recipientEmail: user.email }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(cards);
    } catch (err) {
        console.error('Error fetching gift card activity:', err);
        res.status(500).json({ message: 'Server error fetching activity logs' });
    }
});

// 5. Get all gift cards (Admin only)
// GET /api/gift-cards/all
router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const cards = await prisma.giftCard.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                redeemedBy: { select: { name: true, email: true } }
            }
        });
        res.json(cards);
    } catch (err) {
        console.error('Error fetching all gift cards:', err);
        res.status(500).json({ message: 'Server error fetching gift cards' });
    }
});

module.exports = router;
