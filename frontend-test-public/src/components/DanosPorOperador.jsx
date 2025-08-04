import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { FaChartBar, FaUsers, FaExclamationTriangle, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  success: '#22C55E',
  hembra: '#EC4899',
  macho: '#3B82F6'
};

const DanosPorOperador = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/dashboard/danos/test-por-operador?year=${selectedYear}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">No hay datos disponibles</p>
      </div>
    );
  }

  const { 
    resumenAnualTipo = { HEMBRA: { total: 0, meses: {} }, MACHO: { total: 0, meses: {} } },
    operadoresMensuales = [],
    topOperadores = [],
    totalesAnuales = {
      totalOperadores: 0,
      totalDanos: 0,
      cantidadTotalDanos: 0,
      promedioDanosPorOperador: 0
    },
    nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic']
  } = data || {};

  // Preparar datos para gráficos
  const datosResumenAnual = [
    { name: 'HEMBRA', value: resumenAnualTipo.HEMBRA.total, color: COLORS.hembra },
    { name: 'MACHO', value: resumenAnualTipo.MACHO.total, color: COLORS.macho }
  ];

  const datosMensuales = nombresMeses.map((mes, index) => ({
    mes: mes,
    HEMBRA: resumenAnualTipo.HEMBRA.meses[index + 1] || 0,
    MACHO: resumenAnualTipo.MACHO.meses[index + 1] || 0,
    Total: (resumenAnualTipo.HEMBRA.meses[index + 1] || 0) + (resumenAnualTipo.MACHO.meses[index + 1] || 0)
  }));

  // Debug: Verificar datos de topOperadores
  console.log('Top Operadores raw data:', topOperadores);
  
  const datosTopOperadores = topOperadores.slice(0, 10).map((op, index) => {
    const operador = {
      name: op.nombreCompleto || 'Sin nombre',
      totalDanos: op.cantidadTotalDanos || op.totalDanos || 0,
      rank: index + 1
    };
    console.log(`Operador ${index + 1}:`, operador);
    return operador;
  });

  // Función para determinar el color del indicador
  const getStatusColor = (value) => {
    if (value === 0) return 'green';
    if (value <= 5) return 'green';
    if (value <= 10) return 'orange';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daños por Operador</h1>
            <p className="text-gray-600">Análisis detallado de daños por operador y zona</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <FaUsers className="text-2xl mr-3" />
              <div>
                <p className="text-sm opacity-90">Operadores con Daños</p>
                <p className="text-2xl font-bold">{totalesAnuales.totalOperadores}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-2xl mr-3" />
              <div>
                <p className="text-sm opacity-90">Total Daños</p>
                <p className="text-2xl font-bold">{totalesAnuales.totalDanos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <FaChartBar className="text-2xl mr-3" />
              <div>
                <p className="text-sm opacity-90">Promedio por Operador</p>
                <p className="text-2xl font-bold">{totalesAnuales.promedioDanosPorOperador}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center">
              <FaCalendarAlt className="text-2xl mr-3" />
              <div>
                <p className="text-sm opacity-90">Año {selectedYear}</p>
                <p className="text-2xl font-bold">{resumenAnualTipo.HEMBRA.total + resumenAnualTipo.MACHO.total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Anual */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen Anual {selectedYear}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Torta */}
          <div>
            <h3 className="text-lg font-medium mb-4">Distribución por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosResumenAnual}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosResumenAnual.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de Resumen */}
          <div>
            <h3 className="text-lg font-medium mb-4">Desglose Mensual</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    {nombresMeses.map(mes => (
                      <th key={mes} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {mes}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-medium text-pink-600">HEMBRA</td>
                    {nombresMeses.map((mes, index) => {
                      const value = resumenAnualTipo.HEMBRA.meses[index + 1] || 0;
                      return (
                        <td key={mes} className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">{value}</span>
                            <div className={`w-3 h-3 rounded-full bg-${getStatusColor(value)}-500`}></div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-bold text-pink-600">
                      {resumenAnualTipo.HEMBRA.total}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-blue-600">MACHO</td>
                    {nombresMeses.map((mes, index) => {
                      const value = resumenAnualTipo.MACHO.meses[index + 1] || 0;
                      return (
                        <td key={mes} className="px-2 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">{value}</span>
                            <div className={`w-3 h-3 rounded-full bg-${getStatusColor(value)}-500`}></div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-bold text-blue-600">
                      {resumenAnualTipo.MACHO.total}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-bold">TOTAL</td>
                    {nombresMeses.map((mes, index) => {
                      const value = (resumenAnualTipo.HEMBRA.meses[index + 1] || 0) + (resumenAnualTipo.MACHO.meses[index + 1] || 0);
                      return (
                        <td key={mes} className="px-2 py-2 text-center font-bold">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">{value}</span>
                            <div className={`w-3 h-3 rounded-full bg-${getStatusColor(value)}-500`}></div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center font-bold text-gray-900">
                      {resumenAnualTipo.HEMBRA.total + resumenAnualTipo.MACHO.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Evolución Mensual */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Evolución Mensual</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={datosMensuales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="HEMBRA" stackId="1" stroke={COLORS.hembra} fill={COLORS.hembra} />
            <Area type="monotone" dataKey="MACHO" stackId="1" stroke={COLORS.macho} fill={COLORS.macho} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Operadores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <FaTrophy className="text-yellow-500 text-xl mr-2" />
          <h2 className="text-xl font-semibold">Top 10 Operadores</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={datosTopOperadores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalDanos" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla Detallada por Operador */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Detalle por Operador</h2>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">Indicadores:</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700">0-5 daños</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-700">6-10 daños</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">11+ daños</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                {nombresMeses.map(mes => (
                  <th key={mes} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {mes}
                  </th>
                ))}
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {operadoresMensuales.slice(0, 20).map((operador, index) => (
                <tr key={operador.nombre} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 font-medium text-gray-900">{operador.nombre}</td>
                  <td className="px-2 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      operador.tipoZona === 'HEMBRA' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {operador.tipoZona}
                    </span>
                  </td>
                  {nombresMeses.map((mes, mesIndex) => {
                    const value = operador.meses[mesIndex + 1] || 0;
                    return (
                      <td key={mes} className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-1">{value}</span>
                          <div className={`w-3 h-3 rounded-full bg-${getStatusColor(value)}-500`}></div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-center font-bold text-gray-900">
                    {operador.totalAnual}
                  </td>
                </tr>
              ))}
              
              {/* Fila de Total General */}
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td className="px-4 py-3 font-bold text-gray-900 text-lg">TOTAL GENERAL</td>
                <td className="px-2 py-3 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    TODOS
                  </span>
                </td>
                {nombresMeses.map((mes, mesIndex) => {
                  const totalMes = operadoresMensuales.reduce((sum, operador) => {
                    return sum + (operador.meses[mesIndex + 1] || 0);
                  }, 0);
                  return (
                    <td key={mes} className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-1 font-bold text-lg">{totalMes}</span>
                        <div className={`w-4 h-4 rounded-full bg-${getStatusColor(totalMes)}-500`}></div>
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center font-bold text-gray-900 text-lg">
                  {operadoresMensuales.reduce((sum, operador) => sum + (operador.totalAnual || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DanosPorOperador; 