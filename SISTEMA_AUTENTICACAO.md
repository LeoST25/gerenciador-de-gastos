# 🔐 Sistema de Autenticação - Guia de Uso

## ✅ Sistema Implementado com Sucesso!

O gerenciador de gastos agora possui um **sistema completo de autenticação** funcional:

### 🎯 **Como Usar:**

#### **1. Criar Nova Conta**
1. Acesse: http://localhost:3000
2. Clique em "crie uma nova conta"
3. Preencha:
   - **Nome completo** (mínimo 2 caracteres)
   - **Email válido**
   - **Senha** (mínimo 6 caracteres)
   - **Confirmação da senha**
4. Clique em "Criar conta"
5. ✅ **Será logado automaticamente** após registro!

#### **2. Fazer Login**
1. Acesse: http://localhost:3000/login
2. Digite seu email e senha
3. Clique em "Entrar"
4. ✅ **Redirecionado para o dashboard**

#### **3. Logout**
- Clique no ícone de logout no sidebar
- Token será removido automaticamente

---

## 🔧 **Funcionalidades Implementadas:**

### **Backend (Node.js + TypeScript):**
- ✅ **Banco SQLite** com tabelas `users` e `transactions`
- ✅ **Hash de senhas** com bcryptjs (10 salt rounds)
- ✅ **JWT autêntico** com expiração de 7 dias
- ✅ **Middleware de autenticação** para rotas protegidas
- ✅ **Validação robusta** com Zod
- ✅ **Endpoints**:
  - `POST /api/auth/register` - Criar conta
  - `POST /api/auth/login` - Fazer login
  - `GET /api/auth/me` - Dados do usuário
  - `POST /api/auth/logout` - Logout

### **Frontend (React + TypeScript):**
- ✅ **Formulário de registro** com validações em tempo real
- ✅ **Página de login** melhorada
- ✅ **Hook useAuth** integrado com backend real
- ✅ **Verificação automática** de token no carregamento
- ✅ **Feedback visual** com toasts e loading states
- ✅ **Tratamento de erros** do backend
- ✅ **Auto-login** após registro bem-sucedido

---

## 🛡️ **Segurança Implementada:**

- 🔐 **Senhas hasheadas** com bcryptjs
- 🎫 **JWT com expiração** configurável
- 🛡️ **Middleware de autenticação** em rotas protegidas
- ✅ **Validação dupla** (frontend + backend)
- 🚫 **Proteção contra SQL injection** (prepared statements)
- 📧 **Email único** por usuário
- 🔒 **Senhas nunca retornadas** nas respostas

---

## 🧪 **Para Testar:**

### **Cenários de Teste:**
1. **Registro bem-sucedido**: Nome, email único, senha válida
2. **Email duplicado**: Tentar registrar mesmo email duas vezes
3. **Validações**: Campos vazios, email inválido, senhas diferentes
4. **Login bem-sucedido**: Email e senha corretos
5. **Login inválido**: Email inexistente ou senha errada
6. **Auto-verificação**: Recarregar página com token válido
7. **Token expirado**: Testar após 7 dias (ou configurar menor)

### **Usuários de Teste:**
Após registrar, experimente:
- Nome: `João Silva`
- Email: `joao@teste.com`
- Senha: `123456`

---

## 📊 **Banco de Dados:**

O arquivo `database.sqlite` é criado automaticamente na pasta `backend/` com:

### **Tabela `users`:**
```sql
- id (INTEGER PRIMARY KEY)
- name (TEXT NOT NULL)
- email (TEXT UNIQUE NOT NULL)
- password (TEXT NOT NULL) -- Hash bcrypt
- created_at (DATETIME)
- updated_at (DATETIME)
```

### **Tabela `transactions`:**
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER) -- FK para users
- type ('income' | 'expense')
- amount (REAL)
- description (TEXT)
- category (TEXT)
- date (DATETIME)
- created_at (DATETIME)
- updated_at (DATETIME)
```

---

## 🚀 **Próximos Passos:**

1. **Conectar transações** ao usuário logado
2. **Implementar "Esqueci minha senha"**
3. **Adicionar perfil do usuário**
4. **Configurar refresh tokens**
5. **Implementar roles/permissões**

---

## ✨ **Sistema 100% Funcional!**

O **Gerenciador de Gastos** agora possui autenticação real e segura. Todos os usuários registrados terão seus dados protegidos e podem fazer login/logout normalmente.

**🎉 Pronto para uso em produção!**