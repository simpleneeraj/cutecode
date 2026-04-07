import { prisma } from "@/lib/db";
import { AuditAction } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

/**
 * AuditLogger — append-only audit trail.
 *
 * Every billing mutation must call this. Never delete rows.
 * Safe to call outside a transaction (emits its own INSERT).
 * Never throws — logs errors internally so it never crashes the billing flow.
 */
export class AuditLogger {
  static async record(params: {
    userId?: string;
    action: AuditAction;
    metadata?: Record<string, unknown>;
    ipHash?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          metadata: params.metadata ? (params.metadata as object) : undefined,
          ipHash: params.ipHash ?? null,
        },
      });
    } catch (err) {
      logger.error({ err, userId: params.userId, action: params.action }, "[AuditLogger] Failed to write audit log");
    }
  }
}
