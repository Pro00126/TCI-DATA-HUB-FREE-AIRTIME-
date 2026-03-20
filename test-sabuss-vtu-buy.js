import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';

const urls = [
  `https://sabuss.com/vtu/api/buy/${apiKey}`,
  `https://sabuss.com/vtu/api/vend/${apiKey}`,
  `https://sabuss.com/vtu/api/purchase/${apiKey}`,
  `https://sabuss.com/vtu/api/transaction/${apiKey}`
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
