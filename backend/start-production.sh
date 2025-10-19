#!/bin/bash

echo "🚀 Inicializando aplicação para produção..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Executar migrations
echo "🗄️ Executando migrations do banco..."
npm run db:migrate

# Build da aplicação
echo "🏗️ Fazendo build..."
npm run build

# Iniciar aplicação
echo "✅ Iniciando servidor..."
npm start