import "server-only";
import path from "path";
import crypto from "crypto";

// See lib/db.ts for why this is needed here too -- Next.js's request/action
// worker processes don't inherit env vars loaded by server.js at startup.
if (!process.env.ENCRYPTION_KEY) {
  try {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch {
    // Fine if the file doesn't exist (e.g. env vars provided another way).
  }
}

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be set to 64 hex characters (32 bytes). Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

/** Encrypts a plaintext string, returning base64(iv + authTag + ciphertext). */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** Reverses encrypt(). Returns null if payload is null/empty. */
export function decrypt(payload: string | null): string | null {
  if (!payload) return null;
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
