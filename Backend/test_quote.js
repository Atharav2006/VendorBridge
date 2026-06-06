async function run() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abhinav@gmail.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    console.log('Logged in successfully');

    try {
      const res = await fetch('http://localhost:3000/api/rfqs/6a242d872d54e3ac51b31945/quotations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          rfqId: '6a242d872d54e3ac51b31945',
          items: [{
            name: 'Laptop',
            quantity: 10,
            unitPrice: 100,
            totalPrice: 1000
          }],
          subtotal: 1000,
          taxPercent: 10,
          taxAmount: 100,
          deliveryDays: 5,
          grandTotal: 1100
        })
      });
      const data = await res.json();
      console.log('Status:', res.status, 'Response:', data);
    } catch (err) {
      console.error('Error:', err.message);
    }
  } catch (err) {
    console.error('Login failed:', err.message);
  }
}
run();
