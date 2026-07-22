import path from "path";
import mysql from "mysql2/promise";

// Next.js runs request/action handling in worker processes that don't
// inherit env vars loaded by server.js's top-level code, so load the file
// again here, at the actual point of use, in whatever worker this runs in.
export let dbEnvLoadStatus = "not attempted";
if (!process.env.DB_HOST) {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    process.loadEnvFile(envPath);
    dbEnvLoadStatus = `ok, cwd=${process.cwd()}`;
  } catch (err) {
    dbEnvLoadStatus = `FAILED at ${envPath}: ${
      err && (err as Error).message ? (err as Error).message : err
    }, cwd=${process.cwd()}`;
  }
} else {
  dbEnvLoadStatus = "skipped, DB_HOST already set";
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
