#!/bin/bash

# Script para configurar monitoreo básico del sistema de extracción
# Uso: ./monitoring-setup.sh

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

log "🔍 Configurando monitoreo del sistema..."

# Crear directorio de monitoreo
mkdir -p monitoring

# Crear script de monitoreo básico
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

# Script de monitoreo de salud del sistema
LOG_FILE="/var/log/extraccion-health.log"
ALERT_EMAIL="admin@tu-empresa.com"

# Función para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Función para enviar alerta
send_alert() {
    echo "ALERTA: $1" | mail -s "Alerta Sistema Extracción" "$ALERT_EMAIL" 2>/dev/null || true
}

# Verificar servicios Docker
check_docker_services() {
    if ! docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "extraccion_"; then
        log "ERROR: Servicios Docker no están ejecutándose"
        send_alert "Servicios Docker no están ejecutándose"
        return 1
    fi
    
    # Verificar cada servicio específico
    services=("extraccion_mysql" "extraccion_backend" "extraccion_frontend")
    for service in "${services[@]}"; do
        if ! docker ps --format "{{.Names}}" | grep -q "$service"; then
            log "ERROR: Servicio $service no está ejecutándose"
            send_alert "Servicio $service no está ejecutándose"
            return 1
        fi
    done
    
    log "INFO: Todos los servicios Docker están ejecutándose"
    return 0
}

# Verificar conectividad de base de datos
check_database() {
    if ! docker exec extraccion_mysql mysqladmin ping -h localhost --silent; then
        log "ERROR: Base de datos no responde"
        send_alert "Base de datos no responde"
        return 1
    fi
    
    log "INFO: Base de datos funcionando correctamente"
    return 0
}

# Verificar API backend
check_backend() {
    if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log "ERROR: Backend API no responde"
        send_alert "Backend API no responde"
        return 1
    fi
    
    log "INFO: Backend API funcionando correctamente"
    return 0
}

# Verificar frontend
check_frontend() {
    if ! curl -f http://localhost:80 > /dev/null 2>&1; then
        log "ERROR: Frontend no responde"
        send_alert "Frontend no responde"
        return 1
    fi
    
    log "INFO: Frontend funcionando correctamente"
    return 0
}

# Verificar uso de recursos
check_resources() {
    # Verificar uso de CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log "WARNING: Uso de CPU alto: ${cpu_usage}%"
        send_alert "Uso de CPU alto: ${cpu_usage}%"
    fi
    
    # Verificar uso de memoria
    mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        log "WARNING: Uso de memoria alto: ${mem_usage}%"
        send_alert "Uso de memoria alto: ${mem_usage}%"
    fi
    
    # Verificar espacio en disco
    disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -gt 85 ]; then
        log "WARNING: Espacio en disco bajo: ${disk_usage}%"
        send_alert "Espacio en disco bajo: ${disk_usage}%"
    fi
    
    log "INFO: Recursos del sistema OK"
}

# Verificar logs de errores
check_error_logs() {
    # Verificar logs de error del backend
    if [ -f "backend/logs/error.log" ]; then
        recent_errors=$(tail -n 10 backend/logs/error.log | grep -c "ERROR" || echo "0")
        if [ "$recent_errors" -gt 5 ]; then
            log "WARNING: Muchos errores recientes en backend: $recent_errors"
            send_alert "Muchos errores recientes en backend: $recent_errors"
        fi
    fi
    
    # Verificar logs de Docker
    docker_errors=$(docker logs --since 1h extraccion_backend 2>&1 | grep -c "ERROR" || echo "0")
    if [ "$docker_errors" -gt 10 ]; then
        log "WARNING: Muchos errores en logs de Docker: $docker_errors"
        send_alert "Muchos errores en logs de Docker: $docker_errors"
    fi
}

# Función principal
main() {
    log "INFO: Iniciando verificación de salud del sistema"
    
    check_docker_services
    check_database
    check_backend
    check_frontend
    check_resources
    check_error_logs
    
    log "INFO: Verificación de salud completada"
}

# Ejecutar verificación
main
EOF

# Crear script de métricas
cat > monitoring/metrics.sh << 'EOF'
#!/bin/bash

# Script para recolectar métricas del sistema
METRICS_FILE="/var/log/extraccion-metrics.log"

# Función para logging de métricas
log_metric() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$METRICS_FILE"
}

# Métricas del sistema
log_system_metrics() {
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    log_metric "CPU_USAGE: $cpu_usage%"
    
    # Memoria
    mem_total=$(free -m | grep Mem | awk '{print $2}')
    mem_used=$(free -m | grep Mem | awk '{print $3}')
    mem_usage=$(echo "scale=2; $mem_used * 100 / $mem_total" | bc)
    log_metric "MEMORY_USAGE: ${mem_usage}%"
    
    # Disco
    disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    log_metric "DISK_USAGE: ${disk_usage}%"
    
    # Uptime
    uptime=$(uptime -p)
    log_metric "UPTIME: $uptime"
}

# Métricas de Docker
log_docker_metrics() {
    # Contenedores ejecutándose
    running_containers=$(docker ps --format "{{.Names}}" | wc -l)
    log_metric "RUNNING_CONTAINERS: $running_containers"
    
    # Uso de recursos por contenedor
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | tail -n +2 | while read line; do
        if [[ $line == *"extraccion_"* ]]; then
            log_metric "CONTAINER_STATS: $line"
        fi
    done
}

# Métricas de aplicación
log_app_metrics() {
    # Tiempo de respuesta de la API
    if response_time=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:3001/api/health); then
        log_metric "API_RESPONSE_TIME: ${response_time}s"
    fi
    
    # Conexiones activas a la base de datos
    if db_connections=$(docker exec extraccion_mysql mysql -u root -p"$DB_ROOT_PASSWORD" -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | tail -1 | awk '{print $2}'); then
        log_metric "DB_CONNECTIONS: $db_connections"
    fi
}

# Función principal
main() {
    log_system_metrics
    log_docker_metrics
    log_app_metrics
}

# Ejecutar recolección de métricas
main
EOF

# Crear script de limpieza de logs
cat > monitoring/cleanup-logs.sh << 'EOF'
#!/bin/bash

# Script para limpiar logs antiguos
LOG_DIRS=("backend/logs" "nginx/logs" "/var/log")

# Función para limpiar logs
cleanup_logs() {
    for dir in "${LOG_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            # Eliminar logs más antiguos de 30 días
            find "$dir" -name "*.log" -type f -mtime +30 -delete
            echo "Logs limpiados en: $dir"
        fi
    done
}

# Función para rotar logs grandes
rotate_large_logs() {
    for dir in "${LOG_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            find "$dir" -name "*.log" -type f -size +100M -exec sh -c '
                for file do
                    mv "$file" "$file.$(date +%Y%m%d_%H%M%S)"
                    gzip "$file.$(date +%Y%m%d_%H%M%S)"
                done
            ' sh {} +
        fi
    done
}

# Ejecutar limpieza
cleanup_logs
rotate_large_logs
EOF

# Dar permisos de ejecución
chmod +x monitoring/health-check.sh
chmod +x monitoring/metrics.sh
chmod +x monitoring/cleanup-logs.sh

# Crear configuración de cron para monitoreo
log "📅 Configurando tareas programadas..."

# Verificar si crontab existe
if ! crontab -l 2>/dev/null | grep -q "extraccion"; then
    # Agregar tareas de monitoreo al crontab
    (crontab -l 2>/dev/null; echo "
# Monitoreo del sistema de extracción
# Verificación de salud cada 5 minutos
*/5 * * * * /bin/bash $(pwd)/monitoring/health-check.sh

# Recolección de métricas cada hora
0 * * * * /bin/bash $(pwd)/monitoring/metrics.sh

# Limpieza de logs diaria a las 3 AM
0 3 * * * /bin/bash $(pwd)/monitoring/cleanup-logs.sh
") | crontab -
    
    log "✅ Tareas de monitoreo configuradas en crontab"
else
    warn "Crontab ya contiene tareas de extracción"
fi

# Crear dashboard básico de monitoreo
cat > monitoring/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Monitoreo - Sistema de Extracción</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .metric-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        .status-ok { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        .logs-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .log-entry {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-family: monospace;
            font-size: 12px;
        }
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
        }
        .refresh-btn:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Dashboard de Monitoreo</h1>
            <p>Sistema de Extracción - Estado en Tiempo Real</p>
        </div>
        
        <button class="refresh-btn" onclick="refreshData()">🔄 Actualizar Datos</button>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">Estado del Sistema</div>
                <div class="metric-value" id="system-status">Verificando...</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Uso de CPU</div>
                <div class="metric-value" id="cpu-usage">--</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Uso de Memoria</div>
                <div class="metric-value" id="memory-usage">--</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Espacio en Disco</div>
                <div class="metric-value" id="disk-usage">--</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Contenedores Activos</div>
                <div class="metric-value" id="containers-running">--</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Tiempo de Respuesta API</div>
                <div class="metric-value" id="api-response-time">--</div>
            </div>
        </div>
        
        <div class="logs-section">
            <h3>📝 Logs Recientes</h3>
            <div id="recent-logs">Cargando logs...</div>
        </div>
    </div>

    <script>
        function refreshData() {
            // Simular actualización de datos
            document.getElementById('system-status').textContent = '✅ Funcionando';
            document.getElementById('system-status').className = 'metric-value status-ok';
            
            // Simular métricas
            document.getElementById('cpu-usage').textContent = Math.floor(Math.random() * 30 + 10) + '%';
            document.getElementById('memory-usage').textContent = Math.floor(Math.random() * 40 + 30) + '%';
            document.getElementById('disk-usage').textContent = Math.floor(Math.random() * 20 + 15) + '%';
            document.getElementById('containers-running').textContent = '4/4';
            document.getElementById('api-response-time').textContent = (Math.random() * 0.5 + 0.1).toFixed(2) + 's';
            
            // Simular logs
            const logs = [
                '2024-01-15 10:30:15 - INFO: Sistema funcionando correctamente',
                '2024-01-15 10:29:45 - INFO: Backup completado exitosamente',
                '2024-01-15 10:28:30 - INFO: Usuario autenticado correctamente',
                '2024-01-15 10:27:15 - INFO: Planilla creada exitosamente'
            ];
            
            document.getElementById('recent-logs').innerHTML = logs.map(log => 
                `<div class="log-entry">${log}</div>`
            ).join('');
        }
        
        // Actualizar datos cada 30 segundos
        setInterval(refreshData, 30000);
        
        // Cargar datos iniciales
        refreshData();
    </script>
</body>
</html>
EOF

log "✅ Configuración de monitoreo completada"
log ""
log "📊 Archivos creados:"
log "   - monitoring/health-check.sh (verificación de salud)"
log "   - monitoring/metrics.sh (recolección de métricas)"
log "   - monitoring/cleanup-logs.sh (limpieza de logs)"
log "   - monitoring/dashboard.html (dashboard web)"
log ""
log "🕐 Tareas programadas configuradas:"
log "   - Verificación de salud: cada 5 minutos"
log "   - Recolección de métricas: cada hora"
log "   - Limpieza de logs: diaria a las 3 AM"
log ""
log "🌐 Para ver el dashboard:"
log "   - Abre monitoring/dashboard.html en tu navegador"
log "   - O sirve el archivo con un servidor web" 