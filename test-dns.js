import https from 'https';

https.get('https://tcidatahub.com.ng', (res) => {
  console.log('tcidatahub.com.ng:', res.statusCode);
}).on('error', (e) => {
  console.error('tcidatahub.com.ng error:', e.message);
});

https.get('https://tcidatahub.com', (res) => {
  console.log('tcidatahub.com:', res.statusCode);
}).on('error', (e) => {
  console.error('tcidatahub.com error:', e.message);
});
