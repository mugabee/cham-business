import "server-only";
import crypto from "crypto";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

/** Returns false if the email was already subscribed (not an error --
 * just nothing new to do). */
export async function subscribeToJobAlerts(email: string): Promise<boolean> {
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id, unsubscribed_at FROM job_alert_subscribers WHERE email = ? LIMIT 1",
    [email]
  );

  if (existing[0]) {
    if (existing[0].unsubscribed_at) {
      await pool.query(
        "UPDATE job_alert_subscribers SET unsubscribed_at = NULL WHERE id = ?",
        [existing[0].id]
      );
      return true;
    }
    return false;
  }

  const token = crypto.randomBytes(32).toString("hex");
  await pool.query(
    "INSERT INTO job_alert_subscribers (email, unsubscribe_token) VALUES (?, ?)",
    [email, token]
  );
  return true;
}

export async function listActiveJobAlertSubscribers(): Promise<
  { email: string; unsubscribeToken: string }[]
> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT email, unsubscribe_token FROM job_alert_subscribers WHERE unsubscribed_at IS NULL"
  );
  return rows.map((row) => ({ email: row.email, unsubscribeToken: row.unsubscribe_token }));
}

export async function unsubscribeFromJobAlerts(token: string): Promise<boolean> {
  const [result] = await pool.query(
    "UPDATE job_alert_subscribers SET unsubscribed_at = NOW() WHERE unsubscribe_token = ? AND unsubscribed_at IS NULL",
    [token]
  );
  return (result as { affectedRows: number }).affectedRows > 0;
}
