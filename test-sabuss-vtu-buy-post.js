import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';
const url = `https://sabuss.com/vtu/api/buy/${apiKey}`;

const req = https.request(url, { 
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`POST ${url} - Status Code:`, res.statusCode);
    console.log('Response:', data.substring(0, 200));
  });
});

req.on('error', (e) => {
  console.error(`Error for ${url}:`, e.message);
});

req.write(JSON.stringify({
  network: 1,
  amount: 100,
  mobile_number: "08012345678",
  Ported_number: true,
  airtime_type: "VTU",
  pin: "1234",
  transaction_pin: "1234"
}));
req.end();
