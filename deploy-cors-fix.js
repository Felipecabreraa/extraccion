const { execSync } = require('child_process');

console.log('🚀 Deploying CORS fix...');

try {
  // Agregar cambios
  console.log('📝 Adding changes...');
  execSync('git add backend/src/app.js', { stdio: 'inherit' });
  
  // Commit
  console.log('💾 Committing changes...');
  execSync('git commit -m "Fix CORS for GitHub Pages"', { stdio: 'inherit' });
  
  // Push
  console.log('📤 Pushing to GitHub...');
  execSync('git push origin develop', { stdio: 'inherit' });
  
  console.log('✅ CORS fix deployed successfully!');
  console.log('🔄 Railway will automatically redeploy...');
  
} catch (error) {
  console.error('❌ Error during deploy:', error.message);
} 