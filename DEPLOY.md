# 🚀 Deploy - Gerenciador de Gastos

Este documento contém instruções para fazer deploy da aplicação em várias plataformas gratuitas.

## 📋 Pré-requisitos

- Node.js 18+
- Git
- Conta nas plataformas de deploy

## 🌐 Deploy Recomendado: Frontend + Backend Separados

### 🎨 Frontend no Vercel (Recomendado)

**Vantagens:** Otimizado para React, CDN global, domínio gratuito

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy do frontend
cd frontend
vercel --prod
```

**Configuração no site:**
1. Acesse [vercel.com](https://vercel.com)
2. Conecte GitHub
3. Selecione repositório
4. **Root Directory: `frontend`**
5. **Framework Preset: Vite**
6. Deploy automático

### 🚂 Backend no Railway

**Vantagens:** PostgreSQL gratuito, fácil para APIs Node.js

1. Acesse [railway.app](https://railway.app)
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Selecione repositório `gerenciador-de-gastos`
4. **Root Directory: `backend`**
5. Configure variáveis de ambiente
6. Deploy automático

### ⚙️ Configuração de Variáveis de Ambiente

**Railway (Backend):**
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=sua_chave_secreta_super_segura
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://seu-backend.up.railway.app
```

## 🔄 Alternativas de Deploy

### 2. Railway Full Stack (Com configuração especial)

Se quiser usar Railway para tudo:

1. **Backend Service:**
   - Root Directory: `backend`
   - Detecta automaticamente Node.js

2. **Frontend Service:**
   - Root Directory: `frontend`  
   - Detecta automaticamente Vite

### 3. Render

1. Acesse [render.com](https://render.com)
2. "New" → "Web Service"
3. **Root Directory: `backend`** (para API)
4. **Root Directory: `frontend`** (para frontend)

### 4. Netlify + Railway

**Frontend no Netlify:**
1. [netlify.com](https://netlify.com)
2. Conecte GitHub
3. **Base directory: `frontend`**
4. **Build command: `npm run build`**
5. **Publish directory: `frontend/dist`**

## 🐳 Deploy com Docker (Avançado)

### Para plataformas que suportam Docker:

```bash
# Backend
cd backend
docker build -t gerenciador-backend .

# Frontend  
cd frontend
docker build -t gerenciador-frontend .

# Ou usar docker-compose
docker-compose up --build
```

## ❌ Correções de Problemas Comuns

### Erro "npm: command not found" no Railway

**Solução:** Configure Root Directory corretamente
- Backend: Root Directory = `backend`
- Frontend: Root Directory = `frontend`

### Erro "tsc: not found" no Docker

**Solução:** O TypeScript precisa estar instalado para build
- ✅ Corrigido no `Dockerfile` - instala dependências dev para build
- Use `npm ci` primeiro, depois `npm prune --omit=dev`

### Erro no Vercel CLI

**Soluções:**
1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy alternativo via site:**
   - Acesse [vercel.com](https://vercel.com)
   - "Add New Project"
   - Import do GitHub
   - **Root Directory: `frontend`**
   - Framework: Vite (auto-detectado)

3. **Deploy manual:**
```bash
cd frontend
npm run build
npx vercel --prod ./dist
```

### Erro de CORS em produção

**Solução:** Atualizar backend `src/server.ts`:
```typescript
cors({
  origin: [
    'https://seu-frontend.vercel.app',
    'https://seu-frontend.netlify.app'
  ]
})
```

### Build do frontend falha

**Solução:** Verificar variáveis de ambiente:
```env
VITE_API_URL=https://seu-backend.up.railway.app
```

### Docker build falha

**Soluções:**
1. Use `Dockerfile.simple` para builds mais diretos
2. Verifique se todas as dependências estão no package.json
3. Use multi-stage build para otimização

## 🌟 Deploy Recomendado: Vercel + Railway

**Melhor combinação:**
- ✅ **Frontend no Vercel:** Otimizado para React/Vite
- ✅ **Backend no Railway:** PostgreSQL gratuito + fácil deploy
- ✅ **Separação clara:** Cada serviço em sua plataforma ideal
- ✅ **Sem conflitos:** Evita problemas de monorepo

## 📱 URLs Finais

Após deploy correto:
- **Frontend:** `https://gerenciador-gastos.vercel.app`
- **Backend:** `https://gerenciador-gastos-api.up.railway.app`

## 🎉 Deploy em 3 Passos

1. **Frontend → Vercel:** Conectar GitHub, Root = `frontend`
2. **Backend → Railway:** Conectar GitHub, Root = `backend`  
3. **Configurar:** Variables de ambiente com URLs corretas

---

**Essa configuração evita todos os problemas de monorepo e garante deploy perfeito!** 🚀