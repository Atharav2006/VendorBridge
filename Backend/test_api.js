async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor@vendorbridge.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.statusText);
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful. Token:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };

    const getRes = async (url) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.statusText}`);
      return res.json();
    };

    const quotes = await getRes('http://localhost:3000/api/quotations');
    console.log('Quotations:', quotes);

    const pos = await getRes('http://localhost:3000/api/purchase-orders');
    console.log('POs:', pos);

    const rfqs = await getRes('http://localhost:3000/api/rfqs');
    console.log('RFQs:', rfqs);

    const invoices = await getRes('http://localhost:3000/api/invoices');
    console.log('Invoices:', invoices);

    const vendors = await getRes('http://localhost:3000/api/vendors');
    console.log('Vendors:', vendors);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
