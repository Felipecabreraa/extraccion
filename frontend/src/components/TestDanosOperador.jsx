import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const TestDanosOperador = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 Probando API de daños por operador...');
      
      const response = await axios.get('/dashboard/danos/test-por-operador?year=2025');
      console.log('✅ Respuesta exitosa:', response.data);
      setData(response.data);
    } catch (err) {
      console.error('❌ Error en prueba:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Prueba de API - Daños por Operador</h2>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Probando...' : 'Probar API'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="font-bold text-red-800">Error:</h3>
          <p className="text-red-700">{error.message}</p>
          {error.status && <p className="text-red-700">Status: {error.status}</p>}
          {error.data && (
            <pre className="text-red-700 text-sm mt-2">
              {JSON.stringify(error.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      {data && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800">Respuesta exitosa:</h3>
          <pre className="text-green-700 text-sm mt-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestDanosOperador; 