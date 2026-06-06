const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({ role: { $regex: /vendor/i } });
  for (const u of users) {
    const existing = await Vendor.findOne({ linkedUserId: u._id });
    if (!existing) {
      await Vendor.create({
        name: u.name || 'New Vendor',
        email: u.email,
        contactPerson: u.name || 'New Vendor',
        status: 'Active',
        linkedUserId: u._id,
        category: 'Uncategorized',
        gst: 'PENDING',
        phone: 'PENDING'
      });
      console.log(`Created missing Vendor profile for ${u.email}`);
    } else {
      console.log(`Vendor profile already exists for ${u.email}`);
    }
  }

  await mongoose.disconnect();
};

run();
