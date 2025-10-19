#!/bin/bash

# Script de deploy para Railway
echo "🚀 Iniciando deploy para Railway..."

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado. Instalando..."
    npm install -g @railway/cli
fi

# Login no Railway (será solicitado)
echo "🔐 Fazendo login no Railway..."
railway login

# Criar novo projeto (se não existir)
echo "📦 Criando/conectando projeto..."
railway init

# Deploy do backend
echo "🏗️ Fazendo deploy do backend..."
cd backend
railway up --detach

# Voltar para raiz e deploy do frontend
echo "🎨 Fazendo deploy do frontend..."
cd ../frontend
railway up --detach

echo "✅ Deploy concluído!"
echo "🌐 Acesse seu app em: https://railway.app/dashboard"