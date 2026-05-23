const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req,res) => {
    try {
        const { name, email, password, role } = req.body;

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
                role: role || 'User'
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

        res.json({ token, message: 'Login Success', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/user/activity/:userId
router.get('/activity/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
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
router.post('/activity', async (req, res) => {
    try {
        const { userId, action, details } = req.body;
        if (!userId || !action) return res.status(400).json({ message: 'Missing fields' });
        
        const activity = await prisma.userActivity.create({
            data: { userId, action, details }
        });
        res.status(201).json(activity);
    } catch (err) {
        console.error("Error logging activity:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;