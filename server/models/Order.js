const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    pickupLocation: String,
    dropLocation: String,
    packageType: String,
    deliveryMode: String,
    status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Order', OrderSchema);
