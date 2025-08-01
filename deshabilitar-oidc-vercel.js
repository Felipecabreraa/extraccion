const { execSync } = require('child_process');

console.log('🔧 DESHABILITANDO OIDC FEDERATION EN VERCEL');
console.log('=============================================');
console.log('');

async function deshabilitarOIDC() {
  try {
    console.log('📋 Pasos para deshabilitar OIDC Federation:');
    console.log('');
    console.log('1. Ve a: https://vercel.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Settings > Security');
    console.log('4. En "Secure Backend Access with OIDC Federation":');
    console.log('   - Busca un toggle para "Disable" o "Turn off"');
    console.log('   - O busca una opción "None" o "Disabled"');
    console.log('5. Si no encuentras la opción, busca en:');
    console.log('   - Settings > Functions > Authentication');
    console.log('   - Settings > Domains > Access Control');
    console.log('');
    
    console.log('🔍 Alternativa: Usar la CLI de Vercel');
    console.log('=====================================');
    console.log('');
    
    // Intentar usar la CLI de Vercel para configurar
    console.log('Intentando configurar desde CLI...');
    
    // Verificar si podemos acceder al proyecto
    const projectInfo = execSync('npx vercel project ls', { encoding: 'utf8' });
    console.log('✅ Proyectos disponibles:');
    console.log(projectInfo);
    
    console.log('');
    console.log('📋 Si no funciona la CLI, haz esto manualmente:');
    console.log('');
    console.log('1. Ve a: https://vercel.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Settings > Security');
    console.log('4. Busca "Secure Backend Access"');
    console.log('5. Deshabilita OIDC Federation');
    console.log('6. Guarda los cambios');
    console.log('7. Haz un nuevo despliegue');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Solución manual:');
    console.log('1. Ve al dashboard de Vercel');
    console.log('2. Busca la opción para deshabilitar OIDC');
    console.log('3. O contacta soporte de Vercel');
  }
}

deshabilitarOIDC(); 