const http = require('http');

const baseURL = 'http://localhost:5000/api';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(`${baseURL}${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTests() {
  try {
    console.log('--- Starting E2E Tests ---');

    // 1. Login as Admin to get token
    console.log('1. Logging in as admin...');
    const loginRes = await request('POST', '/auth/login', { emailOrUsername: 'admin@vendorbridge.com', password: 'password123' });
    if (loginRes.status !== 200 || !loginRes.data.token) {
        throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
    }
    const token = loginRes.data.token;
    console.log('✓ Login successful');

    // 2. Fetch Vendors
    console.log('\n2. Fetching vendors...');
    const vendorsRes = await request('GET', '/vendors', null, token);
    if (vendorsRes.status !== 200 || !vendorsRes.data.data.length) {
        throw new Error('Failed to fetch vendors');
    }
    const vendorId = vendorsRes.data.data[0]._id;
    console.log('✓ Vendors fetched, selected vendor:', vendorId);

    // 3. Create RFQ
    console.log('\n3. Creating RFQ...');
    const rfqRes = await request('POST', '/rfq', {
      title: 'E2E Test RFQ',
      description: 'Testing the workflow',
      priority: 'High',
      department: 'Testing',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      rfqItems: [{ description: 'Test Item', unit: 'Pcs', quantity: 100, estimatedUnitPrice: 50 }],
      assignedVendors: [vendorId]
    }, token);
    if (rfqRes.status !== 201) throw new Error('Failed to create RFQ: ' + JSON.stringify(rfqRes.data));
    const rfqId = rfqRes.data.data._id;
    console.log('✓ RFQ created:', rfqId);

    // 4. Submit Quotation
    console.log('\n4. Submitting Quotation...');
    const quoteRes = await request('POST', '/quotations', {
      rfqId,
      vendorId,
      quotationItems: [{ description: 'Test Item', unit: 'Pcs', quantity: 100, unitPrice: 45, lineTotal: 4500 }],
      taxSummary: { gstPercentage: 18, gstAmount: 810 },
      grandTotal: 5310,
      paymentTerms: { creditDays: 30, paymentMethod: 'Bank Transfer' }
    }, token);
    if (quoteRes.status !== 201) throw new Error('Failed to submit quotation: ' + JSON.stringify(quoteRes.data));
    const quoteId = quoteRes.data.data._id;
    console.log('✓ Quotation submitted:', quoteId);

    // 5. Compare Quotations
    console.log('\n5. Fetching quotation comparisons...');
    const compareRes = await request('GET', `/quotations/compare/${rfqId}`, null, token);
    if (compareRes.status !== 200) throw new Error('Failed to fetch comparisons: ' + JSON.stringify(compareRes.data));
    console.log('✓ Quotation comparison fetched. Received ' + compareRes.data.data.length + ' quotes.');

    // 6. Approve Quotation -> Auto generates PO
    console.log('\n6. Approving Quotation (Generating PO)...');
    const approveRes = await request('POST', `/approvals/${quoteId}/approve`, { remarks: 'Looks good for E2E' }, token);
    if (approveRes.status !== 200) throw new Error('Failed to approve: ' + JSON.stringify(approveRes.data));
    const poId = approveRes.data.po._id;
    console.log('✓ Quotation approved. PO Generated:', poId);

    // 7. Fetch POs
    console.log('\n7. Fetching Purchase Orders...');
    const poRes = await request('GET', '/po', null, token);
    if (poRes.status !== 200) throw new Error('Failed to fetch POs: ' + JSON.stringify(poRes.data));
    console.log('✓ POs fetched successfully. Total POs:', poRes.data.data.length);

    // 8. Mark PO as Paid
    console.log('\n8. Marking PO as Paid...');
    const payRes = await request('PUT', `/po/${poId}/pay`, null, token);
    if (payRes.status !== 200) throw new Error('Failed to mark PO as paid: ' + JSON.stringify(payRes.data));
    console.log('✓ PO marked as paid successfully');

    // 9. Fetch Dashboard Analytics
    console.log('\n9. Fetching Dashboard Analytics...');
    const dashRes = await request('GET', '/dashboard/analytics', null, token);
    if (dashRes.status !== 200) throw new Error('Failed to fetch analytics: ' + JSON.stringify(dashRes.data));
    console.log('✓ Dashboard analytics fetched successfully');

    console.log('\n--- ALL E2E TESTS PASSED SUCCESSFULLY! ---');

  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
  }
}

runTests();
