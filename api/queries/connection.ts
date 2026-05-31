import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

let instance: any;

export function getDb() {
  if (!instance) {
    const url = env.databaseUrl;
    
    if (!url) {
      throw new Error("DATABASE_URL is missing.");
    }
    
    try {
      const poolConnection = mysql.createPool({
        uri: url,
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false, // More permissive for Vercel environments
        },
        waitForConnections: true,
        connectionLimit: 10, // Increased to avoid deadlocks during transactions/batching
        queueLimit: 0,
        connectTimeout: 10000, 
        enableKeepAlive: true,
      });
      
      instance = drizzle(poolConnection, {
        mode: "default",
        schema: fullSchema,
      });
    } catch (err: any) {
      throw err;
    }
  }
  return instance;
}
