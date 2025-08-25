const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Reiniciando servidor backend...');

// Cambiar al directorio del backend
process.chdir(path.join(__dirname, 'backend'));

// Detener procesos existentes en el puerto 3001 (Windows)
const killProcess = spawn('cmd', ['/c', 'for /f "tokens=5" %a in (\'netstat -aon ^| findstr :3001\') do taskkill /f /pid %a'], {
  stdio: 'ignore'
});

killProcess.on('close', () => {
  console.log('✅ Procesos anteriores terminados');
  
  // Iniciar el servidor
  const server = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('❌ Error al iniciar el servidor:', error);
  });
  
  server.on('close', (code) => {
    console.log(`Servidor terminado con código: ${code}`);
  });
  
  console.log('🚀 Servidor backend iniciado en puerto 3001');
  console.log('⏳ Espera unos segundos para que el servidor esté completamente listo...');
});

process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  process.exit();
});

