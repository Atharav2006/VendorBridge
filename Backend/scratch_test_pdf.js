require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing SMTP with:', process.env.EMAIL_USER);
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('SMTP Verified successfully!');
  } catch (err) {
    console.error('SMTP Verification Failed:', err);
  }
}

testEmail();
