import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTransactions } from '../hooks/useTransactions'
import { 
  CpuChipIcon as BrainIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface AIAnalysis {
  summary: {
    totalIncome: number
    totalExpenses: number
    balance: number
    period: string
    transactionCount?: number
    averageExpense?: number
    topExpenseCategory?: string
  }
  insights: Array<{
    type: 'warning' | 'suggestion' | 'positive'
    message: string
    category: string
  }>
  suggestions: string[]
  categoryBreakdown?: {
    expenses: Record<string, number>
    income: Record<string, number>
  }
}

export function AIInsights() {
  const { isAuthenticated } = useAuth()
  const { transactions } = useTransactions()
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [analysisCache, setAnalysisCache] = useState<Map<string, { data: AIAnalysis, timestamp: number }>>(new Map())
  const [rateLimitActive, setRateLimitActive] = useState(false)
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0)

  // Função memoizada para gerar chave de cache baseada nas transações
  const getCacheKey = useMemo(() => {
    if (!transactions.length) return ''
    return `ai_analysis_${transactions.length}_${JSON.stringify(transactions.map(t => ({id: t.id, amount: t.amount, category: t.category})).slice(0, 10))}`
  }, [transactions])

  const fetchAIAnalysis = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || transactions.length === 0) return

    const now = Date.now()
    const RATE_LIMIT_MS = 5000 // 5 segundos entre requisições
    const CACHE_DURATION_MS = 60000 // Cache por 1 minuto

    // Verifica rate limiting
    if (!forceRefresh && now - lastFetchTime < RATE_LIMIT_MS) {
      const timeLeft = Math.ceil((RATE_LIMIT_MS - (now - lastFetchTime)) / 1000)
      console.log('🚫 [AI] Rate limit ativo. Aguarde', timeLeft, 'segundos')
      setRateLimitActive(true)
      setRateLimitTimeLeft(timeLeft)
      setError(`Aguarde ${timeLeft} segundos antes de solicitar nova análise`)
      
      // Timer para atualizar o tempo restante
      const timer = setInterval(() => {
        const newTimeLeft = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastFetchTime)) / 1000)
        if (newTimeLeft <= 0) {
          setRateLimitActive(false)
          setRateLimitTimeLeft(0)
          setError(null)
          clearInterval(timer)
        } else {
          setRateLimitTimeLeft(newTimeLeft)
          setError(`Aguarde ${newTimeLeft} segundos antes de solicitar nova análise`)
        }
      }, 1000)
      
      return
    }

    // Verifica cache
    const cachedResult = analysisCache.get(getCacheKey)
    if (!forceRefresh && cachedResult && now - cachedResult.timestamp < CACHE_DURATION_MS) {
      console.log('💾 [AI] Usando resultado do cache')
      setAnalysis(cachedResult.data)
      return
    }

    setLoading(true)
    setError(null)
    setLastFetchTime(now)

    try {
      console.log('🤖 [AI] Buscando análise IA com', transactions.length, 'transações')
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          transactions,
          period: '30d'
        })
      })

      if (response.status === 429) {
        throw new Error('Muitas requisições. Tente novamente em alguns segundos.')
      }

      if (!response.ok) {
        throw new Error(`Erro ao obter análise IA (${response.status})`)
      }

      const data = await response.json()
      console.log('🧠 [AI] Análise recebida:', data)
      
      // Salva no cache
      const newCache = new Map(analysisCache)
      newCache.set(getCacheKey, { data, timestamp: now })
      setAnalysisCache(newCache)
      
      setAnalysis(data)
    } catch (err: any) {
      console.error('❌ [AI] Erro:', err)
      if (err.message.includes('429') || err.message.includes('Muitas requisições')) {
        setError('Muitas requisições. Aguarde alguns segundos e tente novamente.')
      } else {
        setError('Não foi possível obter a análise IA')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, transactions, getCacheKey, analysisCache, lastFetchTime])

  useEffect(() => {
    if (isAuthenticated && transactions.length > 0) {
      fetchAIAnalysis(false)
    }
  }, [isAuthenticated, fetchAIAnalysis])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'positive':
        return <TrendingUpIcon className="h-5 w-5 text-green-500" />
      case 'suggestion':
        return <LightBulbIcon className="h-5 w-5 text-blue-500" />
      default:
        return <BrainIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200'
      case 'positive':
        return 'bg-green-50 border border-green-200'
      case 'suggestion':
        return 'bg-blue-50 border border-blue-200'
      default:
        return 'bg-gray-50 border border-gray-200'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      '#3B82F6', // Azul
      '#EF4444', // Vermelho
      '#10B981', // Verde
      '#F59E0B', // Amarelo
      '#8B5CF6', // Roxo
      '#F97316', // Laranja
      '#06B6D4', // Cyan
      '#84CC16', // Verde Lima
      '#EC4899', // Rosa
      '#6B7280'  // Cinza
    ]
    return colors[index % colors.length]
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Faça login para ver suas análises IA</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insights com IA</h1>
        <p className="mt-1 text-sm text-gray-500">
          Análises inteligentes dos seus gastos e sugestões personalizadas
        </p>
        
        {/* Indicador de Rate Limit */}
        {rateLimitActive && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
              <p className="text-sm text-orange-800">
                Rate limit ativo - Aguarde {rateLimitTimeLeft} segundos para nova análise
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumo Financeiro */}
      {analysis && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analysis.summary.totalIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <TrendingDownIcon className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Gastos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analysis.summary.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <BrainIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-2xl font-semibold ${
                  analysis.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(analysis.summary.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Categorias */}
      {analysis?.categoryBreakdown && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Distribuição por Categoria
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gastos por Categoria - Gráfico de Pizza */}
            {Object.keys(analysis.categoryBreakdown.expenses).length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Gastos por Categoria</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analysis.categoryBreakdown.expenses).map(([category, amount]) => ({
                        name: category,
                        value: amount,
                        percentage: ((amount / analysis.summary.totalExpenses) * 100).toFixed(1)
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {Object.entries(analysis.categoryBreakdown.expenses).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Receitas por Categoria - Gráfico de Barras */}
            {Object.keys(analysis.categoryBreakdown.income).length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Receitas por Categoria</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={Object.entries(analysis.categoryBreakdown.income).map(([category, amount]) => ({
                      category,
                      amount
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas Adicionais */}
      {analysis && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Estatísticas Detalhadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {analysis.summary.transactionCount || 0}
              </p>
              <p className="text-sm text-blue-800">Total de Transações</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {analysis.summary.averageExpense ? formatCurrency(analysis.summary.averageExpense) : 'N/A'}
              </p>
              <p className="text-sm text-purple-800">Gasto Médio</p>
            </div>
            
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">
                {analysis.summary.topExpenseCategory || 'N/A'}
              </p>
              <p className="text-sm text-indigo-800">Maior Categoria</p>
            </div>
            
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">
                {analysis.categoryBreakdown ? Object.keys(analysis.categoryBreakdown.expenses).length : 0}
              </p>
              <p className="text-sm text-cyan-800">Categorias Usadas</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Análise de Gastos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BrainIcon className="h-5 w-5 mr-2" />
            Análise Inteligente
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Analisando seus gastos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => fetchAIAnalysis(true)}
                disabled={rateLimitActive}
                className="mt-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {rateLimitActive ? `Aguarde ${rateLimitTimeLeft}s` : 'Tentar novamente'}
              </button>
            </div>
          ) : !analysis ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {transactions.length === 0 
                  ? 'Adicione algumas transações para ver a análise IA'
                  : 'Carregando análise inteligente...'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg ${getInsightStyle(insight.type)}`}>
                  <div className="flex items-start">
                    {getInsightIcon(insight.type)}
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">{insight.message}</p>
                      <p className="text-xs text-gray-600 mt-1">Categoria: {insight.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sugestões Personalizadas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Sugestões Personalizadas
          </h2>
          
          {analysis ? (
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold mr-3">
                      {index + 1}
                    </span>
                    <p className="text-sm text-blue-800">{suggestion}</p>
                  </div>
                </div>
              ))}
              
              {/* Botão para nova análise */}
              <div className="pt-4">
                <button
                  onClick={() => fetchAIAnalysis(true)}
                  disabled={loading || rateLimitActive}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <BrainIcon className="h-4 w-4 mr-2" />
                  {loading ? 'Analisando...' : rateLimitActive ? `Aguarde ${rateLimitTimeLeft}s` : 'Atualizar Análise'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg animate-pulse">
                <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg animate-pulse">
                <div className="h-4 bg-green-200 rounded w-2/3"></div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg animate-pulse">
                <div className="h-4 bg-yellow-200 rounded w-4/5"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}