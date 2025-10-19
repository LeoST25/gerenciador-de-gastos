import { database } from '../database/connection';
import { z } from 'zod';

// Schema de validação para transação
export const TransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime().optional()
});

export const CreateTransactionSchema = TransactionSchema;
export const UpdateTransactionSchema = TransactionSchema.partial();

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export class TransactionModel {
  // Criar nova transação
  async create(userId: number, data: z.infer<typeof CreateTransactionSchema>): Promise<Transaction> {
    const { type, amount, category, description, date } = data;
    const transactionDate = date || new Date().toISOString();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO transactions (user_id, type, amount, category, description, date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await database.run(
      query,
      [userId, type, amount, category, description, transactionDate, now, now]
    );

    // Buscar a transação criada
    const selectQuery = 'SELECT * FROM transactions WHERE id = ?';
    const transaction = await database.get(selectQuery, [result.lastID]);
    
    return transaction as Transaction;
  }

  // Buscar transações por usuário
  async findByUserId(userId: number, filters?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const rows = await database.all(query, params);
    return rows as Transaction[];
  }

  // Buscar transação por ID
  async findById(id: number, userId: number): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE id = ? AND user_id = ?';
    const row = await database.get(query, [id, userId]);
    return row as Transaction || null;
  }

  // Atualizar transação
  async update(id: number, userId: number, data: z.infer<typeof UpdateTransactionSchema>): Promise<Transaction | null> {
    const fields: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id, userId);

    const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;

    const result = await database.run(query, params);

    if (result.changes === 0) {
      return null;
    }

    // Buscar a transação atualizada
    const selectQuery = 'SELECT * FROM transactions WHERE id = ? AND user_id = ?';
    const transaction = await database.get(selectQuery, [id, userId]);
    return transaction as Transaction;
  }

  // Deletar transação
  async delete(id: number, userId: number): Promise<boolean> {
    const query = 'DELETE FROM transactions WHERE id = ? AND user_id = ?';
    const result = await database.run(query, [id, userId]);
    return result.changes > 0;
  }

  // Obter resumo financeiro
  async getSummary(userId: number, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    let query = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE user_id = ?
    `;
    const params: any[] = [userId];

    if (filters?.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    const row: any = await database.get(query, params);

    const totalIncome = row.total_income || 0;
    const totalExpense = row.total_expense || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      transactionCount: row.transaction_count || 0
    };
  }

  // Obter categorias utilizadas pelo usuário
  async getCategories(userId: number): Promise<string[]> {
    const query = 'SELECT DISTINCT category FROM transactions WHERE user_id = ? ORDER BY category';
    const rows: any[] = await database.all(query, [userId]);
    return rows.map(row => row.category);
  }
}