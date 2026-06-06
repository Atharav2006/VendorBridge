require('dotenv').config();

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./utils/db');

async function testApi() {
  try {
    await connectDB();
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      console.log('No admin found!');
      process.exit(1);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated token for', user.email);

    const response = await fetch(
      'http://localhost:3000/api/invoices/6a23b3519505b80aabf97d69/email',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw { response: { status: response.status, data } };
    }
    console.log('SUCCESS:', data);
  } catch (err) {
    if (err.response) {
      console.log('HTTP ERROR:', err.response.status, err.response.data);
    } else {
      console.log('OTHER ERROR:', err.message);
    }
  } finally {
    mongoose.disconnect();
  }
}

testApi();
