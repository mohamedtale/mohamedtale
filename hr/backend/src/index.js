require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { initDB, initAdminUser } = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost', 'http://localhost:80', 'http://localhost:8080',
           'http://localhost:3002', 'http://127.0.0.1', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'HR Management API' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/reports', require('./routes/reports'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n👥 HR Management API Server`);
  console.log(`✅ Running on port ${PORT}`);
  setTimeout(async () => {
    try {
      await initDB();
      await initAdminUser();
    } catch (err) {
      console.error('❌ DB init error:', err.message);
    }
  }, 3000);
});

module.exports = app;
