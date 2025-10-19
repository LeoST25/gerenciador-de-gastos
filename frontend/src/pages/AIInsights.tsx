export function AIInsights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insights com IA</h1>
        <p className="mt-1 text-sm text-gray-500">
          Análises inteligentes dos seus gastos e sugestões personalizadas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Análise de Gastos
          </h2>
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando análise inteligente...</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Sugestões de Economia
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Seus gastos com alimentação aumentaram 15% este mês
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Parabéns! Você economizou R$ 500 este mês
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Considere definir um orçamento para entretenimento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}