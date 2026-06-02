const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { GoogleGenAI } = require('@google/genai');
const activeDeliveries = require('../trackingStore');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from environment

router.post('/scan', verifyAdmin, async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
        }

        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `
You are a highly accurate shipping label OCR AI. Extract the details from the provided shipping label image.
Return the result STRICTLY as a JSON object with no markdown formatting or extra text.
The JSON object must have these exact keys:
- "pickupLocation": string (The pickup location or address)
- "dropLocation": string (The drop/destination location or address)
- "packageType": string (The type of package or contents)
- "weight": float (The weight in kg. If in lbs, convert to kg by multiplying by 0.453592. If no number, return 0)
- "sensitivity": string (Must be exactly "Standard", "Fragile", or "Hazardous")

Example response:
{
  "pickupLocation": "France",
  "dropLocation": "Paris",
  "packageType": "Plastic chair",
  "weight": 3.0,
  "sensitivity": "Standard"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: 'image/jpeg'
                    }
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text;
        res.json(JSON.parse(jsonText));

    } catch (err) {
        console.error("Gemini OCR Error:", err);
        res.status(500).json({ error: 'Failed to scan image using AI' });
    }
});

router.post('/add', verifyAdmin, async (req, res) => {
    try {
        const { pickupLocation, dropLocation, packageType, weight, sensitivity, isPremium, customerOrderId } = req.body;
        
        let deliveryMode = 'Van';
        let assignedDrones = 0;
        let extraFee = 0.0;
        const parsedWeight = parseFloat(weight) || 0;

        // Smart Routing Algorithm
        if (sensitivity === 'Fragile' || sensitivity === 'Hazardous') {
            deliveryMode = 'Van';
        } else if (parsedWeight <= 5) {
            deliveryMode = 'Drone';
            assignedDrones = 1;
        } else {
            if (isPremium) {
                deliveryMode = 'Drone Swarm';
                assignedDrones = Math.ceil(parsedWeight / 5);
                extraFee = (assignedDrones - 1) * 10;
            } else {
                deliveryMode = 'Van';
            }
        }

        const newOrder = await prisma.order.create({
            data: {
                pickupLocation: encrypt(pickupLocation),
                dropLocation: encrypt(dropLocation),
                packageType,
                weight: parsedWeight,
                sensitivity: sensitivity || 'Standard',
                isPremium: Boolean(isPremium),
                extraFee,
                assignedDrones,
                deliveryMode,
                customerOrderId: customerOrderId || null
            }
        });

        // Initialize Live Tracking coordinates at the Dispatch Hub
        activeDeliveries.set(newOrder.id, {
            id: newOrder.id,
            mode: deliveryMode,
            isPremium: Boolean(isPremium),
            drones: assignedDrones,
            lat: 48.8566 + (Math.random() * 0.02 - 0.01),
            lng: 2.3522 + (Math.random() * 0.02 - 0.01),
            pickup: pickupLocation,
            drop: dropLocation
        });

        res.json({ 
            message: 'Order Added', 
            order: {
                ...newOrder,
                pickupLocation: decrypt(newOrder.pickupLocation),
                dropLocation: decrypt(newOrder.dropLocation)
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const admin = req.admin;
        let orders = await prisma.order.findMany({
            include: {
                customerOrder: true
            }
        });

        if (admin) {
            const adminRegion = admin.regionId;
            if (adminRegion) {
                orders = orders.filter(o => 
                    o.customerOrder?.regionId === adminRegion ||
                    o.customerOrder?.assignedAdminId === admin.id
                );
            } else if (admin.address) {
                const localAddress = admin.address.trim().toLowerCase();
                orders = orders.filter(o => {
                    const plainPickup = decrypt(o.pickupLocation).trim().toLowerCase();
                    return plainPickup.includes(localAddress) || localAddress.includes(plainPickup);
                });
            } else {
                orders = [];
            }
        }

        // Decrypt locations
        const decryptedOrders = orders.map(o => ({
            ...o,
            pickupLocation: decrypt(o.pickupLocation),
            dropLocation: decrypt(o.dropLocation)
        }));

        res.json(decryptedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/updateStatus/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await prisma.order.update({
            where: { id: id },
            data: { status }
        });

        // Sync back to CustomerOrder if this logistics order belongs to an e-commerce purchase
        if (updatedOrder.customerOrderId) {
            if (status === 'Delivered') {
                await prisma.customerOrder.update({
                    where: { id: updatedOrder.customerOrderId },
                    data: { status: 'Delivered' }
                });
            } else if (status === 'In Transit' || status === 'Dispatched') {
                await prisma.customerOrder.update({
                    where: { id: updatedOrder.customerOrderId },
                    data: { status: 'Dispatched' }
                });
            }

            // Emit socket event to notify client in real-time
            const io = req.app.get('io');
            if (io) {
                const mappedStatus = (status === 'In Transit' || status === 'Dispatched') ? 'Dispatched' : status;
                io.emit('order_status_updated', {
                    orderId: updatedOrder.customerOrderId,
                    logisticsOrderId: updatedOrder.id,
                    status: mappedStatus
                });
            }
        }

        // If the order is delivered or cancelled, remove it from the live tracking map
        if (status === 'Delivered' || status === 'Cancelled') {
            activeDeliveries.delete(updatedOrder.id);
        }

        res.json({ 
            message: 'Order status updated', 
            order: {
                ...updatedOrder,
                pickupLocation: decrypt(updatedOrder.pickupLocation),
                dropLocation: decrypt(updatedOrder.dropLocation)
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
