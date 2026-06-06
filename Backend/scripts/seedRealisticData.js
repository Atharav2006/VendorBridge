const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const Approval = require('../models/Approval');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const ActivityLog = require('../models/ActivityLog');

require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vendorbridge';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Vendor.deleteMany({});
    await RFQ.deleteMany({});
    await Quotation.deleteMany({});
    await Approval.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Invoice.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Creating Users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);

    const admin = await User.create({ name: 'System Admin', email: 'admin@vendorbridge.com', password: passwordHash, role: 'admin' });
    const officer = await User.create({ name: 'Procurement Officer', email: 'officer@vendorbridge.com', password: passwordHash, role: 'procurement_officer' });
    const manager = await User.create({ name: 'Finance Manager', email: 'manager@vendorbridge.com', password: passwordHash, role: 'manager' });
    const vendorUser = await User.create({ name: 'Acme Vendor', email: 'vendor@vendorbridge.com', password: passwordHash, role: 'vendor' });

    console.log('Creating Vendor Profiles...');
    const acmeVendor = await Vendor.create({
      name: 'Acme Corp Industrial',
      category: 'Hardware & Machinery',
      gst: '27AACCA1234F1Z1',
      contactPerson: 'Wile E. Coyote',
      email: 'vendor@vendorbridge.com',
      phone: '+1 800 555 0199',
      address: '123 Desert Road, Canyonville, AZ',
      status: 'Active',
      rating: 4.8,
      linkedUserId: vendorUser._id,
      profile: {
        description: 'Leading provider of industrial machinery and hardware tools.',
        founded: '1995',
        website: 'www.acmecorp.com',
        address: '123 Desert Road, Canyonville, AZ'
      }
    });

    const techVendor = await Vendor.create({
      name: 'Global Tech Solutions',
      category: 'IT Hardware',
      gst: '07AAACA1234F1Z1',
      contactPerson: 'Jane Doe',
      email: 'sales@globaltech.com',
      phone: '+1 800 555 0200',
      address: '456 Silicon Valley, CA',
      status: 'Active',
      rating: 4.5,
      linkedUserId: null,
      profile: {
        description: 'Specialists in enterprise IT infrastructure and networking equipment.',
        founded: '2010',
        website: 'www.globaltech.com',
        address: '456 Silicon Valley, CA'
      }
    });

    console.log('Creating RFQs...');
    const rfq1 = await RFQ.create({
      title: 'Supply of Industrial Drill Presses',
      description: 'Require 5 heavy-duty drill presses for the new assembly plant.',
      items: [{ name: 'Heavy Duty Drill Press', quantity: 5, unit: 'pcs' }],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedVendorIds: [acmeVendor._id, techVendor._id],
      status: 'Open',
      createdBy: officer._id
    });

    const rfq2 = await RFQ.create({
      title: 'Q3 Enterprise Laptop Refresh',
      description: 'Procurement of 50 business-class laptops.',
      items: [{ name: 'Business Laptops (i7, 32GB RAM)', quantity: 50, unit: 'pcs' }],
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      assignedVendorIds: [acmeVendor._id, techVendor._id],
      status: 'Closed',
      createdBy: officer._id
    });

    console.log('Creating Quotations...');
    const quote1 = await Quotation.create({
      rfqId: rfq1._id,
      vendorId: acmeVendor._id,
      items: [{ name: 'Heavy Duty Drill Press', quantity: 5, unitPrice: 2500, totalPrice: 12500 }],
      subtotal: 12500,
      taxPercent: 10,
      taxAmount: 1250,
      grandTotal: 13750,
      deliveryDays: 14,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Pending'
    });

    const quote2 = await Quotation.create({
      rfqId: rfq2._id,
      vendorId: techVendor._id,
      items: [{ name: 'Business Laptops (i7, 32GB RAM)', quantity: 50, unitPrice: 1200, totalPrice: 60000 }],
      subtotal: 60000,
      taxPercent: 10,
      taxAmount: 6000,
      grandTotal: 66000,
      deliveryDays: 7,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Approved'
    });

    console.log('Creating Approvals...');
    const approval1 = await Approval.create({
      rfqId: rfq2._id,
      quotationId: quote2._id,
      requestedBy: officer._id,
      status: 'Approved',
      remarks: 'Approved by Finance Director.',
      actionBy: manager._id,
      actionAt: new Date()
    });

    const approval2 = await Approval.create({
      rfqId: rfq1._id,
      quotationId: quote1._id,
      requestedBy: officer._id,
      status: 'Pending',
      remarks: ''
    });

    console.log('Creating Purchase Orders...');
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0001',
      rfqId: rfq2._id,
      quotationId: quote2._id,
      vendorId: techVendor._id,
      items: [{ name: 'Business Laptops (i7, 32GB RAM)', quantity: 50, unitPrice: 1200, totalPrice: 60000 }],
      subtotal: 60000,
      taxPercent: 10,
      taxAmount: 6000,
      grandTotal: 66000,
      status: 'Pending',
      createdBy: officer._id,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const po2 = await PurchaseOrder.create({
      poNumber: 'PO-2026-0002',
      rfqId: rfq1._id,
      quotationId: quote1._id,
      vendorId: acmeVendor._id,
      items: [{ name: 'Heavy Duty Drill Press', quantity: 5, unitPrice: 2500, totalPrice: 12500 }],
      subtotal: 12500,
      taxPercent: 10,
      taxAmount: 1250,
      grandTotal: 13750,
      status: 'Completed',
      createdBy: officer._id,
      deliveryDate: new Date()
    });

    console.log('Creating Invoices...');
    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-2026-0001',
      purchaseOrderId: po2._id,
      vendorId: acmeVendor._id,
      items: [{ name: 'Heavy Duty Drill Press', quantity: 5, unitPrice: 2500, totalPrice: 12500 }],
      subtotal: 12500,
      taxPercent: 10,
      taxAmount: 1250,
      grandTotal: 13750,
      status: 'Paid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billingDetails: {
        companyName: 'Acme Corp Industrial',
        address: '123 Desert Road, Canyonville, AZ',
        gst: '27AACCA1234F1Z1'
      }
    });

    const invoice2 = await Invoice.create({
      invoiceNumber: 'INV-2026-0002',
      purchaseOrderId: po1._id,
      vendorId: techVendor._id,
      items: [{ name: 'Business Laptops', quantity: 50, unitPrice: 1200, totalPrice: 60000 }],
      subtotal: 60000,
      taxPercent: 10,
      taxAmount: 6000,
      grandTotal: 66000,
      status: 'Sent',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      billingDetails: {
        companyName: 'Global Tech Solutions',
        address: '456 Silicon Valley, CA',
        gst: '07AAACA1234F1Z1'
      }
    });

    console.log('Creating Activity Logs...');
    const logs = [
      { userId: admin._id, userName: 'System Admin', action: 'CREATE', entityType: 'vendor', entityId: acmeVendor._id, metadata: { details: 'Onboarded Acme Corp' } },
      { userId: officer._id, userName: 'Procurement Officer', action: 'CREATE', entityType: 'rfq', entityId: rfq1._id, metadata: { details: 'Created Drill Press RFQ' } },
      { userId: vendorUser._id, userName: 'Acme Vendor', action: 'SUBMIT', entityType: 'quotation', entityId: quote1._id, metadata: { details: 'Submitted Drill Press Bid' } },
      { userId: manager._id, userName: 'Finance Manager', action: 'APPROVE', entityType: 'approval', entityId: approval1._id, metadata: { details: 'Approved Laptop Quotation' } },
      { userId: officer._id, userName: 'Procurement Officer', action: 'CREATE', entityType: 'purchase_order', entityId: po1._id, metadata: { details: 'Generated PO for Laptops' } },
      { userId: admin._id, userName: 'System Admin', action: 'UPDATE', entityType: 'invoice', entityId: invoice1._id, metadata: { details: 'Marked Acme invoice as Paid' } }
    ];

    for (let log of logs) {
      await ActivityLog.create(log);
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
