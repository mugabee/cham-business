// One-off script to create or reset a staff account.
// Usage: node --env-file=.env.local scripts/seed-admin.mjs "admin@example.com" "password" "Full Name"
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const [, , email, password, fullName] = process.argv;

if (!email || !password || !fullName) {
  console.error(
    'Usage: node --env-file=.env.local scripts/seed-admin.mjs "email" "password" "Full Name"'
  );
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const passwordHash = await bcrypt.hash(password, 12);

await connection.query(
  `INSERT INTO staff (email, password_hash, full_name)
   VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), full_name = VALUES(full_name)`,
  [email, passwordHash, fullName]
);

console.log(`Staff account ready: ${email}`);
await connection.end();
