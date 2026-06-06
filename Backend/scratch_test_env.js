require('dotenv').config();
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Exists' : 'Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Exists' : 'Missing');
console.log('Total env keys:', Object.keys(process.env).filter(k => ['PORT', 'MONGO_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'].includes(k)));
