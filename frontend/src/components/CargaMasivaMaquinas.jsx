import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaUpload, FaTrash } from 'react-icons/fa';
import axios from '../api/axios';

export default function CargaMasivaMaquinas() {
  const [filas, setFilas] = useState([]);
  const [errores, setErrores] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [erroresDetalle, setErroresDetalle] = useState([]);
  const [maquinasExistentes, setMaquinasExistentes] = useState([]);

  // Consultar máquinas existentes
  useEffect(() => {
    axios.get('/maquinas')
      .then(res => setMaquinasExistentes(res.data.map(m => m.numero.trim().toLowerCase())))
      .catch(() => setMaquinasExistentes([]));
  }, []);

  // Agregar fila vacía
  const agregarFila = () => {
    setFilas([...filas, { numero: '', marca: '', modelo: '' }]);
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
    numero: fila.numero ? fila.numero.trim() : '',
    marca: fila.marca ? fila.marca.trim() : '',
    modelo: fila.modelo ? fila.modelo.trim() : ''
  }));

  // Validación robusta (usando filas limpias)
  const validar = () => {
    let esValido = true;
    const filasLimpias = limpiarFilas(filas);
    const nuevosErrores = filasLimpias.map((fila, idx) => {
      let err = '';
      if (!fila.numero) err += 'Número vacío. ';
      if (!fila.marca) err += 'Marca vacía. ';
      if (!fila.modelo) err += 'Modelo vacío. ';
      
      // Validar longitud máxima
      if (fila.numero && fila.numero.length > 50) err += 'Número excede 50 caracteres. ';
      if (fila.marca && fila.marca.length > 50) err += 'Marca excede 50 caracteres. ';
      if (fila.modelo && fila.modelo.length > 50) err += 'Modelo excede 50 caracteres. ';
      
      // Duplicados en la tabla
      const identificador = fila.numero.toLowerCase();
      if (filasLimpias.filter(f => f.numero.toLowerCase() === identificador).length > 1) {
        err += 'Máquina duplicada en la tabla. ';
      }
      
      // Duplicados en la base de datos
      if (maquinasExistentes.includes(identificador)) {
        err += 'Ya existe en la base de datos. ';
      }
      
      if (err) esValido = false;
      return err;
    });
    setErrores(nuevosErrores);
    return esValido;
  };

  // Descargar plantilla CSV
  const descargarPlantilla = () => {
    const headers = ['Número', 'Marca', 'Modelo'];
    const csvContent = [headers.join(';')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_maquinas.csv');
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
          const [numero, marca, modelo] = line.split(';').map(field => field.trim());
          if (numero && marca && modelo) {
            datos.push({ numero, marca, modelo });
          }
        }
      }

      setFilas([...filas, ...datos]);
      setMensaje(`Se importaron ${datos.length} máquinas`);
    };

    reader.readAsText(file);
  };

  // Guardar datos en backend solo si todo es válido
  const guardarDatos = async () => {
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
      const identificador = fila.numero.toLowerCase();
      return !errores[idx] && !maquinasExistentes.includes(identificador);
    });
    
    if (filasValidas.length === 0) {
      setMensaje('No hay máquinas nuevas y válidas para guardar.');
      setGuardando(false);
      return;
    }

    try {
      const response = await axios.post('/maquinas/carga-masiva', {
        maquinas: filasValidas
      });

      // Manejar respuesta exitosa
      setMensaje(response.data.message);
      
      // Si hay errores en la respuesta, mostrarlos
      if (response.data.resultados && response.data.resultados.errores && response.data.resultados.errores.length > 0) {
        const erroresTexto = response.data.resultados.errores.map(err => 
          `${err.maquina?.numero || 'Máquina'}: ${err.error}`
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
      console.error('Error al guardar máquinas:', error);
      
      // Manejar errores de red o servidor
      if (error.response?.data?.resultados?.errores) {
        const erroresTexto = error.response.data.resultados.errores.map(err => 
          `${err.maquina?.numero || 'Máquina'}: ${err.error}`
        );
        setErroresDetalle(erroresTexto);
        setMensaje(error.response.data.message || 'Algunas máquinas no se pudieron guardar. Revisa los errores.');
      } else {
        setMensaje(error.response?.data?.message || 'Error al guardar los datos');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Carga Masiva de Máquinas</h2>
      
      <p className="text-gray-600 mb-6">
        Agrega máquinas al sistema. Los campos Número, Marca y Modelo son obligatorios. 
        Descarga la plantilla para ver el formato correcto.
      </p>

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
          disabled={guardando || filas.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar Datos'}
        </button>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`p-3 mb-4 rounded ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensaje}
        </div>
      )}

      {/* Tabla de datos */}
      {filas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left">Número</th>
                <th className="px-4 py-2 border-b text-left">Marca</th>
                <th className="px-4 py-2 border-b text-left">Modelo</th>
                <th className="px-4 py-2 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, idx) => (
                <tr key={idx} className={errores[idx] ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={fila.numero}
                      onChange={(e) => editarCelda(idx, 'numero', e.target.value)}
                      className={`w-full p-1 border rounded ${errores[idx] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ej: 001"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={fila.marca}
                      onChange={(e) => editarCelda(idx, 'marca', e.target.value)}
                      className={`w-full p-1 border rounded ${errores[idx] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ej: Toyota"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={fila.modelo}
                      onChange={(e) => editarCelda(idx, 'modelo', e.target.value)}
                      className={`w-full p-1 border rounded ${errores[idx] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ej: Hilux 2020"
                    />
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => eliminarFila(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Errores detallados */}
          {errores.some(err => err) && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-600 mb-2">Errores encontrados:</h4>
              {errores.map((error, idx) => (
                error && (
                  <div key={idx} className="text-red-600 text-sm mb-1">
                    <strong>Fila {idx + 1}:</strong> {error}
                  </div>
                )
              ))}
            </div>
          )}

          {/* Errores del servidor */}
          {erroresDetalle.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-600 mb-2">Errores del servidor:</h4>
              {erroresDetalle.map((error, idx) => (
                <div key={idx} className="text-red-600 text-sm mb-1">
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {filas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay máquinas agregadas. Haz clic en "Agregar Fila" para comenzar.</p>
        </div>
      )}
    </div>
  );
} 