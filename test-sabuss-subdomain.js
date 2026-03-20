import https from 'https';

const url = 'https://tcidatahub5.sabuss.com/api/user/';

const req = https.get(url, (res) => {
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
