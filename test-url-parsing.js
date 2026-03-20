let TCI_API_URL = 'https://sabuss.com/tcidatahub5/api/user/';
TCI_API_URL = TCI_API_URL.replace(/\/$/, ''); // Remove trailing slash

// If the user provided the /user or /user/ endpoint, strip it to get the base API URL
if (TCI_API_URL.endsWith('/user')) {
  TCI_API_URL = TCI_API_URL.replace(/\/user$/, '');
}

// Automatically append /api if the user provided the homepage URL instead of the API URL
if (!TCI_API_URL.includes('/api')) {
  TCI_API_URL += '/api';
}

console.log(TCI_API_URL);
