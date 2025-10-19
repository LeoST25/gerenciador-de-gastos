const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para inicializar as tabelas
const initializeTables = async () => {
  try {
    // Criar tabela de usuários se não existir
    const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
    
    // Criar tabela de transações se não existir
    const { error: transactionsError } = await supabase.rpc('create_transactions_table_if_not_exists');
    
    console.log('📊 Tabelas do banco inicializadas');
  } catch (error) {
    console.log('ℹ️ Tabelas já existem ou usando fallback em memória');
  }
};

// Fallback para desenvolvimento local (quando não há Supabase configurado)
let useFallback = false;
let fallbackUsers = [];
let fallbackTransactions = [];
let nextUserId = 1;
let nextTransactionId = 1;

// Verificar se Supabase está configurado
const checkSupabaseConfig = () => {
  return supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseKey && supabaseKey !== 'your-anon-key';
};

// Funções de usuário
const createUser = async (userData) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const user = {
      id: nextUserId++,
      ...userData,
      created_at: new Date().toISOString()
    };
    fallbackUsers.push(user);
    return { data: user, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .insert([{
      name: userData.name,
      email: userData.email,
      password: userData.password // Em produção, usar hash
    }])
    .select()
    .single();

  return { data, error };
};

const findUserByEmail = async (email) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const user = fallbackUsers.find(u => u.email === email);
    return { data: user || null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return { data, error };
};

const findUserById = async (id) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const user = fallbackUsers.find(u => u.id === id);
    return { data: user || null, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Funções de transação
const createTransaction = async (transactionData) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const transaction = {
      id: nextTransactionId++,
      ...transactionData,
      created_at: new Date().toISOString()
    };
    fallbackTransactions.push(transaction);
    return { data: transaction, error: null };
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  return { data, error };
};

const getUserTransactions = async (userId) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const transactions = fallbackTransactions.filter(t => t.userId === userId);
    return { data: transactions, error: null };
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
};

const updateTransaction = async (id, updates) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const index = fallbackTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      fallbackTransactions[index] = { ...fallbackTransactions[index], ...updates };
      return { data: fallbackTransactions[index], error: null };
    }
    return { data: null, error: { message: 'Transação não encontrada' } };
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

const deleteTransaction = async (id) => {
  if (!checkSupabaseConfig()) {
    // Fallback em memória
    const index = fallbackTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = fallbackTransactions.splice(index, 1)[0];
      return { data: deleted, error: null };
    }
    return { data: null, error: { message: 'Transação não encontrada' } };
  }

  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Estatísticas
const getStats = async () => {
  if (!checkSupabaseConfig()) {
    return {
      totalUsers: fallbackUsers.length,
      totalTransactions: fallbackTransactions.length,
      database: 'memory-fallback'
    };
  }

  const { data: users } = await supabase.from('users').select('id');
  const { data: transactions } = await supabase.from('transactions').select('id');

  return {
    totalUsers: users?.length || 0,
    totalTransactions: transactions?.length || 0,
    database: 'supabase'
  };
};

module.exports = {
  supabase,
  initializeTables,
  createUser,
  findUserByEmail,
  findUserById,
  createTransaction,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
  getStats,
  checkSupabaseConfig
};