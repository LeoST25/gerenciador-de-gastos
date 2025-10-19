export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-success-600 text-sm font-medium">R$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Receitas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    R$ 5.000,00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <span className="text-danger-600 text-sm font-medium">-R$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Gastos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    R$ 2.150,00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Balanço
                  </dt>
                  <dd className="text-lg font-medium text-success-600">
                    R$ 2.850,00
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <span className="text-warning-600 text-sm font-medium">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taxa de Economia
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    57%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico e Transações Recentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Gastos por Categoria */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gastos por Categoria
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico será carregado aqui</p>
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Transações Recentes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-danger-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Supermercado</p>
                  <p className="text-xs text-gray-500">Alimentação</p>
                </div>
              </div>
              <span className="text-sm font-medium text-danger-600">-R$ 89,50</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Salário</p>
                  <p className="text-xs text-gray-500">Trabalho</p>
                </div>
              </div>
              <span className="text-sm font-medium text-success-600">+R$ 5.000,00</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-danger-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Netflix</p>
                  <p className="text-xs text-gray-500">Entretenimento</p>
                </div>
              </div>
              <span className="text-sm font-medium text-danger-600">-R$ 29,90</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}