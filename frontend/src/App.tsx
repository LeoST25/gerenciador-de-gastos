import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { AIInsights } from './pages/AIInsights'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { isAuthenticated, loading, user } = useAuth()
  
  console.log('🏠 App render:', { isAuthenticated, loading, user: user?.email });

  if (loading) {
    console.log('⏳ Mostrando tela de carregamento...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 Usuário não autenticado, mostrando páginas de auth...');
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  console.log('✅ Usuário autenticado, mostrando dashboard...');
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App