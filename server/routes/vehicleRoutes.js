const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

router.post('/add', async (req, res) => {
    try {
        const newVehicle = await prisma.vehicle.create({
            data: {
                vehicleNumber: req.body.vehicleNumber,
                driverName: req.body.driverName,
                vehicleType: req.body.vehicleType,
            }
        });
        res.json({ message: 'Vehicle Added', vehicle: newVehicle });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
