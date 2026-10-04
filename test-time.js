const https = require('https');
https.get('https://google.com', (res) => {
  console.log(res.headers.date);
});
