const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quotation = require('./models/Quotation');
const Vendor = require('./models/Vendor');
const User = require('./models/User');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  try {
    const user = await User.findOne({ email: 'abhinav@gmail.com' });
    console.log('User found:', user ? user._id : 'No');

    if (!user) return;

    const vendor = await Vendor.findOne({ linkedUserId: user._id });
    console.log('Vendor found:', vendor ? vendor._id : 'No');

    if (!vendor) return;

    // Try to validate quotation
    const quotation = new Quotation({
      rfqId: '6a242d872d54e3ac51b31945',
      vendorId: vendor._id,
      items: [{
        name: 'Laptop',
        quantity: 10,
        unitPrice: 100,
        totalPrice: 1000
      }],
      subtotal: 1000,
      taxPercent: 10,
      taxAmount: 100,
      deliveryDays: 5,
      grandTotal: 1100
    });

    const err = quotation.validateSync();
    if (err) {
      console.error('Validation error:', err.message);
    } else {
      console.log('Validation passed!');
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
run();
