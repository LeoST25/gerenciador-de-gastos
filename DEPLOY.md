# 🚀 Deploy - Gerenciador de Gastos

Este documento contém instruções para fazer deploy da aplicação em várias plataformas gratuitas.

## 📋 Pré-requisitos

- Node.js 18+
- Git
- Conta nas plataformas de deploy

## 🌐 Opções de Deploy Gratuito

### 1. Railway 🚂 (Recomendado)

**Vantagens:** Fácil setup, PostgreSQL gratuito, domínio automático

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy automático
./deploy-railway.sh
```

**Configuração manual:**
1. Acesse [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Selecione o repositório `gerenciador-de-gastos`
4. Configure variáveis de ambiente
5. Deploy automático

### 2. Vercel (Frontend) + Railway (Backend) 🔗

**Frontend no Vercel:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Backend no Railway:** (veja acima)

### 3. Render 🎨

1. Acesse [render.com](https://render.com)
2. Conecte GitHub
3. Use o arquivo `render.yaml` incluído
4. Configure variáveis de ambiente

### 4. Netlify (Frontend) + Railway (Backend) 🌐

**Frontend:**
1. Conecte GitHub no [netlify.com](https://netlify.com)
2. Selecione repositório
3. Build: `cd frontend && npm run build`
4. Publish: `frontend/dist`

## ⚙️ Variáveis de Ambiente

### Backend
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=sua_chave_secreta_super_segura
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Frontend
```env
VITE_API_URL=https://seu-backend.railway.app
```

## 🐳 Deploy com Docker

```bash
# Build e run local
docker-compose up --build

# Deploy em plataformas que suportam Docker
# (Railway, Render, Heroku)
```

## 🔧 Configuração de Produção

### 1. Database
- SQLite em desenvolvimento
- PostgreSQL em produção (Railway fornece automaticamente)

### 2. CORS
Atualizar no backend para incluir domínio de produção:
```typescript
cors({
  origin: [
    'https://seu-frontend.vercel.app',
    'https://seu-frontend.netlify.app'
  ]
})
```

### 3. Build do Frontend
```bash
cd frontend
npm run build
```

### 4. Build do Backend
```bash
cd backend
npm run build
npm start
```

## 📊 Monitoramento

- Railway: Dashboard nativo
- Vercel: Analytics integrado
- Render: Logs em tempo real

## 🛠️ Troubleshooting

### Erro de CORS
- Verificar `FRONTEND_URL` no backend
- Atualizar origins no CORS

### Database
- Railway: PostgreSQL automático
- Outras: Verificar string de conexão

### Build Errors
- Verificar versões do Node.js
- Limpar cache: `npm clean-install`

## 🌟 Deploy Recomendado: Railway

Railway é a opção mais simples para fullstack:

1. **Fork** este repositório
2. **Conecte** no Railway
3. **Configure** variáveis de ambiente
4. **Deploy** automático a cada push

**URL do projeto:** `https://railway.app/template/seu-template`

---

## 📱 URLs de Produção

Após deploy, suas URLs serão:
- **Frontend:** `https://gerenciador-gastos.vercel.app`
- **Backend:** `https://gerenciador-gastos-api.railway.app`
- **Full App:** `https://railway.app/project/seu-projeto`

## 🎉 Pronto!

Sua aplicação está agora disponível globalmente! 🌍