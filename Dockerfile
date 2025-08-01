# Dockerfile para el sistema de extracción
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependencias
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copiar código fuente
COPY . .

# Construir frontend
RUN cd frontend && npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["cd", "backend", "&&", "npm", "start"] 