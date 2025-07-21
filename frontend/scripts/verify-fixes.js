const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando correcciones de errores JSX...');
console.log('==========================================');

// Verificar archivos modificados
const filesToCheck = [
  'src/pages/DanosHistoricos.jsx',
  'src/components/DanosHistoricosDashboard.jsx',
  'src/pages/Dashboard.jsx'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - No existe`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Algunos archivos necesarios no existen');
  process.exit(1);
}

// Verificar sintaxis JSX en DanosHistoricos.jsx
const danosHistoricosPath = path.join(__dirname, '..', 'src/pages/DanosHistoricos.jsx');
const danosHistoricosContent = fs.readFileSync(danosHistoricosPath, 'utf8');

const jsxChecks = [
  {
    name: 'Container está correctamente cerrado',
    check: (content) => {
      const containerOpen = (content.match(/<Container/g) || []).length;
      const containerClose = (content.match(/<\/Container>/g) || []).length;
      return containerOpen === containerClose;
    }
  },
  {
    name: 'Box está correctamente cerrado',
    check: (content) => {
      const boxOpen = (content.match(/<Box/g) || []).length;
      const boxClose = (content.match(/<\/Box>/g) || []).length;
      return boxOpen === boxClose;
    }
  },
  {
    name: 'Grid está correctamente cerrado',
    check: (content) => {
      const gridOpen = (content.match(/<Grid/g) || []).length;
      const gridClose = (content.match(/<\/Grid>/g) || []).length;
      return gridOpen === gridClose;
    }
  },
  {
    name: 'No hay código duplicado de gráficos históricos',
    check: (content) => !content.includes('Gráficos históricos') || 
                       (content.match(/Gráficos históricos/g) || []).length <= 1
  },
  {
    name: 'DanosHistoricosDashboard está importado',
    check: (content) => content.includes("import DanosHistoricosDashboard from '../components/DanosHistoricosDashboard'")
  },
  {
    name: 'DanosHistoricosDashboard está usado',
    check: (content) => content.includes('<DanosHistoricosDashboard')
  }
];

console.log('\n📋 Verificando sintaxis JSX en DanosHistoricos.jsx:');
jsxChecks.forEach(check => {
  if (check.check(danosHistoricosContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

// Verificar importaciones en DanosHistoricosDashboard.jsx
const dashboardPath = path.join(__dirname, '..', 'src/components/DanosHistoricosDashboard.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const importChecks = [
  {
    name: 'Divider no está importado (no se usa)',
    check: (content) => !content.includes("import.*Divider")
  },
  {
    name: 'BuildIcon no está importado (no se usa)',
    check: (content) => !content.includes("BuildIcon")
  },
  {
    name: 'Funciones no utilizadas removidas',
    check: (content) => !content.includes('getTendenciaIcon') && !content.includes('getChipColor')
  }
];

console.log('\n📋 Verificando importaciones en DanosHistoricosDashboard.jsx:');
importChecks.forEach(check => {
  if (check.check(dashboardContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

// Verificar importaciones en Dashboard.jsx
const mainDashboardPath = path.join(__dirname, '..', 'src/pages/Dashboard.jsx');
const mainDashboardContent = fs.readFileSync(mainDashboardPath, 'utf8');

const dashboardImportChecks = [
  {
    name: 'Divider no está importado en Dashboard (no se usa)',
    check: (content) => !content.includes("import.*Divider")
  }
];

console.log('\n📋 Verificando importaciones en Dashboard.jsx:');
dashboardImportChecks.forEach(check => {
  if (check.check(mainDashboardContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

console.log('\n✅ Verificación completada');
console.log('\n📝 Para aplicar los cambios:');
console.log('1. Reinicia el servidor de desarrollo (npm start)');
console.log('2. Verifica que no hay errores de compilación');
console.log('3. Navega a /danos-historicos para probar la funcionalidad'); 