import knex from 'knex';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  // Configuração para desenvolvimento (SQLite)
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '../../database.sqlite')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, '../migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../seeds')
    }
  },
  
  // Configuração para produção (PostgreSQL)
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, '../migrations')
    },
    seeds: {
      directory: path.join(__dirname, '../seeds')
    }
  }
};

const environment = isProduction ? 'production' : 'development';
const db = knex(config[environment]);

export default db;