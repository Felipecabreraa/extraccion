import React, { useState } from 'react';
import axios from '../api/axios';
import { FaPlus, FaDownload, FaUpload, FaTrash } from 'react-icons/fa';

const CargaMasivaOperadores = () => {
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const agregarFila = () => {
    setOperadores([...operadores, { nombre: '', apellido: '' }]);
  };

  const eliminarFila = (index) => {
    const nuevasFilas = operadores.filter((_, i) => i !== index);
    setOperadores(nuevasFilas);
  };

  const actualizarFila = (index, campo, valor) => {
    const nuevasFilas = [...operadores];
    nuevasFilas[index][campo] = valor;
    setOperadores(nuevasFilas);
  };

  const descargarPlantilla = () => {
    const headers = ['Nombre', 'Apellido'];
    const csvContent = [headers.join(';')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_operadores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          const [nombre, apellido] = line.split(';').map(field => field.trim());
          if (nombre && apellido) {
            datos.push({ nombre, apellido });
          }
        }
      }

      setOperadores(datos);
      setMessage(`Se importaron ${datos.length} operadores`);
    };

    reader.readAsText(file);
  };

  const guardarDatos = async () => {
    if (operadores.length === 0) {
      setMessage('No hay operadores para guardar');
      return;
    }

    // Validar que todos los campos estén llenos
    const operadoresValidos = operadores.filter(op => op.nombre.trim() && op.apellido.trim());
    
    if (operadoresValidos.length !== operadores.length) {
      setMessage('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/operadores/carga-masiva', {
        operadores: operadoresValidos
      });

      setMessage(response.data.message);
      setOperadores([]);
    } catch (error) {
      console.error('Error al guardar operadores:', error);
      setMessage(error.response?.data?.message || 'Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Carga Masiva de Operadores</h2>
      
      <p className="text-gray-600 mb-6">
        Agrega operadores al sistema. Los campos Nombre y Apellido son obligatorios. 
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
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Datos'}
        </button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('Error') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {message}
        </div>
      )}

      {/* Tabla de datos */}
      {operadores.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-2 border-b text-left font-semibold text-gray-700">Apellido</th>
                <th className="px-4 py-2 border-b text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((operador, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={operador.nombre}
                      onChange={(e) => actualizarFila(index, 'nombre', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre"
                    />
                  </td>
                  <td className="px-4 py-2 border-b">
                    <input
                      type="text"
                      value={operador.apellido}
                      onChange={(e) => actualizarFila(index, 'apellido', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Apellido"
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

      {operadores.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay operadores agregados. Haz clic en "Agregar Fila" para comenzar.
        </div>
      )}
    </div>
  );
};

export default CargaMasivaOperadores; 