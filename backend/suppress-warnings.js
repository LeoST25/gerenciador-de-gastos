// Script para suprimir warnings específicos de deprecação
// Este arquivo deve ser incluído antes da inicialização do servidor

const originalEmitWarning = process.emitWarning;

process.emitWarning = function(warning, type, code, ...args) {
  // Suprimir o warning específico DEP0060 sobre util._extend
  if (code === 'DEP0060') {
    return; // Não emitir este warning
  }
  
  // Emitir outros warnings normalmente
  return originalEmitWarning.call(this, warning, type, code, ...args);
};

console.log('🔇 Warnings de deprecação DEP0060 (util._extend) suprimidos');