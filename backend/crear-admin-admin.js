const { Usuario } = require('./src/models');
const bcrypt = require('bcryptjs');

async function crearAdminAdmin() {
  console.log('🔧 CREANDO/ACTUALIZANDO USUARIO ADMIN@ADMIN.COM\n');

  try {
    // Verificar si existe el usuario admin@admin.com
    const adminExistente = await Usuario.findOne({
      where: {
        email: 'admin@admin.com'
      }
    });

    if (adminExistente) {
      console.log('✅ Usuario admin@admin.com ya existe. Actualizando contraseña...');
      
      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await adminExistente.update({
        password: hashedPassword,
        rol: 'administrador' // Asegurar que tenga rol de administrador
      });
      
      console.log('✅ Usuario actualizado exitosamente:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   Rol: ${adminExistente.rol}`);
      console.log(`   ID: ${adminExistente.id}`);
      console.log('   Contraseña: admin123');
      
    } else {
      console.log('❌ Usuario admin@admin.com no existe. Creando...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const nuevoAdmin = await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        rol: 'administrador'
      });
      
      console.log('✅ Usuario admin@admin.com creado exitosamente:');
      console.log(`   Email: ${nuevoAdmin.email}`);
      console.log(`   Rol: ${nuevoAdmin.rol}`);
      console.log(`   ID: ${nuevoAdmin.id}`);
      console.log('   Contraseña: admin123');
    }

    console.log('\n📋 CREDENCIALES PARA LOGIN:');
    console.log('   Email: admin@admin.com');
    console.log('   Contraseña: admin123');
    console.log('\n✅ El usuario está listo para usar en el frontend');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearAdminAdmin(); 