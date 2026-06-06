const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Quotation = require('./models/Quotation');
const PurchaseOrder = require('./models/PurchaseOrder');
const Invoice = require('./models/Invoice');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne({ email: 'vendor@vendorbridge.com' });
  const vendor = await Vendor.findOne({ linkedUserId: user?._id });

  let query = {};
  query.vendorId = vendor._id;

  try {
    const quotes = await Quotation.find(query);
    console.log('Quotes:', quotes.length);
  } catch (err) { console.log('Quotes Error:', err); }

  try {
    const pos = await PurchaseOrder.find(query);
    console.log('POs:', pos.length);
  } catch (err) { console.log('POs Error:', err); }

  try {
    const invoices = await Invoice.find(query);
    console.log('Invoices:', invoices.length);
  } catch (err) { console.log('Invoices Error:', err); }

  await mongoose.disconnect();
};

run();
