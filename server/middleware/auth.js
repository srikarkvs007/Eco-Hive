const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded; // Contains user id (e.g. { id: "..." })
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, async () => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }
            });

            if (!user || user.role !== 'Admin') {
                return res.status(403).json({ message: 'Access denied. Admins only.' });
            }

            req.admin = user; // Set admin info on request
            next();
        } catch (err) {
            console.error("Admin verification error:", err);
            res.status(500).json({ message: 'Server error during authentication.' });
        }
    });
};

module.exports = {
    verifyToken,
    verifyAdmin
};
