require('dotenv').config();
const connectDB = require('./utils/db');
const Invoice = require('./models/Invoice');
const Vendor = require('./models/Vendor');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

async function testEmail() {
  await connectDB();
  const invoice = await Invoice.findById('6a23b3519505b80aabf97d69').populate('vendorId');
  if (!invoice) return console.log('Invoice not found');

  const recipientEmail = 'gadeatharva23@gmail.com';

  const doc = new PDFDocument();
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  doc.fontSize(20).text('VendorBridge Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Company Name: ${invoice.billingDetails.companyName}`);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
  doc.text(`Vendor Address: ${invoice.billingDetails.address}`);
  doc.text(`GST: ${invoice.billingDetails.gst}`);
  doc.moveDown();
  doc.text('Items:', { underline: true });
  invoice.items.forEach(item => {
    doc.text(`${item.name} - ${item.quantity} x Rs${item.unitPrice} = Rs${item.totalPrice}`);
  });
  doc.moveDown();
  doc.text(`Subtotal: Rs${invoice.subtotal}`);
  doc.text(`Tax (18% GST): Rs${invoice.taxAmount}`);
  doc.text(`Grand Total: Rs${invoice.grandTotal}`, { bold: true });
  doc.moveDown(2);
  doc.text('Thank you for your business', { align: 'center' });
  doc.end();

  doc.on('end', async () => {
    let pdfData = Buffer.concat(buffers);
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `Invoice ${invoice.invoiceNumber}`,
        text: 'Please find your generated invoice attached.',
        attachments: [{
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfData
        }]
      });
      console.log('Successfully sent email!');
    } catch (err) {
      console.error('Nodemailer Error:', err);
    }
    mongoose.disconnect();
  });
}

testEmail();
