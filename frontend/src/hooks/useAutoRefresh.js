import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar actualización automática de datos
 * @param {Function} fetchFunction - Función que obtiene los datos
 * @param {number} intervalMs - Intervalo en milisegundos (default: 30000)
 * @param {boolean} enabled - Si la actualización automática está habilitada
 * @param {Array} dependencies - Dependencias para la función fetch
 * @param {Array} eventTypes - Tipos de eventos que deben disparar actualización
 * @returns {Object} - Estado y funciones de control
 */
export const useAutoRefresh = (fetchFunction, intervalMs = 30000, enabled = true, dependencies = [], eventTypes = ['*']) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(enabled);
  const [updateCount, setUpdateCount] = useState(0);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Función de actualización con manejo de cancelación
  const refreshData = useCallback(async (showLoading = false, reason = 'manual') => {
    try {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      
      if (showLoading) {
        setIsRefreshing(true);
      }
      
      console.log(`🔄 Actualizando datos - Razón: ${reason}`);
      await fetchFunction(showLoading, abortControllerRef.current.signal);
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      
    } catch (err) {
      // No mostrar error si fue cancelado intencionalmente
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('🔄 Request cancelado - nueva llamada en progreso');
        return;
      }
      console.error('Error en auto-refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFunction, ...dependencies]);

  // Configurar intervalo de actualización automática
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Limpiar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Configurar nuevo intervalo
    intervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refresh: Actualizando datos...');
      refreshData(false, 'auto-refresh');
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, intervalMs, refreshData]);

  // Escuchar eventos de actualización desde otras páginas
  useEffect(() => {
    const handleDataUpdated = (event) => {
      const { type, action, id, source } = event.detail;
      console.log('📡 Evento de actualización recibido:', event.detail);
      
      // Verificar si este componente debe responder a este tipo de evento
      const shouldUpdate = eventTypes.includes('*') || eventTypes.includes(type);
      
      if (shouldUpdate) {
        console.log(`✅ Actualizando por evento: ${type} - ${action}`);
        refreshData(false, `event-${type}-${action}`);
      } else {
        console.log(`⏭️ Ignorando evento: ${type} (no está en la lista de tipos permitidos)`);
      }
    };

    window.addEventListener('dataUpdated', handleDataUpdated);

    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdated);
    };
  }, [refreshData, eventTypes]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
  }, []);

  const manualRefresh = useCallback(() => {
    refreshData(false, 'manual');
  }, [refreshData]);

  return {
    isRefreshing,
    lastUpdate,
    autoRefreshEnabled,
    updateCount,
    refreshData,
    manualRefresh,
    toggleAutoRefresh
  };
};

/**
 * Hook para emitir eventos de actualización
 */
export const useEmitUpdate = () => {
  const emitUpdate = useCallback((data = {}) => {
    const event = new CustomEvent('dataUpdated', {
      detail: {
        timestamp: new Date().toISOString(),
        source: 'frontend',
        ...data
      }
    });
    window.dispatchEvent(event);
    console.log('📡 Evento de actualización emitido:', event.detail);
  }, []);

  return { emitUpdate };
};

/**
 * Hook para emitir eventos específicos de planillas
 */
export const useEmitPlanillaUpdate = () => {
  const { emitUpdate } = useEmitUpdate();
  
  const emitPlanillaUpdate = useCallback((action, planillaId, additionalData = {}) => {
    emitUpdate({
      type: 'planilla',
      action,
      id: planillaId,
      ...additionalData
    });
  }, [emitUpdate]);

  return { emitPlanillaUpdate };
};

/**
 * Hook para emitir eventos específicos de daños
 */
export const useEmitDanoUpdate = () => {
  const { emitUpdate } = useEmitUpdate();
  
  const emitDanoUpdate = useCallback((action, danoId, planillaId, additionalData = {}) => {
    emitUpdate({
      type: 'dano',
      action,
      id: danoId,
      planillaId,
      ...additionalData
    });
  }, [emitUpdate]);

  return { emitDanoUpdate };
};

/**
 * Hook para emitir eventos específicos de metros superficie
 */
export const useEmitMetrosUpdate = () => {
  const { emitUpdate } = useEmitUpdate();
  
  const emitMetrosUpdate = useCallback((action, registroId, additionalData = {}) => {
    emitUpdate({
      type: 'metros_superficie',
      action,
      id: registroId,
      ...additionalData
    });
  }, [emitUpdate]);

  return { emitMetrosUpdate };
}; 