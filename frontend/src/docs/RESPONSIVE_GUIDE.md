# Guía de Componentes Responsivos

## Descripción General

Esta aplicación ha sido completamente adaptada para ser 100% responsiva, funcionando perfectamente en dispositivos móviles, tablets y desktop. Se han creado componentes especializados que se adaptan automáticamente al tamaño de pantalla.

## Componentes Responsivos Disponibles

### 1. ResponsiveWrapper
Componente contenedor que maneja el layout de grid responsivo.

```jsx
import ResponsiveWrapper from '../components/ResponsiveWrapper';

<ResponsiveWrapper 
  gridColumns={4} 
  gap={3} 
  padding={2}
  mobilePadding={1}
>
  {/* Contenido */}
</ResponsiveWrapper>
```

**Props:**
- `gridColumns`: Número de columnas en desktop (default: 1)
- `gap`: Espaciado entre elementos (default: 2)
- `padding`: Padding del contenedor (default: 2)
- `mobilePadding`: Padding en móvil (default: 1)

### 2. ResponsiveCard
Componente de tarjeta que se adapta al tamaño de pantalla.

```jsx
import ResponsiveCard from '../components/ResponsiveCard';

<ResponsiveCard 
  padding={3}
  mobilePadding={2}
  minHeight={200}
  mobileMinHeight={150}
  elevation={1}
>
  {/* Contenido de la tarjeta */}
</ResponsiveCard>
```

**Props:**
- `padding`: Padding interno (default: 3)
- `mobilePadding`: Padding en móvil (default: 2)
- `minHeight`: Altura mínima (default: 200)
- `mobileMinHeight`: Altura mínima en móvil (default: 150)
- `elevation`: Elevación de la sombra (default: 1)

### 3. ResponsiveTable
Tabla con scroll horizontal automático en dispositivos móviles.

```jsx
import ResponsiveTable from '../components/ResponsiveTable';

const columns = [
  { id: 'nombre', label: 'Nombre' },
  { id: 'email', label: 'Email' },
  { id: 'acciones', label: 'Acciones', render: (value, row) => (
    <Button>Editar</Button>
  )}
];

<ResponsiveTable 
  data={data}
  columns={columns}
  emptyMessage="No hay datos disponibles"
  minWidth={600}
  mobileMinWidth={500}
/>
```

**Props:**
- `data`: Array de datos
- `columns`: Array de definiciones de columnas
- `emptyMessage`: Mensaje cuando no hay datos
- `minWidth`: Ancho mínimo de la tabla
- `mobileMinWidth`: Ancho mínimo en móvil

### 4. ResponsiveFilters
Componente de filtros que se colapsa automáticamente en móvil.

```jsx
import ResponsiveFilters from '../components/ResponsiveFilters';

<ResponsiveFilters 
  title="Filtros de Búsqueda"
  defaultExpanded={true}
  showToggle={true}
>
  <TextField label="Buscar" />
  <Select label="Categoría" />
  <Button variant="contained">Aplicar</Button>
</ResponsiveFilters>
```

**Props:**
- `title`: Título de la sección de filtros
- `defaultExpanded`: Si está expandido por defecto
- `showToggle`: Si mostrar el botón de toggle en móvil

## Contexto de Responsividad

El contexto `ResponsiveContext` proporciona información sobre el tamaño de pantalla actual:

```jsx
import { useResponsive } from '../context/ResponsiveContext';

const { isMobile, isTablet, isDesktop, sidebarOpen, toggleSidebar } = useResponsive();
```

**Valores disponibles:**
- `isMobile`: true si la pantalla es menor a 768px
- `isTablet`: true si la pantalla está entre 768px y 1023px
- `isDesktop`: true si la pantalla es mayor a 1023px
- `sidebarOpen`: estado del sidebar
- `toggleSidebar`: función para alternar el sidebar
- `closeSidebar`: función para cerrar el sidebar

## Clases CSS Responsivas

### Grid Responsivo
```css
.responsive-grid-1 { grid-template-columns: 1fr; }
.responsive-grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.responsive-grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.responsive-grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

### Utilidades
```css
.hide-mobile { display: block; } /* Oculto en móvil */
.show-mobile { display: none; }  /* Solo visible en móvil */
.text-center-mobile { text-align: center; }
.full-width-mobile { width: 100%; }
```

## Breakpoints

- **Mobile**: hasta 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px y superior

## Ejemplo de Implementación Completa

```jsx
import React from 'react';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import ResponsiveCard from '../components/ResponsiveCard';
import ResponsiveTable from '../components/ResponsiveTable';
import ResponsiveFilters from '../components/ResponsiveFilters';
import { useResponsive } from '../context/ResponsiveContext';

const MiComponente = () => {
  const { isMobile } = useResponsive();

  return (
    <div>
      {/* Filtros responsivos */}
      <ResponsiveFilters title="Filtros de Datos">
        <TextField label="Buscar" fullWidth={isMobile} />
        <Select label="Categoría" fullWidth={isMobile} />
        <Button variant="contained" fullWidth={isMobile}>
          Buscar
        </Button>
      </ResponsiveFilters>

      {/* Grid responsivo de tarjetas */}
      <ResponsiveWrapper gridColumns={3} gap={3}>
        <ResponsiveCard>
          <Typography variant="h6">Tarjeta 1</Typography>
          <Typography>Contenido de la tarjeta</Typography>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <Typography variant="h6">Tarjeta 2</Typography>
          <Typography>Contenido de la tarjeta</Typography>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <Typography variant="h6">Tarjeta 3</Typography>
          <Typography>Contenido de la tarjeta</Typography>
        </ResponsiveCard>
      </ResponsiveWrapper>

      {/* Tabla responsiva */}
      <ResponsiveTable 
        data={datos}
        columns={columnas}
        emptyMessage="No hay datos para mostrar"
      />
    </div>
  );
};
```

## Mejores Prácticas

1. **Siempre usar ResponsiveWrapper** para layouts de grid
2. **Usar ResponsiveCard** en lugar de Card de Material-UI
3. **Implementar ResponsiveTable** para tablas con muchos datos
4. **Usar ResponsiveFilters** para formularios de filtrado
5. **Verificar el contexto** antes de aplicar estilos específicos
6. **Probar en diferentes tamaños** de pantalla
7. **Usar las clases CSS** responsivas cuando sea apropiado

## Consideraciones de Accesibilidad

- Los componentes respetan `prefers-reduced-motion`
- Las tablas mantienen la estructura semántica
- Los filtros colapsables son accesibles por teclado
- Los breakpoints están optimizados para lectores de pantalla

## Rendimiento

- Los componentes usan CSS Grid nativo para mejor rendimiento
- Las transiciones están optimizadas para dispositivos móviles
- El scroll horizontal de tablas es suave y eficiente
- Los componentes se renderizan condicionalmente según el tamaño de pantalla

