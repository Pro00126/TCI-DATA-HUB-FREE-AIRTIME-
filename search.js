import https from 'https';

const query = encodeURIComponent('TCI Data Hub VTU API');
const options = {
  hostname: 'html.duckduckgo.com',
  path: '/html/?q=' + query,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<a class="result__url" href="([^"]+)">/g);
    if (matches) {
      matches.forEach(m => console.log(m));
    } else {
      console.log('No matches');
    }
  });
}).on('error', console.error);
