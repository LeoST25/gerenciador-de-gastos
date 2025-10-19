#!/bin/bash

echo "🚀 GERENCIADOR DE GASTOS COM IA - SCRIPT DE DEMONSTRAÇÃO"
echo "========================================================="
echo ""

echo "📦 1. Instalando dependências do backend..."
cd backend && npm install
echo "✅ Backend dependencies instaladas!"
echo ""

echo "📦 2. Instalando dependências do frontend..."
cd ../frontend && npm install
echo "✅ Frontend dependencies instaladas!"
echo ""

echo "🔨 3. Testando build do backend..."
cd ../backend && npm run build
echo "✅ Backend build concluído!"
echo ""

echo "🔨 4. Testando build do frontend..."
cd ../frontend && npm run build
echo "✅ Frontend build concluído!"
echo ""

echo "🎯 PRÓXIMOS PASSOS:"
echo "==================="
echo ""
echo "1. 🔑 Configure suas chaves de IA no backend/.env:"
echo "   - OPENAI_API_KEY=sua_chave_aqui"
echo "   - GEMINI_API_KEY=sua_chave_aqui"
echo ""
echo "2. 🚀 Execute os servidores:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "3. 🌐 Acesse: http://localhost:3000"
echo ""
echo "4. 📱 Teste as funcionalidades:"
echo "   - Dashboard financeiro"
echo "   - Registro de transações"
echo "   - Insights com IA"
echo ""
echo "✨ PROJETO PRONTO PARA USO!"