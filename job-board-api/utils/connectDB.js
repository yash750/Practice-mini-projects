// Make sure to install the 'pg' package 
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as schema from '../models/Users.model.js';

dotenv.config({path: '../.env'});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// The db instance is now created once and exported.
export const db = drizzle(pool, { schema });