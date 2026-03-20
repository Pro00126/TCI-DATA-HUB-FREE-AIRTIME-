import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';
const pin = '1234'; // Dummy pin

const urls = [
  `https://sabuss.com/vtu/api/balance/${apiKey}?pin=${pin}`,
  `https://sabuss.com/vtu/api/balance/${apiKey}?transaction_pin=${pin}`,
  `https://sabuss.com/vtu/api/balance/${apiKey}?trans_pin=${pin}`,
  `https://sabuss.com/vtu/api/balance/${apiKey}?PIN=${pin}`
];

urls.forEach(url => {
  const req = https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`GET ${url} - Status Code:`, res.statusCode);
      console.log('Response:', data.substring(0, 200));
    });
  });

  req.on('error', (e) => {
    console.error(`Error for ${url}:`, e.message);
  });
});
