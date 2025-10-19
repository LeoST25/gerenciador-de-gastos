import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  date: z.string().transform(str => new Date(str))
});

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    // TODO: Buscar transações do usuário
    const mockTransactions = [
      {
        id: 1,
        type: 'income',
        amount: 5000,
        description: 'Salário',
        category: 'Trabalho',
        date: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        type: 'expense',
        amount: 150,
        description: 'Supermercado',
        category: 'Alimentação',
        date: new Date(),
        createdAt: new Date()
      }
    ];
    
    res.json(mockTransactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const transaction = transactionSchema.parse(req.body);
    
    // TODO: Salvar transação no banco de dados
    const savedTransaction = {
      id: Date.now(),
      ...transaction,
      createdAt: new Date()
    };
    
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const transaction = transactionSchema.parse(req.body);
    
    // TODO: Atualizar transação no banco de dados
    const updatedTransaction = {
      id,
      ...transaction,
      updatedAt: new Date()
    };
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // TODO: Deletar transação do banco de dados
    
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export { router as transactionRoutes };