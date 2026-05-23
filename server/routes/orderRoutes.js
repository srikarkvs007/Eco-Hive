const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { GoogleGenAI } = require('@google/genai');
const activeDeliveries = require('../trackingStore');

const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from environment

router.post('/scan', async (req, res) => {
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

router.post('/add', async (req, res) => {
    try {
        const { pickupLocation, dropLocation, packageType, weight, sensitivity, isPremium, customerOrderId } = req.body;
        
        let deliveryMode = 'Van';
        let assignedDrones = 0;
        let extraFee = 0.0;
        const parsedWeight = parseFloat(weight) || 0;

        // Smart Routing Algorithm
        if (sensitivity === 'Fragile' || sensitivity === 'Hazardous') {
            deliveryMode = 'Van';
            if (isPremium) {
                // Cannot override Hazardous/Fragile with Drone Swarm due to safety constraints
                // Wait, maybe we allow it for Fragile, but not Hazardous. Let's just say Van.
            }
        } else if (parsedWeight <= 5) {
            deliveryMode = 'Drone';
            assignedDrones = 1;
        } else {
            // Weight > 5
            if (isPremium) {
                deliveryMode = 'Drone Swarm';
                assignedDrones = Math.ceil(parsedWeight / 5);
                // First drone is standard, extra drones cost $10 each
                extraFee = (assignedDrones - 1) * 10;
            } else {
                deliveryMode = 'Van';
            }
        }

        const newOrder = await prisma.order.create({
            data: {
                pickupLocation,
                dropLocation,
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

        // Initialize Live Tracking coordinates at the Dispatch Hub (e.g. Paris center)
        activeDeliveries.set(newOrder.id, {
            id: newOrder.id,
            mode: deliveryMode,
            isPremium: Boolean(isPremium),
            drones: assignedDrones,
            lat: 48.8566 + (Math.random() * 0.02 - 0.01), // Slight random offset
            lng: 2.3522 + (Math.random() * 0.02 - 0.01),
            pickup: pickupLocation,
            drop: dropLocation
        });

        res.json({ message: 'Order Added', order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/all', async (req, res) => {
    try {
        const orders = await prisma.order.findMany();
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/updateStatus/:id', async (req, res) => {
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
            } else if (status === 'In Transit') {
                await prisma.customerOrder.update({
                    where: { id: updatedOrder.customerOrderId },
                    data: { status: 'Shipped' }
                });
            }
        }

        // If the order is delivered or cancelled, remove it from the live tracking map
        if (status === 'Delivered' || status === 'Cancelled') {
            activeDeliveries.delete(updatedOrder.id);
        }

        res.json({ message: 'Order status updated', order: updatedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
