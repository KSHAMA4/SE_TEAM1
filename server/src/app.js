const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ==========================================
// General Middleware
// ==========================================

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ==========================================
// Issue #21 - API Rate Limiting
// ==========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,               // Maximum 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the API request limit. Please try again later.',
  },
});

app.use('/api/v1', apiLimiter);

// ==========================================
// Health Check
// ==========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Smart Lab Reservation API',
  });
});

// ==========================================
// REST API Routes
// ==========================================

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/users', userRoutes);

// ==========================================
// Global Error Handler
// ==========================================

app.use(errorHandler);

module.exports = app;