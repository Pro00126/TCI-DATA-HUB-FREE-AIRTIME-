import https from 'https';

const url = 'https://sabuss.com/tcidatahub5/api/user';

const req = https.request(url, { 
  method: 'GET',
  headers: {
    'Authorization': 'Token dummy_token',
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('GET Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('GET Response:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});
req.end();
