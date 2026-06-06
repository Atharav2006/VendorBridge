const mongoose = require('mongoose');
const RFQ = require('./models/RFQ');
const Vendor = require('./models/Vendor');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const vendors = await Vendor.find();
  const vendorIds = vendors.map(v => v._id);

  const rfqs = await RFQ.find({ status: 'Open' });
  for (const rfq of rfqs) {
    rfq.assignedVendorIds = vendorIds;
    await rfq.save();
    console.log(`Assigned ${vendorIds.length} vendors to RFQ: ${rfq.title}`);
  }

  await mongoose.disconnect();
};

run();
