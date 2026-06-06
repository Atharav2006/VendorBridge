const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/rfq', require('./routes/rfqRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/po', require('./routes/poRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/', (req, res) => {
  res.send('VendorBridge API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
