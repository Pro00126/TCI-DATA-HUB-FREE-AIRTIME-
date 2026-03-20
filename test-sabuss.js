import https from 'https';

const url = 'https://sabuss.com/tcidatahub5/api/user/';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data.substring(0, 500));
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
