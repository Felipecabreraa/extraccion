const { Usuario } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixUserRoles() {
  try {
    console.log('🔧 Verificando y corrigiendo roles de usuarios...');
    
    // Verificar todos los usuarios
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo']
    });
    
    console.log(`📊 Total usuarios encontrados: ${usuarios.length}`);
    
    for (const usuario of usuarios) {
      console.log(`\n👤 Usuario: ${usuario.email}`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Rol actual: "${usuario.rol}"`);
      console.log(`   Activo: ${usuario.activo}`);
      
      // Si el rol está vacío o es null, asignar 'admin'
      if (!usuario.rol || usuario.rol === '' || usuario.rol === null) {
        console.log(`   ⚠️ Rol vacío detectado. Asignando rol 'admin'...`);
        
        await Usuario.update(
          { rol: 'admin' },
          { where: { id: usuario.id } }
        );
        
        console.log(`   ✅ Rol actualizado a 'admin'`);
      } else {
        console.log(`   ✅ Rol válido: ${usuario.rol}`);
      }
    }
    
    // Verificar usuario admin específico
    console.log('\n🔍 Verificando usuario admin específico...');
    const adminUser = await Usuario.findOne({ 
      where: { email: 'admin@admin.com' },
      attributes: ['id', 'nombre', 'email', 'rol', 'activo']
    });
    
    if (adminUser) {
      console.log('✅ Usuario admin encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rol: "${adminUser.rol}"`);
      console.log(`   Activo: ${adminUser.activo}`);
      
      // Asegurar que tenga rol admin
      if (adminUser.rol !== 'admin') {
        console.log('⚠️ Usuario admin no tiene rol admin. Corrigiendo...');
        await Usuario.update(
          { rol: 'admin' },
          { where: { id: adminUser.id } }
        );
        console.log('✅ Rol corregido a admin');
      }
    } else {
      console.log('❌ Usuario admin no encontrado. Creándolo...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@admin.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true
      });
      console.log('✅ Usuario admin creado con rol admin');
    }
    
    console.log('\n🎉 Verificación de roles completada');
    
  } catch (error) {
    console.error('❌ Error verificando roles:', error);
  }
}

fixUserRoles();
