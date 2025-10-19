#!/bin/bash

echo "🚀 Script de Deploy Automático"
echo "==============================="

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo "🔍 Verificando dependências..."

if ! command_exists node; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm não encontrado."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"

# Testar build local primeiro
echo ""
echo "🏗️ Testando build local..."

# Backend
echo "📦 Testando build do backend..."
cd backend
if npm run build; then
    echo "✅ Build do backend OK"
else
    echo "❌ Falha no build do backend"
    exit 1
fi

# Frontend
echo "📦 Testando build do frontend..."
cd ../frontend
if npm run build; then
    echo "✅ Build do frontend OK"
else
    echo "❌ Falha no build do frontend"
    exit 1
fi

cd ..

echo ""
echo "🌐 Opções de Deploy:"
echo "1. Vercel (frontend) + Railway (backend) [Recomendado]"
echo "2. Railway (fullstack)"
echo "3. Render"
echo "4. Docker local"

read -p "Escolha uma opção (1-4): " option

case $option in
    1)
        echo "🎨 Deploy do Frontend no Vercel..."
        if command_exists vercel; then
            cd frontend
            vercel --prod
        else
            echo "⚠️ Vercel CLI não encontrado. Instalando..."
            npm install -g vercel
            cd frontend
            vercel --prod
        fi
        
        echo ""
        echo "🚂 Para o backend, acesse:"
        echo "1. https://railway.app"
        echo "2. Connect GitHub"
        echo "3. Select repository"
        echo "4. Root Directory: backend"
        echo "5. Deploy!"
        ;;
    2)
        echo "🚂 Para Railway fullstack:"
        echo "1. https://railway.app"
        echo "2. Connect GitHub"
        echo "3. Create two services:"
        echo "   - Backend (Root: backend)"
        echo "   - Frontend (Root: frontend)"
        ;;
    3)
        echo "🎨 Para Render:"
        echo "1. https://render.com"
        echo "2. Connect GitHub"
        echo "3. Use render.yaml configuration"
        ;;
    4)
        echo "🐳 Testando Docker local..."
        if command_exists docker; then
            docker-compose up --build
        else
            echo "❌ Docker não encontrado. Instale Docker primeiro."
        fi
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy iniciado! Verifique os logs das plataformas."
echo "📚 Para mais detalhes, consulte DEPLOY.md"