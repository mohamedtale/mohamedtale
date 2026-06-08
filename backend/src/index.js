require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const wellsRoutes = require('./routes/wells');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
const workflowsRoutes = require('./routes/workflows');
const logsRoutes = require('./routes/logs');
const { initUsers } = require('./db/init-users');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Water Wells Management API' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wells', wellsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/logs', logsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', message_ar: 'المسار غير موجود' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message_ar: 'خطأ داخلي في الخادم' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n🚰 Water Wells Management API Server`);
  console.log(`✅ Running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health\n`);

  // Ensure demo users have correct bcryptjs password hashes
  try {
    await initUsers();
  } catch (err) {
    console.error('Warning: Could not initialize demo users:', err.message);
  }
});

module.exports = app;
