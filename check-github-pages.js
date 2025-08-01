const https = require('https');

console.log('🔍 Verificando estado de GitHub Pages...');

const options = {
  hostname: 'felipecabreraa.github.io',
  port: 443,
  path: '/extraccion/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  if (res.statusCode === 200) {
    console.log('✅ GitHub Pages está funcionando correctamente');
  } else if (res.statusCode === 404) {
    console.log('❌ GitHub Pages devuelve 404 - puede estar en proceso de actualización');
  } else {
    console.log(`⚠️ Status inesperado: ${res.statusCode}`);
  }
});

req.on('error', (e) => {
  console.error('❌ Error al verificar GitHub Pages:', e.message);
});

req.end(); 