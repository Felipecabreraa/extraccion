# 🔧 SOLUCIÓN MANUAL PARA DESHABILITAR OIDC FEDERATION

## 🚨 PROBLEMA IDENTIFICADO
El error 401 indica que **OIDC Federation está habilitado** y está protegiendo el acceso al backend.

## 🔧 SOLUCIÓN PASO A PASO

### **PASO 1: Acceder al Dashboard de Vercel**
1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto **"extraccion"** (no "frontend")

### **PASO 2: Ir a Configuración de Seguridad**
1. Ve a **Settings > Security**
2. Busca la sección **"Secure Backend Access with OIDC Federation"**

### **PASO 3: Deshabilitar OIDC Federation**
**Opción A: Toggle de Deshabilitación**
- Busca un **toggle o switch** para deshabilitar OIDC Federation
- Si lo encuentras, **desactívalo**

**Opción B: Configuración de Acceso**
- Busca una opción **"None"** o **"Disabled"**
- Selecciona esta opción en lugar de "Team" o "Global"

**Opción C: Eliminar Configuración**
- Busca un botón **"Remove"** o **"Delete"**
- Elimina la configuración de OIDC Federation

### **PASO 4: Buscar en Otras Secciones**
Si no encuentras la opción en Security, busca en:

1. **Settings > Functions**
   - Busca configuración de autenticación
   - Deshabilita cualquier protección de acceso

2. **Settings > Domains**
   - Verifica que el dominio esté configurado como público
   - Busca opciones de control de acceso

3. **Settings > General**
   - Busca opciones de seguridad o autenticación

### **PASO 5: Guardar y Desplegar**
1. **Guarda los cambios**
2. **Haz un nuevo despliegue**: `npx vercel --prod`
3. **Verifica que funcione**

## 🔍 ALTERNATIVAS SI NO FUNCIONA

### **Opción 1: Contactar Soporte de Vercel**
- Ve a: https://vercel.com/support
- Explica que necesitas deshabilitar OIDC Federation
- Proporciona el nombre del proyecto: "extraccion"

### **Opción 2: Usar Railway (Más Fácil)**
- Railway no tiene este problema de OIDC
- Es más fácil de configurar
- Mejor soporte para aplicaciones con base de datos

### **Opción 3: Configurar Dominio Personalizado**
- Usar un dominio personalizado puede evitar las restricciones de Vercel
- Configurar DNS para apuntar a tu aplicación

## ✅ VERIFICACIÓN
Después de deshabilitar OIDC:

1. **Ejecuta**: `node verificar-backend-produccion.js`
2. **Debería mostrar**: ✅ Backend accesible
3. **Los datos deberían aparecer** en la aplicación

## 🆘 SI NADA FUNCIONA
Considera migrar a **Railway** que es más directo y no tiene estos problemas de autenticación. 