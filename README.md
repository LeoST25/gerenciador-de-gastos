# 💰 Gerenciador de Gastos com IA

Um sistema completo de gerenciamento financeiro pessoal com análise inteligente usando IA. Este projeto fullstack combina Node.js/Express no backend, React/Vite no frontend e integração com APIs de inteligência artificial para análise avançada de gastos.

## 🚀 Funcionalidades

### Core Features
- ✅ **Registro de Transações**: Adicione receitas e despesas facilmente
- ✅ **Cálculo Automático de Balanço**: Visualize seu saldo em tempo real
- ✅ **Gráficos Interativos**: Visualizações claras com Chart.js/Recharts
- ✅ **Dashboard Intuitivo**: Visão geral completa das finanças

### Inteligência Artificial
- 🤖 **Análise de Padrões**: IA identifica tendências nos seus gastos
- 💡 **Sugestões Personalizadas**: Recomendações para economia
- 🎯 **Categorização Automática**: Classificação inteligente de transações
- 📊 **Relatórios Inteligentes**: Insights detalhados sobre comportamento financeiro

### Tecnologia
- 🔐 **Autenticação JWT**: Login seguro
- 📱 **Design Responsivo**: Funciona em desktop e mobile
- 🎨 **Interface Moderna**: Tailwind CSS
- ⚡ **Performance Otimizada**: Vite + TypeScript

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** + **TypeScript**
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **JWT** para autenticação
- **Zod** para validação de dados
- **OpenAI API** / **Google Gemini** para IA

### Frontend
- **React 18** + **TypeScript**
- **Vite** para build e desenvolvimento
- **React Router DOM** para navegação
- **Tailwind CSS** para estilização
- **Chart.js** / **Recharts** para gráficos
- **Axios** para requisições HTTP

### DevOps & Tools
- **ESLint** + **Prettier** para qualidade de código
- **Knex.js** para migrations de banco
- **Docker** ready (containerização)
- **GitHub Actions** para CI/CD

## 📦 Estrutura do Projeto

```
gerenciador_de_gastos/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── middleware/   # Middlewares
│   │   ├── models/       # Modelos de dados
│   │   └── services/     # Lógica de negócio
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilitários
│   ├── package.json
│   └── vite.config.ts
├── shared/               # Tipos compartilhados
│   └── types.ts
└── docs/                 # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- Chaves de API da OpenAI ou Google Gemini

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/gerenciador-de-gastos.git
cd gerenciador-de-gastos
```

### 2. Configure o Backend
```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API

# Execute as migrations (se houver)
npm run db:migrate

# Inicie o servidor
npm run dev
```

### 3. Configure o Frontend
```bash
cd ../frontend
npm install

# Inicie o desenvolvimento
npm run dev
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev        # Desenvolvimento com hot reload
npm run build      # Build para produção
npm start          # Executa versão de produção
npm run test       # Executa testes
npm run db:migrate # Executa migrations
```

### Frontend
```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview da build
npm run lint       # Verifica qualidade do código
```

## 🤖 Configuração da IA

### OpenAI
1. Obtenha sua API key em: https://platform.openai.com/api-keys
2. Adicione no `.env`: `OPENAI_API_KEY=sk-sua_chave_aqui`

### Google Gemini (Alternativo)
1. Obtenha sua API key em: https://makersuite.google.com/app/apikey
2. Adicione no `.env`: `GEMINI_API_KEY=sua_chave_aqui`

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Transações
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação

### Dashboard
- `GET /api/dashboard/summary` - Resumo financeiro
- `GET /api/dashboard/charts` - Dados para gráficos

### IA
- `POST /api/ai/analyze` - Análise inteligente de gastos
- `POST /api/ai/categorize` - Categorização automática

## 🎯 Roadmap

- [ ] **v1.1**: Metas financeiras e orçamentos
- [ ] **v1.2**: Notificações e alertas
- [ ] **v1.3**: Exportação de relatórios (PDF/Excel)
- [ ] **v1.4**: Integração com bancos (Open Banking)
- [ ] **v1.5**: App mobile (React Native)
- [ ] **v2.0**: Múltiplas moedas e investimentos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ para demonstrar integração fullstack com IA.

---

**📧 Contato**: Abra uma issue para dúvidas ou sugestões!

**🌟 Se gostou do projeto, deixe uma estrela!**