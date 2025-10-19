# Como Configurar o Supabase Database

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta/faça login
3. Clique em "New Project"
4. Escolha um nome e região para seu projeto
5. Aguarde a criação do banco de dados

## 2. Executar o Schema SQL

1. No painel do Supabase, vá para "SQL Editor"
2. Cole todo o conteúdo do arquivo `netlify/functions/schema.sql`
3. Execute o SQL (botão "Run")

## 3. Obter Credenciais

1. Vá para "Settings" > "API"
2. Copie a "Project URL"
3. Copie a "anon public" key

## 4. Configurar no Netlify

1. No painel do Netlify, vá para "Site Settings" > "Environment Variables"
2. Adicione as variáveis:
   - `SUPABASE_URL`: Sua Project URL
   - `SUPABASE_ANON_KEY`: Sua anon public key

## 5. Fazer Deploy

Faça um novo deploy para aplicar as configurações:

```bash
git add .
git commit -m "feat: configuração do Supabase"
git push origin main
```

## Verificação

Após o deploy, teste o sistema:
- Registre um novo usuário
- Adicione algumas transações
- Verifique se os dados persistem após recarregar a página

## Fallback

Se o Supabase não estiver configurado, o sistema automaticamente usará armazenamento em memória (dados serão perdidos quando a Function reiniciar).