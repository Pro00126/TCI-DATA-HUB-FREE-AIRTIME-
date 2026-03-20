import https from 'https';

const url = 'https://sabuss.com/tcidatahub5/api/user/';

const req = https.request(url, { method: 'POST' }, (res) => {
  console.log('POST Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('POST Response:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});
req.end();
