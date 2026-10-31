const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies across origins
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Smart Lab Reservation API' });
});

// Layered REST API routes under /api/v1 (SAD Section 5)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/reservations', reservationRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
