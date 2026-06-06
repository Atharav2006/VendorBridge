const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await User.find({ role: { $regex: /vendor/i } });
  console.log('--- USERS ---');
  for (const u of users) {
    console.log(`User: ${u.email} | ID: ${u._id} | Role: ${u.role}`);
  }

  const vendors = await Vendor.find();
  console.log('\n--- VENDORS ---');
  for (const v of vendors) {
    console.log(`Vendor: ${v.email} | ID: ${v._id} | linkedUserId: ${v.linkedUserId}`);
  }

  await mongoose.disconnect();
};

run();
