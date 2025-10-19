# Multi-stage build para Railway - Backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY backend/package*.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Copiar código fonte
COPY backend/ ./

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:18-alpine AS production

# Instalar curl para health check
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package.json e package-lock.json
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar package.json para produção
COPY backend/package.json ./package.json

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Alterar ownership dos arquivos para o usuário nodejs
RUN chown -R backend:nodejs /app
USER backend

# Expor porta
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Comando para iniciar
CMD ["npm", "start"]