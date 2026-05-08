const express = require('express');

const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res) => {
    res.send("Backend Running with Neon & Prisma");
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

app.listen(5001, () => {

    console.log("Server Running on Port 5001");

});