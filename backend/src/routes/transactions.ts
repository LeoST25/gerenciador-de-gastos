import { Router, Request, Response } from 'express';
import { TransactionModel, CreateTransactionSchema, UpdateTransactionSchema } from '../models/Transaction';
import { authenticateToken } from '../middleware/auth';
import { JWTPayload } from '../services/AuthService';
import { z } from 'zod';

// Estender o tipo Request para incluir user
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const router = Router();
const transactionModel = new TransactionModel();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/transactions - Listar transações do usuário
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    console.log('🔍 Buscando transações para usuário:', userId);
    
    // Parâmetros de filtro opcionais
    const {
      type,
      category,
      startDate,
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    const filters = {
      type: type as 'income' | 'expense' | undefined,
      category: category as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    console.log('🔧 Filtros aplicados:', filters);

    const transactions = await transactionModel.findByUserId(userId, filters);
    console.log('📊 Transações encontradas:', transactions.length);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/transactions/summary - Obter resumo financeiro
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined
    };

    const summary = await transactionModel.getSummary(userId, filters);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/transactions/categories - Obter categorias do usuário
router.get('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const categories = await transactionModel.getCategories(userId);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/transactions - Criar nova transação
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    console.log('💳 Criando transação para usuário:', userId);
    console.log('📝 Dados recebidos:', req.body);
    
    // Validar dados de entrada
    const validatedData = CreateTransactionSchema.parse(req.body);
    console.log('✅ Dados validados:', validatedData);

    const transaction = await transactionModel.create(userId, validatedData);
    console.log('🎉 Transação criada:', transaction);

    res.status(201).json({
      success: true,
      message: 'Transação criada com sucesso',
      data: transaction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('❌ Erro de validação:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/transactions/:id - Obter transação específica
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da transação inválido'
      });
    }

    const transaction = await transactionModel.findById(transactionId, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da transação inválido'
      });
    }

    // Validar dados de entrada
    const validatedData = UpdateTransactionSchema.parse(req.body);

    const transaction = await transactionModel.update(transactionId, userId, validatedData);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Transação atualizada com sucesso',
      data: transaction
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/transactions/:id - Deletar transação
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da transação inválido'
      });
    }

    const deleted = await transactionModel.delete(transactionId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export { router as transactionRoutes };
