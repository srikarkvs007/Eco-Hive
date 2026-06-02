const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken } = require('../middleware/auth');

// 1. Get Eco One Entertainment Content
// GET /api/entertainment/eco-one
router.get('/eco-one', verifyToken, async (req, res) => {
    try {
        const content = await prisma.entertainmentContent.findMany({
            orderBy: { releaseYear: 'desc' }
        });
        res.json(content);
    } catch (err) {
        console.error('Error fetching Eco One content:', err);
        res.status(500).json({ message: 'Server error fetching Eco One shows' });
    }
});

// 2. Get Podcast Episodes
// GET /api/entertainment/podcasts
router.get('/podcasts', verifyToken, async (req, res) => {
    try {
        const episodes = await prisma.podcastEpisode.findMany({
            orderBy: { publishDate: 'desc' }
        });
        res.json(episodes);
    } catch (err) {
        console.error('Error fetching podcast episodes:', err);
        res.status(500).json({ message: 'Server error fetching podcasts' });
    }
});

module.exports = router;
