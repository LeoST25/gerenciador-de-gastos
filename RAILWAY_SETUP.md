# Railway Deploy - Backend e Frontend Separados

## Backend Service

1. **Criar novo service no Railway**
2. **Conectar ao GitHub repo**
3. **Configurar Root Directory: `backend`**
4. **Deploy automático**

## Frontend Service

1. **Criar novo service no Railway**
2. **Conectar ao GitHub repo** 
3. **Configurar Root Directory: `frontend`**
4. **Deploy automático**

## Configuração Automática

O Railway detectará automaticamente:
- Backend: Node.js app na pasta `backend/`
- Frontend: React app na pasta `frontend/`

## Variáveis de Ambiente

### Backend Service:
```
NODE_ENV=production
PORT=3002
JWT_SECRET=sua_chave_secreta_aqui
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Frontend Service:
```
VITE_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

## URLs Resultantes:
- Backend: https://backend-production-xxxx.up.railway.app
- Frontend: https://frontend-production-xxxx.up.railway.app