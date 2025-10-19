import { useState, useEffect } from 'react'

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data.user)
      } else {
        // Token inválido, remover
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        setIsAuthenticated(true)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error, details: data.details }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Após registro bem-sucedido, fazer login automaticamente
        localStorage.setItem('token', data.token)
        setIsAuthenticated(true)
        setUser(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, error: data.error, details: data.details }
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão com o servidor' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  return {
    isAuthenticated,
    loading,
    user,
    login,
    register,
    logout
  }
}