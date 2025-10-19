#!/usr/bin/env node

/**
 * Script de verificação pós-deploy
 * Verifica se frontend e backend estão funcionando corretamente
 */

const https = require('https');
const http = require('http');

// URLs de produção (substitua pelas suas)
const FRONTEND_URL = 'https://gerenciador-gastos-frontend.vercel.app';
const BACKEND_URL = 'https://gerenciador-backend-production-xxxx.up.railway.app';

console.log('🔍 Verificando Deploy...\n');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, callback) {
  const protocol = url.startsWith('https:') ? https : http;
  
  protocol.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => callback(null, res.statusCode, data));
  }).on('error', (err) => callback(err));
}

// Teste 1: Frontend
console.log('1️⃣ Testando Frontend...');
makeRequest(FRONTEND_URL, (err, status, data) => {
  if (err) {
    console.log('❌ Frontend com erro:', err.message);
  } else if (status === 200) {
    console.log('✅ Frontend OK (Status 200)');
  } else {
    console.log('⚠️ Frontend retornou status:', status);
  }
  
  // Teste 2: Backend Health
  console.log('\n2️⃣ Testando Backend Health...');
  makeRequest(`${BACKEND_URL}/api/health`, (err, status, data) => {
    if (err) {
      console.log('❌ Backend com erro:', err.message);
    } else if (status === 200) {
      console.log('✅ Backend Health OK (Status 200)');
      try {
        const health = JSON.parse(data);
        console.log('   📊 Status:', health.status);
        console.log('   🔗 Database:', health.database);
      } catch (e) {
        console.log('   📄 Resposta:', data.substring(0, 100));
      }
    } else {
      console.log('⚠️ Backend Health retornou status:', status);
    }
    
    // Teste 3: Backend API
    console.log('\n3️⃣ Testando Backend API...');
    makeRequest(`${BACKEND_URL}/api/transactions`, (err, status, data) => {
      if (err) {
        console.log('❌ Backend API com erro:', err.message);
      } else if (status === 401) {
        console.log('✅ Backend API OK (Status 401 - Auth necessário)');
      } else if (status === 200) {
        console.log('✅ Backend API OK (Status 200)');
      } else {
        console.log('⚠️ Backend API retornou status:', status);
      }
      
      console.log('\n🎉 Verificação completa!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Acesse o frontend e teste o login');
      console.log('2. Crie algumas transações');
      console.log('3. Teste os AI Insights');
      console.log('4. Verifique os gráficos');
    });
  });
});