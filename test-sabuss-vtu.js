import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';
const url = `https://sabuss.com/vtu/api/balance/${apiKey}`;

const req = https.get(url, (res) => {
  console.log('GET Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('GET Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});
