const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/encryption');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.post('/register', async (req,res) => {
    try {
        const { name, email, password, role, regionId, contactInfo } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'User',
                regionId: regionId || null,
                contactInfo: contactInfo ? encrypt(contactInfo) : null
            }
        });

        res.json({ message: 'Register Success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
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
                details: 'User authenticated successfully'
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
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/theme', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.id !== id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only update your own theme preference.' });
        }
        const { themePreference } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { themePreference }
        });
        res.json({ message: 'Theme updated', themePreference: updatedUser.themePreference });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update theme' });
    }
});

// GET /api/users (Admin Only)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, ecoPoints: true, createdAt: true, regionId: true, contactInfo: true, phone: true, address: true }
        });
        const decryptedUsers = users.map(u => ({
            ...u,
            phone: decrypt(u.phone),
            address: decrypt(u.address),
            contactInfo: decrypt(u.contactInfo)
        }));
        res.json(decryptedUsers);
    } catch (err) {
        console.error("Error fetching all users:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/users/:id (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete dependent user activity logs
        await prisma.userActivity.deleteMany({ where: { userId: id } });

        // 2. Delete wishlist items
        await prisma.wishlistItem.deleteMany({ where: { userId: id } });

        // 3. Delete cart items
        await prisma.cartItem.deleteMany({ where: { userId: id } });

        // 4. Delete reviews
        await prisma.review.deleteMany({ where: { userId: id } });

        // 5. Delete payments
        await prisma.payment.deleteMany({ where: { userId: id } });

        // 6. Nullify gift cards redeemed by this user to avoid constraint error
        await prisma.giftCard.updateMany({
            where: { redeemedById: id },
            data: { redeemedById: null, status: 'Active', redeemedAt: null }
        });

        // 7. Delete order items and logistics orders linked to customer orders
        const userOrders = await prisma.customerOrder.findMany({ where: { userId: id } });
        const orderIds = userOrders.map(o => o.id);

        await prisma.orderItem.deleteMany({
            where: { customerOrderId: { in: orderIds } }
        });

        await prisma.order.deleteMany({
            where: { customerOrderId: { in: orderIds } }
        });

        await prisma.customerOrder.deleteMany({ where: { userId: id } });

        // 8. Delete user profile
        await prisma.user.delete({
            where: { id }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// GET /api/users/:userId
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, profilePicture: true, phone: true, address: true, regionId: true, contactInfo: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            ...user,
            phone: decrypt(user.phone),
            address: decrypt(user.address),
            contactInfo: decrypt(user.contactInfo)
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/:userId
router.put('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
        }
        const { name, phone, address, regionId, contactInfo } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                name, 
                phone: phone ? encrypt(phone) : undefined, 
                address: address ? encrypt(address) : undefined,
                regionId: regionId !== undefined ? regionId : undefined,
                contactInfo: contactInfo ? encrypt(contactInfo) : undefined
            },
            select: { id: true, name: true, email: true, role: true, profilePicture: true, phone: true, address: true, regionId: true, contactInfo: true }
        });
        
        res.json({ 
            message: 'Profile updated successfully', 
            user: {
                ...updatedUser,
                phone: decrypt(updatedUser.phone),
                address: decrypt(updatedUser.address),
                contactInfo: decrypt(updatedUser.contactInfo)
            }
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/users/:userId/profile-picture
router.post('/:userId/profile-picture', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile picture.' });
        }
        const { profilePicture } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profilePicture },
            select: { id: true, name: true, profilePicture: true }
        });
        
        res.json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (err) {
        console.error("Error updating profile picture:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/user/activity/:userId
router.get('/activity/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only access your own activities.' });
        }
        const activities = await prisma.userActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(activities);
    } catch (err) {
        console.error("Error fetching activity:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/user/activity
router.post('/activity', verifyToken, async (req, res) => {
    try {
        const { userId, action, details } = req.body;
        if (!userId || !action) return res.status(400).json({ message: 'Missing fields' });
        
        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only log activities for yourself.' });
        }

        const activity = await prisma.userActivity.create({
            data: { userId, action, details }
        });
        res.status(201).json(activity);
    } catch (err) {
        console.error("Error logging activity:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/users/redeem-points
router.post('/redeem-points', verifyToken, async (req, res) => {
    try {
        const { userId, pointsToDeduct, rewardTitle } = req.body;
        if (!userId || !pointsToDeduct || !rewardTitle) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        if (req.user.id !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. You can only redeem points for yourself.' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.ecoPoints < pointsToDeduct) {
            return res.status(400).json({ message: 'Insufficient Eco-Points balance.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { ecoPoints: { decrement: parseInt(pointsToDeduct) } },
            select: { id: true, ecoPoints: true }
        });

        // Log the activity
        await prisma.userActivity.create({
            data: {
                userId,
                action: 'Redeemed Reward',
                details: `Redeemed ${pointsToDeduct} Eco-Points for: "${rewardTitle}"`
            }
        });

        res.json({
            message: 'Points redeemed successfully!',
            ecoPoints: updatedUser.ecoPoints
        });
    } catch (err) {
        console.error("Error redeeming points:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;