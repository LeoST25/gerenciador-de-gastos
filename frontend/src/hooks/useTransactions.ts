import { useState, useEffect, useCallback } from 'react';
import { 
  Transaction, 
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionSummary, 
  TransactionFilters,
  ApiResponse 
} from '../types/transaction';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gerenciador-de-gastos-production.up.railway.app';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido, redirecionar para login
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Sessão expirada');
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Buscar transações
  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const url = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔍 Buscando transações em:', url);
      
      const response: ApiResponse<Transaction[]> = await authenticatedFetch(url);
      console.log('📊 Resposta das transações:', response);

      if (response.success && response.data) {
        console.log('✅ Transações encontradas:', response.data.length);
        setTransactions(response.data);
      } else {
        console.log('⚠️ Nenhuma transação encontrada ou erro na resposta');
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ Erro ao buscar transações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar transações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar resumo
  const fetchSummary = useCallback(async (filters?: { startDate?: string; endDate?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const url = `/api/transactions/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('📊 Buscando resumo em:', url);
      
      const response: ApiResponse<TransactionSummary> = await authenticatedFetch(url);
      console.log('💰 Resposta do resumo:', response);

      if (response.success && response.data) {
        console.log('✅ Resumo encontrado:', response.data);
        setSummary(response.data);
      } else {
        console.log('⚠️ Nenhum resumo encontrado ou erro na resposta');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar resumo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar resumo');
    }
  }, []);

  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    try {
      const response: ApiResponse<string[]> = await authenticatedFetch('/api/transactions/categories');

      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar categorias');
    }
  }, []);

  // Criar transação
  const createTransaction = async (data: CreateTransactionData): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('💳 Criando transação:', data);

      const response: ApiResponse<Transaction> = await authenticatedFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('✨ Resposta da criação:', response);

      if (response.success && response.data) {
        console.log('✅ Transação criada com sucesso:', response.data);
        // Atualizar lista local
        setTransactions(prev => [response.data!, ...prev]);
        // Atualizar resumo
        fetchSummary();
        return response.data;
      }

      console.log('⚠️ Falha ao criar transação');
      return null;
    } catch (err) {
      console.error('❌ Erro ao criar transação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar transação
  const updateTransaction = async (id: number, data: UpdateTransactionData): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<Transaction> = await authenticatedFetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        // Atualizar lista local
        setTransactions(prev => 
          prev.map(t => t.id === id ? response.data! : t)
        );
        // Atualizar resumo
        fetchSummary();
        return response.data;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar transação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Deletar transação
  const deleteTransaction = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<void> = await authenticatedFetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Remover da lista local
        setTransactions(prev => prev.filter(t => t.id !== id));
        // Atualizar resumo
        fetchSummary();
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar transação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar transação por ID
  const getTransactionById = async (id: number): Promise<Transaction | null> => {
    try {
      const response: ApiResponse<Transaction> = await authenticatedFetch(`/api/transactions/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar transação');
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
    fetchCategories();
  }, [fetchTransactions, fetchSummary, fetchCategories]);

  return {
    transactions,
    summary,
    categories,
    loading,
    error,
    fetchTransactions,
    fetchSummary,
    fetchCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    setError, // Para limpar erros manualmente
  };
};