# Dockerfile para Railway - Backend
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copiar código do backend
COPY backend/ ./

# Build do backend
RUN npm run build

# Expor porta
EXPOSE 3002

# Comando para iniciar
CMD ["npm", "start"]