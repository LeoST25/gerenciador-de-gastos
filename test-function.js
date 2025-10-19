#!/usr/bin/env node

// Teste local da Netlify Function
const { handler } = require('./netlify/functions/api.js');

// Simular evento da Netlify
const event = {
  httpMethod: 'GET',
  path: '/health',
  headers: {
    'origin': 'https://gerenciador-de-gastos-frontend.netlify.app'
  },
  body: null,
  isBase64Encoded: false
};

const context = {
  callbackWaitsForEmptyEventLoop: false
};

console.log('🧪 Testando Netlify Function localmente...');

handler(event, context, (err, result) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    console.log('✅ Resultado:', result);
  }
});