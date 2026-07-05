const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/emailService');

// Request history for send-otp rate limiting (userId -> Array of timestamps)
const sendOtpRequestHistory = new Map();

/**
 * POST /api/auth/send-otp
 * Generates a secure random 6-digit numeric OTP only on the backend.
 * Hashes it using bcrypt, saves it to database, and sends to the authenticated user's registered email.
 */
router.post('/send-otp', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Rate limiting send-otp: limit to 5 requests per 5 minutes per user
        const now = Date.now();
        const windowMs = 5 * 60 * 1000;
        if (!sendOtpRequestHistory.has(userId)) {
            sendOtpRequestHistory.set(userId, []);
        }
        const timestamps = sendOtpRequestHistory.get(userId).filter(t => now - t < windowMs);
        timestamps.push(now);
        sendOtpRequestHistory.set(userId, timestamps);
        if (timestamps.length > 5) {
            return res.status(429).json({ success: false, message: "Too many verification requests. Please wait before requesting a new code." });
        }

        // Fetch user to get registered email
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate secure 6-digit OTP code (e.g. "123456")
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        
        // Hash the OTP
        const hashedOtp = await bcrypt.hash(otpCode, 10);
        
        // Set expiry time (5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Invalidate/delete any previous OTP records for this user to prevent brute-force/replay
        await prisma.otp.deleteMany({
            where: { userId }
        });

        // Save OTP record to database
        await prisma.otp.create({
            data: {
                userId,
                email: user.email,
                hashedOtp,
                expiresAt,
                attempts: 0,
                verified: false
            }
        });

        // Send Email using dynamic provider system
        await sendOtpEmail(user.email, user.name, otpCode);

        // Never expose OTP to the frontend, never log OTP in production
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV ONLY] OTP code generated for ${user.email}: ${otpCode}`);
        }

        res.json({
            success: true,
            message: "Verification code sent."
        });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ success: false, message: "Failed to send verification code." });
    }
});

/**
 * POST /api/auth/verify-otp
 * Verifies code matching, validity period (expires in 5 mins), max attempts (5), and invalidates on success.
 */
router.post('/verify-otp', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { otp } = req.body;

        if (!otp || otp.length !== 6 || isNaN(otp)) {
            return res.json({ success: false, message: "Invalid or expired verification code." });
        }

        // Fetch latest OTP record for this user
        const otpRecord = await prisma.otp.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return res.json({ success: false, message: "Invalid or expired verification code." });
        }

        // Check if OTP is expired, already used/verified, or exceeded attempts limit
        const isExpired = new Date() > otpRecord.expiresAt;
        if (isExpired || otpRecord.verified || otpRecord.attempts >= 5) {
            return res.json({ success: false, message: "Invalid or expired verification code." });
        }

        // Verify OTP hash
        const isMatch = await bcrypt.compare(otp, otpRecord.hashedOtp);
        if (!isMatch) {
            // Increment verification attempts
            const updatedAttempts = otpRecord.attempts + 1;
            await prisma.otp.update({
                where: { id: otpRecord.id },
                data: { attempts: updatedAttempts }
            });

            if (updatedAttempts >= 5) {
                // Instantly invalidate if limit reached
                await prisma.otp.update({
                    where: { id: otpRecord.id },
                    data: { expiresAt: new Date(0) } // Set expiry to epoch
                });
            }

            return res.json({ success: false, message: "Invalid or expired verification code." });
        }

        // Success: Mark the OTP as verified/used to prevent replay attacks
        await prisma.otp.update({
            where: { id: otpRecord.id },
            data: { verified: true }
        });

        // Clean up: Optional, but we keep it updated since verified status is stored.
        // We delete all used OTPs to clean up the DB
        await prisma.otp.deleteMany({
            where: { userId, verified: true }
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ success: false, message: "Verification failed." });
    }
});

module.exports = router;
