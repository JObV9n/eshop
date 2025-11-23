import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create the connection
const client = postgres(connectionString);

// Create the drizzle instance
export const db = drizzle(client, { schema });

export type DbType = typeof db;
