require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const poRoutes = require('./routes/poRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const logRoutes = require('./routes/logRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);

// Fix for nested RFQ quotation route from contract
app.use('/api/rfqs/:rfqId/quotations', quotationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: true, 
    message: err.message || 'Something went wrong!', 
    code: 'SERVER_ERROR' 
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Route not found', code: 'NOT_FOUND' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
