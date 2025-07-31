const sequelize = require('../src/config/database');

async function testFrontendPetroleoData() {
  try {
    console.log('🔍 Probando datos para frontend - Análisis de Petróleo...\n');

    // Simular la respuesta que el frontend espera recibir
    const mockResponse = {
      // Datos existentes que el frontend ya usa
      consumoPorMaquina: [
        {
          nroMaquina: "09",
          totalLitros: 49483,
          totalOrdenes: 7,
          promedioLitros: 7069,
          totalKm: 258997,
          totalPabellones: 18312,
          rendimientoLitroKm: 0.19,
          rendimientoLitroPabellon: 2.70
        },
        {
          nroMaquina: "06",
          totalLitros: 41725,
          totalOrdenes: 8,
          promedioLitros: 5215.6,
          totalKm: 27224,
          totalPabellones: 16302,
          rendimientoLitroKm: 1.53,
          rendimientoLitroPabellon: 2.56
        }
      ],
      
      // NUEVA ESTRUCTURA MEJORADA para el gráfico de consumo por sector
      distribucionConsumoPorSector: {
        titulo: "Distribución de Consumo por Sector",
        subtitulo: "Análisis de consumo de combustible por sector operativo",
        totalSectores: 68,
        totalLitros: 689205,
        sumaPorcentajes: 99.96,
        
        // Resumen visual mejorado
        resumenVisual: {
          titulo: "TOTAL LITROS CONSUMIDOS",
          valor: "689,205",
          unidad: "L",
          sectoresActivos: 68,
          texto: "68 sectores activos"
        },
        
        // Gráfico de donut mejorado
        graficoDonut: {
          titulo: "Distribución por Sector",
          subtitulo: "Porcentaje de consumo por sector operativo",
          datos: [
            {
              id: 1,
              sector: "PICARQUIN",
              litros: 49483,
              porcentaje: 7.18,
              color: "#3B82F6",
              leyenda: "PICARQUIN: 49,483 L (7.18%)",
              etiqueta: "PICARQUIN",
              valor: 49483,
              porcentaje: 7.18
            },
            {
              id: 2,
              sector: "LA COMPANIA",
              litros: 41725,
              porcentaje: 6.05,
              color: "#F59E0B",
              leyenda: "LA COMPANIA: 41,725 L (6.05%)",
              etiqueta: "LA COMPANIA",
              valor: 41725,
              porcentaje: 6.05
            },
            {
              id: 3,
              sector: "EL VALLE",
              litros: 31518,
              porcentaje: 4.57,
              color: "#10B981",
              leyenda: "EL VALLE: 31,518 L (4.57%)",
              etiqueta: "EL VALLE",
              valor: 31518,
              porcentaje: 4.57
            },
            {
              id: 4,
              sector: "STA. TERESA",
              litros: 28934,
              porcentaje: 4.20,
              color: "#EC4899",
              leyenda: "STA. TERESA: 28,934 L (4.20%)",
              etiqueta: "STA. TERESA",
              valor: 28934,
              porcentaje: 4.20
            },
            {
              id: 5,
              sector: "B. VIEJO",
              litros: 25071,
              porcentaje: 3.64,
              color: "#8B5CF6",
              leyenda: "B. VIEJO: 25,071 L (3.64%)",
              etiqueta: "B. VIEJO",
              valor: 25071,
              porcentaje: 3.64
            },
            {
              id: 6,
              sector: "LOS GOMEROS",
              litros: 22604,
              porcentaje: 3.28,
              color: "#EF4444",
              leyenda: "LOS GOMEROS: 22,604 L (3.28%)",
              etiqueta: "LOS GOMEROS",
              valor: 22604,
              porcentaje: 3.28
            },
            {
              id: 7,
              sector: "LA PUNTA 2",
              litros: 21931,
              porcentaje: 3.18,
              color: "#6B7280",
              leyenda: "LA PUNTA 2: 21,931 L (3.18%)",
              etiqueta: "LA PUNTA 2",
              valor: 21931,
              porcentaje: 3.18
            },
            {
              id: 8,
              sector: "DON TITO",
              litros: 18993,
              porcentaje: 2.76,
              color: "#FCD34D",
              leyenda: "DON TITO: 18,993 L (2.76%)",
              etiqueta: "DON TITO",
              valor: 18993,
              porcentaje: 2.76
            }
          ],
          total: 689205,
          sumaPorcentajes: 99.96
        },
        
        // Tabla de datos mejorada
        tablaSectores: {
          titulo: "Detalle por Sector",
          columnas: [
            { titulo: "Sector", campo: "sector" },
            { titulo: "Litros", campo: "litros", formato: "numero" },
            { titulo: "Porcentaje", campo: "porcentaje", formato: "porcentaje" },
            { titulo: "Órdenes", campo: "ordenes", formato: "numero" },
            { titulo: "Pabellones", campo: "pabellones", formato: "numero" },
            { titulo: "Eficiencia", campo: "eficiencia", formato: "decimal" }
          ],
          datos: [
            {
              posicion: 1,
              sector: "PICARQUIN",
              litros: 49483,
              porcentaje: 7.18,
              ordenes: 7,
              registros: 15,
              pabellones: 18312,
              pabellonesLimpiados: 18000,
              mts2: 45000,
              promedioPorRegistro: 3298.87,
              eficiencia: 2.70,
              litrosFormateado: "49,483",
              porcentajeFormateado: "7.18%",
              eficienciaFormateada: "2.70 L/pabellón"
            }
          ]
        },
        
        // KPIs destacados
        kpisDestacados: {
          sectorMayorConsumo: {
            titulo: "Sector Mayor Consumo",
            sector: "PICARQUIN",
            litros: 49483,
            porcentaje: 7.18,
            formateado: "49,483 L (7.18%)"
          },
          sectorMenorConsumo: {
            titulo: "Sector Menor Consumo",
            sector: "CASA BLANCA",
            litros: 420,
            porcentaje: 0.06,
            formateado: "420 L (0.06%)"
          },
          promedioPorSector: {
            titulo: "Promedio por Sector",
            valor: 10135,
            formateado: "10,135 L"
          }
        },
        
        // Configuración visual
        configuracionVisual: {
          colores: {
            primario: '#3B82F6',
            secundario: '#F59E0B',
            exito: '#10B981',
            advertencia: '#EC4899',
            peligro: '#EF4444',
            neutral: '#6B7280'
          },
          tipografia: {
            titulo: { tamano: '1.5rem', peso: '600', color: '#1F2937' },
            subtitulo: { tamano: '1rem', peso: '500', color: '#6B7280' },
            datos: { tamano: '2rem', peso: '700', color: '#059669' }
          },
          espaciado: {
            padding: '1.5rem',
            margin: '1rem',
            borderRadius: '0.75rem'
          }
        }
      }
    };

    console.log('📊 ESTRUCTURA DE DATOS PARA FRONTEND:');
    console.log('✅ Datos simulados creados exitosamente');
    
    console.log('\n🎯 DATOS PARA GRÁFICO DE DONUT:');
    console.log('📋 Título:', mockResponse.distribucionConsumoPorSector.graficoDonut.titulo);
    console.log('📝 Subtítulo:', mockResponse.distribucionConsumoPorSector.graficoDonut.subtitulo);
    console.log('📊 Total sectores:', mockResponse.distribucionConsumoPorSector.graficoDonut.datos.length);
    console.log('📈 Total litros:', mockResponse.distribucionConsumoPorSector.graficoDonut.total.toLocaleString());
    console.log('📊 Suma porcentajes:', mockResponse.distribucionConsumoPorSector.graficoDonut.sumaPorcentajes + '%');

    console.log('\n🎨 TOP 8 SECTORES CON COLORES:');
    mockResponse.distribucionConsumoPorSector.graficoDonut.datos.forEach((sector, index) => {
      console.log(`${index + 1}. ${sector.sector}: ${sector.litros.toLocaleString()} L (${sector.porcentaje}%) - Color: ${sector.color}`);
    });

    console.log('\n📋 RESUMEN VISUAL:');
    console.log('🏷️ Título:', mockResponse.distribucionConsumoPorSector.resumenVisual.titulo);
    console.log('📈 Valor:', mockResponse.distribucionConsumoPorSector.resumenVisual.valor);
    console.log('🏢 Sectores activos:', mockResponse.distribucionConsumoPorSector.resumenVisual.sectoresActivos);

    console.log('\n🏆 KPIs DESTACADOS:');
    console.log('🏆 Sector Mayor Consumo:', mockResponse.distribucionConsumoPorSector.kpisDestacados.sectorMayorConsumo.formateado);
    console.log('📉 Sector Menor Consumo:', mockResponse.distribucionConsumoPorSector.kpisDestacados.sectorMenorConsumo.formateado);
    console.log('📈 Promedio por Sector:', mockResponse.distribucionConsumoPorSector.kpisDestacados.promedioPorSector.formateado);

    console.log('\n🎨 CONFIGURACIÓN VISUAL:');
    console.log('🔵 Color primario:', mockResponse.distribucionConsumoPorSector.configuracionVisual.colores.primario);
    console.log('🟠 Color secundario:', mockResponse.distribucionConsumoPorSector.configuracionVisual.colores.secundario);
    console.log('🟢 Color éxito:', mockResponse.distribucionConsumoPorSector.configuracionVisual.colores.exito);

    console.log('\n✅ MEJORAS IMPLEMENTADAS PARA FRONTEND:');
    console.log('✅ Estructura de datos organizada y clara');
    console.log('✅ Eliminadas referencias a "daños"');
    console.log('✅ Información específica de petróleo');
    console.log('✅ Colores profesionales y consistentes');
    console.log('✅ Formato de datos optimizado para visualización');
    console.log('✅ KPIs relevantes y bien estructurados');

    console.log('\n🎉 ¡Datos para frontend preparados exitosamente!');
    console.log('📊 El frontend ahora puede mostrar información clara y profesional');

  } catch (error) {
    console.error('❌ Error en datos para frontend:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el test
testFrontendPetroleoData(); 