# 🚀 Deploy - Gerenciador de Gastos

Este documento contém instruções para fazer deploy da aplicação em várias plataformas gratuitas.

## 📋 Pré-requisitos

- Node.js 18+
- Git
- Conta nas plataformas de deploy
- ❌ **Docker NÃO é necessário** (deploy via sites é mais fácil)

## 🌟 **DEPLOY RECOMENDADO: Via Sites (SEM Docker)**

### 🎯 **Método Mais Simples e Confiável**

**Por que via sites:**
- ✅ Sem instalação de Docker
- ✅ Sem problemas de build
- ✅ Deploy automático
- ✅ Domínios gratuitos
- ✅ SSL/HTTPS incluído

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

**📱 Passo a passo detalhado:**
1. **Criar conta** no Vercel (grátis)
2. **"Add New Project"**
3. **"Import Git Repository"**
4. **Autorizar** acesso ao GitHub
5. **Selecionar** `gerenciador-de-gastos`
6. **Configure Project:**
   - Project Name: `gerenciador-gastos-frontend`
   - Framework Preset: `Vite` (auto-detectado)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto)
   - Output Directory: `dist` (auto)
7. **Deploy** (3-5 minutos)
8. **URL gerada:** `https://gerenciador-gastos-frontend.vercel.app`

### 🚂 Backend no Railway

**Vantagens:** PostgreSQL gratuito, fácil para APIs Node.js

**📱 Passo a passo detalhado:**
1. **Criar conta** no Railway (grátis)
2. **"New Project"** → **"Deploy from GitHub repo"**
3. **Autorizar** acesso ao GitHub
4. **Selecionar** `gerenciador-de-gastos`
5. **Configure Service:**
   - Service Name: `gerenciador-backend`
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Watch Paths: `backend/**`
6. **Add Database:**
   - "Add Service" → "Database" → "PostgreSQL"
   - Conecta automaticamente
7. **Variables (adicionar uma por vez):**
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=sua_chave_super_secreta_aqui_123
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
8. **Deploy** (5-10 minutos)
9. **URL gerada:** `https://gerenciador-backend-production-xxxx.up.railway.app`
10. **Copie a URL** para configurar no frontend

### ⚙️ Configuração de Variáveis de Ambiente

**Railway (Backend):**
```env
NODE_ENV=production
PORT=3002
JWT_SECRET=sua_chave_secreta_super_segura
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Vercel (Frontend):**
1. **Acesse** [vercel.com](https://vercel.com) e abra seu projeto
2. **Settings** → **Environment Variables**
3. **Adicione:**
   ```
   Name: VITE_API_URL
   Value: https://gerenciador-backend-production-xxxx.up.railway.app
   ```
4. **Save** e aguarde redeploy automático

## ✅ Checklist de Deploy Completo

### 🎯 Ordem de Deploy (IMPORTANTE!)

**1. Backend Primeiro (Railway):**
- [ ] Conta criada no Railway
- [ ] Repositório conectado
- [ ] Root Directory: `backend`
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] URL do backend copiada

**2. Frontend Depois (Vercel):**
- [ ] Conta criada no Vercel
- [ ] Repositório conectado  
- [ ] Root Directory: `frontend`
- [ ] Framework Vite detectado
- [ ] Deploy executado
- [ ] Variável VITE_API_URL configurada com URL do backend
- [ ] Redeploy automático concluído

**3. Testes:**
- [ ] Frontend carrega sem erros
- [ ] Login/cadastro funcionando
- [ ] Transações sendo criadas
- [ ] AI Insights funcionando
- [ ] Gráficos aparecendo

### 🚨 Problemas Comuns

**"Cannot connect to backend"**
- Verifique VITE_API_URL no Vercel
- URL deve terminar SEM barra: `https://backend.railway.app` ✅
- URL NÃO deve ter barra final: `https://backend.railway.app/` ❌

**"Database connection failed"**
- Aguarde 2-3 minutos após primeiro deploy do Railway
- Database migrations rodam automaticamente
- Verifique logs do Railway para erros

**"AI Insights não carrega"**
- Rate limiting ativo (aguarde 5 segundos)
- Adicione algumas transações primeiro
- Verifique Network tab no DevTools

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
1. **Use diferentes Dockerfiles para diferentes situações:**
   - `Dockerfile` - Multi-stage otimizado
   - `Dockerfile.simple` - Build direto e simples
   - `Dockerfile.railway` - Específico para Railway
   - `Dockerfile.optimized` - Versão mais robusta

2. **Problema com postinstall script:**
   ```bash
   # Se o build falhar devido ao postinstall
   # O script foi removido do package.json
   # Use --ignore-scripts como fallback
   ```

3. **Commands para testar localmente:**
   ```bash
   # Teste diferentes builds
   docker build -f Dockerfile .
   docker build -f Dockerfile.simple .
   docker build -f Dockerfile.railway .
   ```

4. **Verificar dependências no package.json:**
   - TypeScript deve estar em devDependencies
   - Remover postinstall se causar problemas

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