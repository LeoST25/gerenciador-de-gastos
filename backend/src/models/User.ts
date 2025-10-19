import { database } from '../database/connection';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { name, email, password } = userData;
    
    // Verificar se o email já existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `;

    try {
      const result = await database.run(sql, [name, email, hashedPassword]);
      const userId = result.lastID;
      
      const newUser = await this.findById(userId!);
      if (!newUser) {
        throw new Error('Erro ao criar usuário');
      }

      // Remover senha do retorno
      delete newUser.password;
      return newUser;
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${(error as Error).message}`);
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const user = await database.get(sql, [email]);
      return user || null;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${(error as Error).message}`);
    }
  }

  static async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    try {
      const user = await database.get(sql, [id]);
      return user || null;
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por ID: ${(error as Error).message}`);
    }
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Erro ao validar senha');
    }
  }

  static async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user || !user.password) {
        return null;
      }

      const isValidPassword = await this.validatePassword(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Remover senha do retorno
      delete user.password;
      return user;
    } catch (error) {
      throw new Error(`Erro na autenticação: ${(error as Error).message}`);
    }
  }

  static async updateLastLogin(userId: number): Promise<void> {
    const sql = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    try {
      await database.run(sql, [userId]);
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }
}