import https from 'https';

const apiKey = '2IB6MAH7F4XNYUDbQEKZ3LJSdPGc1e8WC9a0fOVR5T6032CBEL5fJa8veAG0bbDj9kF';

const urls = [
  `https://sabuss.com/vtu/api/topup`,
  `https://sabuss.com/vtu/api/airtime`,
  `https://sabuss.com/vtu/api/vtu`,
  `https://sabuss.com/vtu/api/recharge`
];

urls.forEach(url => {
  const req = https.request(url, { 
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
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
  req.end();
});
