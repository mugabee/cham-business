import path from "path";
import mysql from "mysql2/promise";

// Next.js runs request/action handling in worker processes that don't
// inherit env vars loaded by server.js's top-level code, so load the file
// again here, at the actual point of use, in whatever worker this runs in.
if (!process.env.DB_HOST) {
  try {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch {
    // Fine if the file doesn't exist (e.g. env vars provided another way).
  }
}

// Cached on globalThis so Next.js dev hot-reload doesn't open a new pool every time.
const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
