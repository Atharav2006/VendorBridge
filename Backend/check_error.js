const mongoose = require('mongoose');
const Quotation = require('./models/Quotation');
const Vendor = require('./models/Vendor');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/vendorbridge'); // assuming default local
  
  try {
    const vendor = await Vendor.findOne({ email: 'abhinav@gmail.com' });
    console.log('Vendor:', vendor ? vendor._id : 'Not found');
    if (!vendor) return;

    const req = {
      user: { _id: vendor.linkedUserId, name: 'Abhinav' },
      params: { rfqId: '6a242d872d54e3ac51b31945' },
      body: {
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
      }
    };

    const res = {
      status: (code) => ({
        json: (data) => console.log('Response:', code, data)
      })
    };

    const { createQuotation } = require('./controllers/quotationController');
    await createQuotation(req, res);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
run();
