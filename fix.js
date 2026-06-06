const fs = require('fs');

// Fix RFQList
let rfqCode = fs.readFileSync('Frontend/src/pages/rfqs/RFQList.jsx', 'utf8');
rfqCode = rfqCode.replace(/it\.qty/g, '(it.quantity || it.qty)');
fs.writeFileSync('Frontend/src/pages/rfqs/RFQList.jsx', rfqCode);

// Fix QuotationList
let qCode = fs.readFileSync('Frontend/src/pages/quotations/QuotationList.jsx', 'utf8');
qCode = qCode.replace(/{quote\.rfqTitle}/g, '{relatedRfq?.title || quote.rfqTitle || "Unknown RFQ"}');
qCode = qCode.replace(/{quote\.vendorName}/g, '{quote.vendorName || "Verified Vendor"}');
fs.writeFileSync('Frontend/src/pages/quotations/QuotationList.jsx', qCode);

// Fix POList
let poCode = fs.readFileSync('Frontend/src/pages/purchase-orders/POList.jsx', 'utf8');
poCode = poCode.replace(/po\.vendorName/g, '(po.vendorName || po.vendorId?.name || "Verified Vendor")');
fs.writeFileSync('Frontend/src/pages/purchase-orders/POList.jsx', poCode);

console.log('Done!');
