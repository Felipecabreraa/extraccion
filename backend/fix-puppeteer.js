const puppeteer = require('puppeteer');

async function setupPuppeteer() {
  try {
    console.log('🔧 Configurando Puppeteer...');
    
    // Configurar Puppeteer para Render
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    });
    
    console.log('✅ Puppeteer configurado correctamente');
    
    // Verificar que funciona
    const page = await browser.newPage();
    await page.setContent('<html><body><h1>Test</h1></body></html>');
    const pdf = await page.pdf({ format: 'A4' });
    
    console.log('✅ Generación de PDF funciona correctamente');
    console.log(`📄 Tamaño del PDF: ${pdf.length} bytes`);
    
    await browser.close();
    console.log('✅ Browser cerrado correctamente');
    
  } catch (error) {
    console.error('❌ Error configurando Puppeteer:', error.message);
    
    // Configuración alternativa
    console.log('🔄 Intentando configuración alternativa...');
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      console.log('✅ Configuración alternativa exitosa');
      await browser.close();
      
    } catch (altError) {
      console.error('❌ Configuración alternativa también falló:', altError.message);
    }
  }
}

setupPuppeteer();
