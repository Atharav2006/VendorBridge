const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Quotation = require('./models/Quotation');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne({ email: 'vendor@vendorbridge.com' });
  console.log('User:', user ? user._id.toString() : 'Not found');
  
  const vendor = await Vendor.findOne({ linkedUserId: user?._id });
  console.log('Vendor linked to user:', vendor ? vendor._id.toString() : 'Not found');
  console.log('Vendor linkedUserId:', vendor ? vendor.linkedUserId.toString() : 'N/A');

  const quotes = await Quotation.find({ vendorId: vendor?._id });
  console.log('Quotes for vendor:', quotes.length);

  await mongoose.disconnect();
};

run();
