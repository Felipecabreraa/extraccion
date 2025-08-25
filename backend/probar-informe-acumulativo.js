const axios = require('axios');
const fs = require('fs');

async function probarInformeAcumulativo() {
  try {
    console.log('🧪 Probando informe acumulativo con datos corregidos...');
    
    // Token obtenido anteriormente
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiYWRtaW5pc3RyYWRvciIsImlhdCI6MTc1NTcxNjUxMSwiZXhwIjoxNzU1NzQ1MzExfQ.769rHrF2jV7asjpv64vYagLK__sI96M2MupVmKTnxm0';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('📅 Generando informe acumulativo con 608 daños...');
    
    const response = await axios.get('http://localhost:3001/api/reportes-pdf/informe-acumulativo', {
      headers,
      responseType: 'arraybuffer'
    });

    console.log('✅ Informe acumulativo generado exitosamente');
    console.log('📊 Headers de respuesta:', response.headers);
    console.log('📄 Tipo de contenido:', response.headers['content-type']);
    console.log('📏 Tamaño del archivo:', response.data.length, 'bytes');

    // Guardar PDF
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `informe-acumulativo-608-danos-${fechaActual}.pdf`;
    fs.writeFileSync(nombreArchivo, response.data);
    console.log(`💾 PDF guardado como "${nombreArchivo}"`);
    console.log('🎯 Este PDF debería mostrar 608 daños acumulados desde 01-01-2025');

  } catch (error) {
    console.error('❌ Error probando informe acumulativo:', error.response ? error.response.data : error.message);
    if (error.response && error.response.data) {
      console.error('📋 Detalles del error:', error.response.data.toString());
    }
  }
}

probarInformeAcumulativo();



