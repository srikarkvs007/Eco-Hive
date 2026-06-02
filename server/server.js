const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Stripe webhook MUST be parsed as raw body for signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req,res) => {
    res.send("Backend Running with Neon & Prisma");
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/customer-orders', require('./routes/customerOrderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/v1', require('./routes/apiV1'));
app.use('/api/gift-cards', require('./routes/giftCardRoutes'));
app.use('/api/entertainment', require('./routes/entertainmentRoutes'));


const http = require('http');
const { Server } = require('socket.io');
const activeDeliveries = require('./trackingStore');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A client connected to Live Tracking:', socket.id);
    
    // Immediately send current state on connection
    socket.emit('live_locations', Array.from(activeDeliveries.values()));

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Real-time Drone/Van Movement Simulation Loop
setInterval(() => {
    if (activeDeliveries.size > 0) {
        activeDeliveries.forEach((delivery, id) => {
            // Simulate smooth movement
            const speedModifier = delivery.mode && delivery.mode.includes('Drone') ? 0.001 : 0.0003;
            
            delivery.lat += (Math.random() - 0.3) * speedModifier; 
            delivery.lng += (Math.random() - 0.3) * speedModifier; 
        });

        // Broadcast to all connected tracking dashboards
        io.emit('live_locations', Array.from(activeDeliveries.values()));
    }
}, 2000); // Broadcast every 2 seconds

const prisma = require('./prismaClient');

server.listen(5001, async () => {
    console.log("Server Running on Port 5001 with Real-time Tracking");

    try {
        // Seeding Entertainment Content
        const contentCount = await prisma.entertainmentContent.count();
        if (contentCount === 0) {
            console.log("Seeding Entertainment Content...");
            await prisma.entertainmentContent.createMany({
                data: [
                    {
                        title: "Our Fragile Blue Planet",
                        type: "Documentary",
                        category: "Nature & Oceans",
                        description: "An awe-inspiring cinematic journey documenting the delicate ecosystems of deep oceans and coral reefs under threat from warming climates.",
                        duration: "1h 45m",
                        rating: "G",
                        imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&q=80&fit=crop",
                        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-underwater-shots-of-marine-life-and-corals-40070-large.mp4",
                        isFeatured: true,
                        releaseYear: 2025
                    },
                    {
                        title: "Eco-Tech: Building Tomorrow",
                        type: "Show",
                        category: "Technology",
                        description: "Follow leading engineers and designers as they develop revolutionary solar systems, fusion battery cells, and autonomous carbon-negative logistics.",
                        duration: "8 Episodes",
                        rating: "PG",
                        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80&fit=crop",
                        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wind-turbines-generating-electricity-in-a-green-field-42407-large.mp4",
                        isFeatured: true,
                        releaseYear: 2026
                    },
                    {
                        title: "Zero Waste Frontiers",
                        type: "Documentary",
                        category: "Lifestyle",
                        description: "Explore the daily lives of urban pioneers living entirely waste-free, sharing techniques on composting, closed-loop recycling, and minimal carbon footprints.",
                        duration: "52m",
                        rating: "G",
                        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80&fit=crop",
                        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-composting-organic-materials-in-a-garden-39904-large.mp4",
                        isFeatured: false,
                        releaseYear: 2024
                    },
                    {
                        title: "The Air We Breathe",
                        type: "Show",
                        category: "Climate Science",
                        description: "Scientists track global atmospheric currents using satellite imagery and particulate tracking to outline real-time effects of forestation programs.",
                        duration: "6 Episodes",
                        rating: "PG-13",
                        imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80&fit=crop",
                        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-time-lapse-470-large.mp4",
                        isFeatured: false,
                        releaseYear: 2025
                    }
                ]
            });
            console.log("Seeding Entertainment Content complete.");
        }

        // Seeding Podcast Episodes
        const podcastCount = await prisma.podcastEpisode.count();
        if (podcastCount === 0) {
            console.log("Seeding Podcast Episodes...");
            await prisma.podcastEpisode.createMany({
                data: [
                    {
                        title: "Episode 142: Smart Energy Storage & Battery Walls",
                        podcastName: "Green Tech Future",
                        description: "In this episode, we sit down with battery engineer Alice Vance to discuss local grid storage, home battery walls, and net-metering schemes.",
                        duration: "42:15",
                        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80&fit=crop",
                        host: "David Atten",
                        publishDate: new Date("2026-05-15")
                    },
                    {
                        title: "Episode 89: Ocean Plastics & Circular Shredding",
                        podcastName: "Zero-Waste Pioneers",
                        description: "Discover how community recycling workshops shred raw ocean plastics to inject mold custom sustainable household tools.",
                        duration: "34:50",
                        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                        imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&q=80&fit=crop",
                        host: "Sarah Green",
                        publishDate: new Date("2026-05-20")
                    },
                    {
                        title: "Episode 211: Permaculture & Organic Composting",
                        podcastName: "Earth Talk",
                        description: "Learn easy tips for setting up indoor worm compost farms, cultivating bio-dynamic garden beds, and eliminating food waste entirely.",
                        duration: "48:10",
                        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                        imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&q=80&fit=crop",
                        host: "Alice Waters",
                        publishDate: new Date("2026-05-28")
                    },
                    {
                        title: "Episode 54: The Economics of Carbon Markets",
                        podcastName: "Climate Science Explained",
                        description: "Breaking down how international carbon credit taxation functions, and its direct impact on small businesses sourcing plastic-free supplies.",
                        duration: "55:00",
                        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80&fit=crop",
                        host: "Dr. Robert Fox",
                        publishDate: new Date("2026-06-01")
                    }
                ]
            });
            console.log("Seeding Podcast Episodes complete.");
        }

        // Load existing pending orders so they appear on the map after a server restart
        const pendingOrders = await prisma.order.findMany({
            where: { status: 'Pending' }
        });

        pendingOrders.forEach(order => {
            activeDeliveries.set(order.id, {
                id: order.id,
                customerOrderId: order.customerOrderId,
                mode: order.deliveryMode,
                isPremium: order.isPremium,
                drones: order.assignedDrones,
                lat: 48.8566 + (Math.random() * 0.02 - 0.01),
                lng: 2.3522 + (Math.random() * 0.02 - 0.01),
                pickup: order.pickupLocation,
                drop: order.dropLocation
            });
        });
        console.log(`Loaded ${pendingOrders.length} pending orders into the Live Tracking Map.`);
    } catch (err) {
        console.error("Failed to load pending orders for tracking:", err);
    }
});