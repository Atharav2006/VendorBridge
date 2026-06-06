const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const RFQ = require('./models/RFQ');
const Quotation = require('./models/Quotation');
const PurchaseOrder = require('./models/PurchaseOrder');
const AuditLog = require('./models/AuditLog');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Vendor.deleteMany();
    await RFQ.deleteMany();
    await Quotation.deleteMany();
    await PurchaseOrder.deleteMany();
    await AuditLog.deleteMany();

    // 1. Users
    const userData = [
      { username: 'admin', email: 'admin@vendorbridge.com', password: 'password123', role: 'Admin' },
      { username: 'manager', email: 'manager@vendorbridge.com', password: 'password123', role: 'Manager' },
      { username: 'purchaser', email: 'purchaser@vendorbridge.com', password: 'password123', role: 'Purchaser' },
      { username: 'vendor1', email: 'sales@steelmetals.com', password: 'password123', role: 'Vendor' },
      { username: 'vendor2', email: 'contact@techsupplies.com', password: 'password123', role: 'Vendor' }
    ];
    
    const users = [];
    for (const u of userData) {
      const createdUser = await User.create(u);
      users.push(createdUser);
    }
    const adminId = users[0]._id;
    const purchaserId = users[2]._id;

    // 2. Vendors
    const vendors = await Vendor.insertMany([
      { name: 'Steel Metals Ltd.', email: 'sales@steelmetals.com', phone: '+91 98765 43210', category: 'Raw Materials', city: 'Mumbai', country: 'India', status: 'Active', rating: 4.8 },
      { name: 'Tech Supplies Co.', email: 'contact@techsupplies.com', phone: '+1 555 123 4567', category: 'IT Hardware', city: 'New York', country: 'USA', status: 'Active', rating: 4.5 },
      { name: 'Global Logistics', email: 'info@globallogistics.com', phone: '+44 20 7946 0958', category: 'Logistics', city: 'London', country: 'UK', status: 'Pending', rating: 0 }
    ]);

    // 3. RFQs
    const rfq1 = await RFQ.create({
      title: 'Procurement of Server Racks',
      description: 'Need 10 units of 42U Server Racks for the new datacenter.',
      rfqNumber: 'RFQ-2026-8012',
      priority: 'High',
      department: 'IT Infrastructure',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      rfqItems: [{ description: '42U Server Rack', unit: 'Pieces', quantity: 10, estimatedUnitPrice: 500 }],
      assignedVendors: [vendors[1]._id],
      createdBy: purchaserId,
      status: 'Active'
    });

    const rfq2 = await RFQ.create({
      title: 'Raw Steel Procurement',
      description: '500 Tons of high-grade steel for Q3 manufacturing.',
      rfqNumber: 'RFQ-2026-9055',
      priority: 'Urgent',
      department: 'Manufacturing',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (Closed)
      rfqItems: [{ description: 'High Grade Steel', unit: 'Tons', quantity: 500, estimatedUnitPrice: 1000 }],
      assignedVendors: [vendors[0]._id],
      createdBy: purchaserId,
      status: 'Closed'
    });

    // 4. Quotations
    const quote1 = await Quotation.create({
      rfqId: rfq2._id,
      vendorId: vendors[0]._id,
      quotationId: 'QT-2026-11223',
      quotationItems: [{ description: 'High Grade Steel', unit: 'Tons', quantity: 500, unitPrice: 980, lineTotal: 490000 }],
      taxSummary: { gstPercentage: 18, gstAmount: 88200 },
      grandTotal: 578200,
      status: 'Selected'
    });

    // 5. Purchase Order
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-5501',
      rfqId: rfq2._id,
      quotationId: quote1._id,
      vendorDetails: { name: vendors[0].name, email: vendors[0].email },
      invoiceItems: [{ description: 'High Grade Steel (500 Tons)', qty: 1, unitPrice: 490000, total: 490000 }],
      taxSummary: { subtotal: 490000, taxRate: 18, taxAmount: 88200, grandTotal: 578200 },
      invoiceStatus: 'Sent',
      paymentStatus: 'Unpaid'
    });

    // 6. Audit Logs
    await AuditLog.insertMany([
      { user: purchaserId, action: 'Created RFQ', entityType: 'RFQ', entityId: rfq1._id, details: 'Created RFQ for Server Racks' },
      { user: adminId, action: 'Approved Quotation', entityType: 'Quotation', entityId: quote1._id, details: 'Approved Steel Quotation QT-2026-11223' },
      { user: purchaserId, action: 'Generated PO', entityType: 'PurchaseOrder', entityId: po1._id, details: 'Generated PO-2026-5501 for Steel Metals Ltd.' }
    ]);

    console.log('Comprehensive Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
