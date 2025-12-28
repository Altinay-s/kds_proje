const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dashboardRoutes = require('./routes/dashboardRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes

app.use('/api', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);

// Main Endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
