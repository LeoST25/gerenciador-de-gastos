import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Pool } from 'pg';

class Database {
  private db: sqlite3.Database | null = null;
  private pgPool: Pool | null = null;

  constructor() {
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      // PostgreSQL para produção
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      console.log('📊 Conectando ao PostgreSQL (Railway)');
      this.initPostgresTables();
    } else {
      // SQLite para desenvolvimento
      this.db = new sqlite3.Database('./database.sqlite', (err) => {
        if (err) {
          console.error('Erro ao conectar com o banco de dados:', err.message);
        } else {
          console.log('📊 Conectado ao banco de dados SQLite');
          this.initTables();
        }
      });
    }
  }

  private async initTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    try {
      await this.run(createUsersTable);
      await this.run(createTransactionsTable);
      console.log('✅ Tabelas criadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabelas:', error);
    }
  }

  run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('🔒 Conexão com banco de dados fechada');
          resolve();
        }
      });
    });
  }
}

export const database = new Database();