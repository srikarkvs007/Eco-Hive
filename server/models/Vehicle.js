const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vehicleNumber: String,
    driverName: String,
    vehicleType: String
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
