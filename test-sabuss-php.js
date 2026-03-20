import https from 'https';

const urls = [
  'https://sabuss.com/tcidatahub5/api/user.php',
  'https://sabuss.com/tcidatahub5/api/topup.php',
  'https://sabuss.com/tcidatahub5/api/user/index.php',
  'https://sabuss.com/tcidatahub5/api/topup/index.php'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(url, 'Status Code:', res.statusCode);
  }).on('error', (e) => {
    console.error(url, 'Error:', e.message);
  });
});
