import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaUpload, FaTrash } from 'react-icons/fa';
import axios from '../api/axios';

// Simulación de zonas (reemplaza por fetch real si tienes API)
const ZONAS = [
  { id: 1, nombre: 'ZONA 1' },
  { id: 2, nombre: 'ZONA 2' },
  { id: 3, nombre: 'ZONA 3' }
];

export default function CargaMasivaSectoresEditable() {
  const [zonaId, setZonaId] = useState('');
  const [filas, setFilas] = useState([]);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [erroresDetalle, setErroresDetalle] = useState([]);
  const [sectoresExistentes, setSectoresExistentes] = useState([]);

  // Consultar sectores existentes al cambiar zona
  useEffect(() => {
    if (zonaId) {
      axios.get(`/sectores?zona_id=${zonaId}`)
        .then(res => setSectoresExistentes(res.data.map(s => s.nombre.trim().toLowerCase())))
        .catch(() => setSectoresExistentes([]));
    } else {
      setSectoresExistentes([]);
    }
  }, [zonaId]);

  // Agregar fila vacía
  const agregarFila = () => {
    setFilas([...filas, { nombre: '', comuna: '', mt2: '', cantidad_pabellones: '' }]);
    setErrores([]);
    setMensaje('');
  };

  // Eliminar fila
  const eliminarFila = (idx) => {
    setFilas(filas.filter((_, i) => i !== idx));
    setErrores([]);
    setMensaje('');
  };

  // Editar celda
  const editarCelda = (idx, key, valor) => {
    const nuevas = [...filas];
    nuevas[idx][key] = valor;
    setFilas(nuevas);
    setErrores([]);
    setMensaje('');
  };

  // Limpia los campos de texto de cada fila
  const limpiarFilas = (filas) => filas.map(fila => ({
    ...fila,
    nombre: fila.nombre ? fila.nombre.trim() : '',
    comuna: fila.comuna ? fila.comuna.trim() : '',
  }));

  // Validación robusta (usando filas limpias)
  const validar = () => {
    let esValido = true;
    const filasLimpias = limpiarFilas(filas);
    const nuevosErrores = filasLimpias.map((fila, idx) => {
      let err = '';
      if (!fila.nombre) err += 'Nombre vacío. ';
      if (!fila.comuna) err += 'Comuna vacía. ';
      if (!fila.mt2 || isNaN(Number(fila.mt2)) || Number(fila.mt2) <= 0) err += 'Mt2 debe ser numérico y mayor a 0. ';
      if (!fila.cantidad_pabellones || isNaN(Number(fila.cantidad_pabellones)) || Number(fila.cantidad_pabellones) <= 0) err += 'Cantidad Pabellones debe ser numérico y mayor a 0. ';
      // Duplicados en la tabla
      const nombreNormalizado = fila.nombre.toLowerCase();
      if (filasLimpias.filter(f => f.nombre.toLowerCase() === nombreNormalizado).length > 1) err += 'Nombre duplicado en la tabla. ';
      // Duplicados en la base de datos
      if (sectoresExistentes.includes(nombreNormalizado)) err += 'Ya existe en la base de datos. ';
      if (err) esValido = false;
      return err;
    });
    setErrores(nuevosErrores);
    if (!zonaId) {
      setMensaje('Debes seleccionar una zona.');
      esValido = false;
    }
    return esValido;
  };

  // Descargar plantilla CSV
  const descargarPlantilla = () => {
    const headers = ['Nombre', 'Comuna', 'Mt2', 'Cantidad Pabellones'];
    const csvContent = [headers.join(';')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_sectores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMensaje('Plantilla CSV descargada correctamente.');
  };

  // Importar archivo CSV
  const importarArchivo = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const datos = [];

      // Saltar la primera línea (encabezados)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [nombre, comuna, mt2, cantidad_pabellones] = line.split(';').map(field => field.trim());
          if (nombre && comuna && mt2 && cantidad_pabellones) {
            datos.push({ nombre, comuna, mt2, cantidad_pabellones });
          }
        }
      }

      setFilas([...filas, ...datos]);
      setMensaje(`Se importaron ${datos.length} sectores`);
    };

    reader.readAsText(file);
  };

  // Guardar datos en backend solo si todo es válido
  const guardarDatos = async () => {
    if (!zonaId) {
      setMensaje('Debes seleccionar una zona antes de guardar.');
      return;
    }
    
    if (!validar()) {
      setMensaje('Corrige los errores antes de guardar.');
      return;
    }
    setGuardando(true);
    setMensaje('');
    setErrores([]);
    setErroresDetalle([]);
    
    // Filtrar filas válidas y nuevas, y limpiar antes de enviar
    const filasLimpias = limpiarFilas(filas);
    const filasValidas = filasLimpias.filter((fila, idx) => {
      const nombreNormalizado = fila.nombre.toLowerCase();
      return !errores[idx] && !sectoresExistentes.includes(nombreNormalizado);
    });
    
    if (filasValidas.length === 0) {
      setMensaje('No hay sectores nuevos y válidos para guardar.');
      setGuardando(false);
      return;
    }

    try {
      // Enviar zona_id separado de los sectores
      const response = await axios.post('/sectores/carga-masiva', {
        sectores: filasValidas,
        zona_id: zonaId
      });

      // Manejar respuesta exitosa
      setMensaje(response.data.message);
      
      // Si hay errores en la respuesta, mostrarlos
      if (response.data.resultados && response.data.resultados.errores && response.data.resultados.errores.length > 0) {
        const erroresTexto = response.data.resultados.errores.map(err => 
          `${err.sector?.nombre || 'Sector'}: ${err.error}`
        );
        setErroresDetalle(erroresTexto);
      }
      
      // Limpiar formulario solo si todos fueron exitosos
      if (response.data.resultados && response.data.resultados.exitosos.length === filasValidas.length) {
        setFilas([]);
        setErrores([]);
        setErroresDetalle([]);
      }
      
    } catch (error) {
      console.error('Error al guardar sectores:', error);
      
      // Manejar errores de red o servidor
      if (error.response?.data?.resultados?.errores) {
        const erroresTexto = error.response.data.resultados.errores.map(err => 
          `${err.sector?.nombre || 'Sector'}: ${err.error}`
        );
        setErroresDetalle(erroresTexto);
        setMensaje(error.response.data.message || 'Algunos sectores no se pudieron guardar. Revisa los errores.');
      } else {
        setMensaje(error.response?.data?.message || 'Error al guardar los datos');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Carga Masiva de Sectores</h2>
      
      <p className="text-gray-600 mb-6">
        Agrega sectores al sistema. Los campos Nombre, Comuna, Mt2 y Cantidad Pabellones son obligatorios. 
        Descarga la plantilla para ver el formato correcto.
      </p>

      {/* Selector de Zona */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Zona:
        </label>
        <select
          value={zonaId}
          onChange={(e) => setZonaId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona una zona</option>
          {ZONAS.map(zona => (
            <option key={zona.id} value={zona.id}>
              {zona.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={agregarFila}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
        >
          <FaPlus /> Agregar Fila
        </button>
        
        <button
          onClick={descargarPlantilla}
          className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
        >
          <FaDownload /> Descargar Plantilla
        </button>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors cursor-pointer">
          <FaUpload /> Importar Excel/CSV
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={importarArchivo}
            className="hidden"
          />
        </label>
        
        <button
          onClick={guardarDatos}
          disabled={guardando}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar Datos'}
        </button>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`p-3 rounded mb-4 ${
          mensaje.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {mensaje}
        </div>
      )}

      {/* Tabla de datos */}
      {filas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Comuna</th>
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Mt2</th>
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Cantidad Pabellones</th>
                <th className="px-4 py-2 border-b text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, index) => (
                <tr key={index} className={`hover:bg-gray-50 ${errores[index] ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={fila.nombre}
                      onChange={(e) => editarCelda(index, 'nombre', e.target.value)}
                      className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores[index] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nombre"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={fila.comuna}
                      onChange={(e) => editarCelda(index, 'comuna', e.target.value)}
                      className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores[index] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Comuna"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={fila.mt2}
                      onChange={(e) => editarCelda(index, 'mt2', e.target.value)}
                      className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores[index] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Mt2"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="number"
                      value={fila.cantidad_pabellones}
                      onChange={(e) => editarCelda(index, 'cantidad_pabellones', e.target.value)}
                      className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errores[index] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Cantidad Pabellones"
                    />
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => eliminarFila(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar fila"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Errores detallados */}
      {erroresDetalle.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 mb-2">Errores detallados:</h4>
          <ul className="text-sm text-red-700">
            {erroresDetalle.map((error, idx) => (
              <li key={idx}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {filas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay sectores agregados. Haz clic en "Agregar Fila" para comenzar.
        </div>
      )}
    </div>
  );
} 