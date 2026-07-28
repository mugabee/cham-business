import "server-only";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export async function logAudit(
  connOrPool: Pool | PoolConnection,
  params: {
    staffId: number | null;
    action: string;
    entity: string;
    entityId: number;
    detail?: Record<string, unknown>;
  }
): Promise<void> {
  await connOrPool.query(
    "INSERT INTO audit_log (staff_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)",
    [
      params.staffId,
      params.action,
      params.entity,
      params.entityId,
      params.detail ? JSON.stringify(params.detail) : null,
    ]
  );
}

export type AuditRow = {
  id: number;
  staffId: number | null;
  staffEmail: string | null;
  action: string;
  entity: string;
  entityId: number;
  detail: Record<string, unknown> | null;
  createdAt: Date;
};

export async function listAuditLog(opts: {
  entity?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditRow[]> {
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.entity) {
    conditions.push("audit_log.entity = ?");
    values.push(opts.entity);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT audit_log.id, audit_log.staff_id, staff.email AS staff_email,
            audit_log.action, audit_log.entity, audit_log.entity_id,
            audit_log.detail, audit_log.created_at
     FROM audit_log
     LEFT JOIN staff ON staff.id = audit_log.staff_id
     ${where}
     ORDER BY audit_log.id DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    staffId: row.staff_id,
    staffEmail: row.staff_email,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    detail: row.detail ? JSON.parse(row.detail) : null,
    createdAt: row.created_at,
  }));
}
