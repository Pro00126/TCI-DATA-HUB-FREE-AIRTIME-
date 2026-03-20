import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';
const pin = process.env.TCI_TRANSACTION_PIN || '1234'; // Try a dummy pin if not set
const urls = [
  `https://sabuss.com/vtu/api/balance/${apiKey}/${pin}`,
  `https://sabuss.com/vtu/api/balance/${apiKey}?pin=${pin}`,
  `https://sabuss.com/vtu/api/balance/${apiKey}`
];

urls.forEach(url => {
  const req = https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`GET ${url} - Status Code:`, res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`Error for ${url}:`, e.message);
  });
});
