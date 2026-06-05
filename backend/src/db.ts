import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'garage_user',
  password: process.env.POSTGRES_PASSWORD || 'garage_pass',
  database: process.env.POSTGRES_DB || 'garage_db',
});

export default pool;
