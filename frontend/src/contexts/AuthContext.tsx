import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gerenciador-de-gastos-production.up.railway.app';

// Debug: Log da API URL
console.log('🔍 [AuthContext] API_BASE_URL:', API_BASE_URL);
// @ts-ignore
console.log('🔍 [AuthContext] VITE_API_URL env:', import.meta.env.VITE_API_URL);

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; details?: any }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; details?: any; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkAuthStatus = async () => {
    console.log('🔍 [Context] Verificando status de autenticação...');
    const token = localStorage.getItem('token');
    console.log('🎫 [Context] Token encontrado:', !!token);
    
    if (!token) {
      console.log('❌ [Context] Nenhum token encontrado');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('📞 [Context] Chamando /api/auth/me...');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🌐 [Context] Resposta /me:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Context] Usuário autenticado:', data.user);
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        console.log('🚫 [Context] Token inválido, removendo...');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('💥 [Context] Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      console.log('🏁 [Context] Verificação concluída');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 [Context] Tentando fazer login...', { email });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('📡 [Context] Resposta do login:', { response: response.ok, data });
      
      if (response.ok) {
        console.log('✅ [Context] Login bem-sucedido, salvando token...');
        localStorage.setItem('token', data.token);
        
        // Atualizar estado
        console.log('🎉 [Context] Atualizando estado...', { user: data.user });
        setUser(data.user);
        setIsAuthenticated(true);
        
        console.log('✨ [Context] Estado atualizado!');
        return { success: true };
      } else {
        console.log('❌ [Context] Falha no login:', data);
        return { success: false, error: data.error, details: data.details };
      }
    } catch (error) {
      console.error('💥 [Context] Erro de conexão:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('🌐 [Register] Fazendo requisição para:', `${API_BASE_URL}/api/auth/register`);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error, details: data.details };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const logout = () => {
    console.log('👋 [Context] Fazendo logout...');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Log sempre que o estado mudar
  useEffect(() => {
    console.log('🔄 [Context] Estado mudou:', { isAuthenticated, user: user?.email, loading });
  }, [isAuthenticated, user, loading]);

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};