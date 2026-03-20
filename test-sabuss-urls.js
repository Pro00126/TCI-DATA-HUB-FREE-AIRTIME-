import https from 'https';

const urls = [
  'https://sabuss.com/tcidatahub5/api/user',
  'https://sabuss.com/tcidatahub5/api/',
  'https://sabuss.com/tcidatahub5/api/topup',
  'https://sabuss.com/tcidatahub5/api/topup/',
  'https://sabuss.com/tcidatahub5/user/',
  'https://sabuss.com/tcidatahub5/topup/'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, 'Status Code:', res.statusCode);
  }).on('error', (e) => {
    console.error(url, 'Error:', e.message);
  });
});
