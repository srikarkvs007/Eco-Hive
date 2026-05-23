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

const http = require('http');
const { Server } = require('socket.io');
const activeDeliveries = require('./trackingStore');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

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