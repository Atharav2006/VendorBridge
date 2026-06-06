const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING END-TO-END SYSTEM TEST ===\n');
  
  try {
    // 1. AUTHENTICATION & ROLES
    console.log('Test 1: Authenticating as Purchaser...');
    const purchaserLogin = await axios.post(`${API_URL}/auth/login`, {
      emailOrUsername: 'purchaser@vendorbridge.com',
      password: 'password123'
    });
    const purchaserToken = purchaserLogin.data.token;
    console.log('✅ Purchaser login successful.');

    console.log('Test 2: Authenticating as Vendor...');
    const vendorLogin = await axios.post(`${API_URL}/auth/login`, {
      emailOrUsername: 'sales@steelmetals.com',
      password: 'password123'
    });
    const vendorToken = vendorLogin.data.token;
    console.log('✅ Vendor login successful.');

    // 2. DASHBOARD
    console.log('\nTest 3: Fetching Dashboard Analytics (Purchaser)...');
    const dashboard = await axios.get(`${API_URL}/dashboard/analytics`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    console.log(`✅ Dashboard loaded. Active RFQs: ${dashboard.data.data.activeRFQs}`);

    // 3. VENDORS
    console.log('\nTest 4: Fetching Vendor List...');
    const vendors = await axios.get(`${API_URL}/vendors`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    const vendorId = vendors.data.data[0]._id;
    console.log(`✅ Vendors loaded. Total: ${vendors.data.data.length}`);

    // 4. RFQ CREATION
    console.log('\nTest 5: Creating New RFQ...');
    const rfqPayload = {
      title: 'Automated E2E Test RFQ',
      description: 'Testing the RFQ module',
      priority: 'High',
      department: 'IT',
      deadline: new Date(),
      rfqItems: [{ description: 'Test Item', unit: 'pcs', quantity: 10, estimatedUnitPrice: 100 }],
      assignedVendors: [vendorId]
    };
    const rfq = await axios.post(`${API_URL}/rfq`, rfqPayload, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    const rfqId = rfq.data.data._id;
    console.log(`✅ RFQ Created. ID: ${rfqId}`);

    // 5. QUOTATION SUBMISSION
    console.log('\nTest 6: Submitting Quotation (Vendor)...');
    const quotationPayload = {
      rfqId: rfqId,
      quotationItems: [{ description: 'Test Item', unit: 'pcs', quantity: 10, unitPrice: 95 }],
      taxSummary: { gstPercentage: 10 },
      grandTotal: 1045
    };
    const quote = await axios.post(`${API_URL}/quotations`, quotationPayload, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const quoteId = quote.data.data._id;
    console.log(`✅ Quotation Submitted. ID: ${quoteId}`);

    // 6. APPROVALS (Mock Endpoint test)
    console.log('\nTest 7: Fetching Approvals...');
    const approvals = await axios.get(`${API_URL}/approvals`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    console.log('✅ Approvals endpoint reachable.');

    // 7. PURCHASE ORDERS
    console.log('\nTest 8: Generating Purchase Order...');
    const poPayload = {
      rfqId: rfqId,
      quotationId: quoteId,
      vendorDetails: { name: 'Test Vendor' },
      invoiceItems: [{ description: 'Test', qty: 10, unitPrice: 95, total: 950 }],
      taxSummary: { grandTotal: 1045 }
    };
    const po = await axios.post(`${API_URL}/po`, poPayload, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    console.log(`✅ Purchase Order Generated. PO Number: ${po.data.data.poNumber}`);

    // 8. AUDIT LOGS
    console.log('\nTest 9: Fetching Audit Logs...');
    const logs = await axios.get(`${API_URL}/audit`, {
      headers: { Authorization: `Bearer ${purchaserToken}` }
    });
    console.log(`✅ Audit Logs loaded. Total records: ${logs.data.data.length}`);

    console.log('\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY! THE SYSTEM IS FULLY CONNECTED.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
