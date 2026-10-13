import { prisma } from "./prisma";

interface AuditInput {
  userId: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

export async function writeAudit(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      beforeJson: (input.before ?? null) as never,
      afterJson: (input.after ?? null) as never,
    },
  });
}
