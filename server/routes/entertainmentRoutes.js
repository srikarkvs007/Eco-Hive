const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

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

// Add Eco One Content (Admin only)
// POST /api/entertainment/eco-one
router.post('/eco-one', verifyAdmin, async (req, res) => {
    try {
        const { title, type, category, description, duration, rating, imageUrl, videoUrl, isFeatured, releaseYear } = req.body;
        const newContent = await prisma.entertainmentContent.create({
            data: {
                title,
                type,
                category,
                description,
                duration,
                rating,
                imageUrl,
                videoUrl,
                isFeatured: isFeatured === true || isFeatured === 'true',
                releaseYear: parseInt(releaseYear)
            }
        });
        res.status(201).json(newContent);
    } catch (err) {
        console.error('Error adding Eco One content:', err);
        res.status(500).json({ message: 'Server error adding Eco One content' });
    }
});

// Delete Eco One Content (Admin only)
// DELETE /api/entertainment/eco-one/:id
router.delete('/eco-one/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.entertainmentContent.delete({
            where: { id }
        });
        res.json({ message: 'Eco-TV content deleted successfully' });
    } catch (err) {
        console.error('Error deleting Eco One content:', err);
        res.status(500).json({ message: 'Server error deleting Eco One content' });
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

// Add Podcast Episode (Admin only)
// POST /api/entertainment/podcasts
router.post('/podcasts', verifyAdmin, async (req, res) => {
    try {
        const { title, podcastName, description, duration, audioUrl, imageUrl, host } = req.body;
        const newEpisode = await prisma.podcastEpisode.create({
            data: {
                title,
                podcastName,
                description,
                duration,
                audioUrl,
                imageUrl,
                host,
                publishDate: new Date()
            }
        });
        res.status(201).json(newEpisode);
    } catch (err) {
        console.error('Error adding podcast episode:', err);
        res.status(500).json({ message: 'Server error adding podcast episode' });
    }
});

// Delete Podcast Episode (Admin only)
// DELETE /api/entertainment/podcasts/:id
router.delete('/podcasts/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.podcastEpisode.delete({
            where: { id }
        });
        res.json({ message: 'Podcast episode deleted successfully' });
    } catch (err) {
        console.error('Error deleting podcast episode:', err);
        res.status(500).json({ message: 'Server error deleting podcast episode' });
    }
});

module.exports = router;
