export function Transactions() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <button className="btn-primary">
          Nova Transação
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Histórico de Transações
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500">Em breve: lista completa de transações</p>
        </div>
      </div>
    </div>
  )
}