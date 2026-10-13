import type { StaffRole } from "@prisma/client";
import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";
import { hasSufficientRole } from "./role-rank";

export { hasSufficientRole };

export interface StaffContext {
  stackUserId: string;
  ownerId: string;
  role: StaffRole;
}

export async function getStaffContext(): Promise<StaffContext> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Harus masuk untuk mengakses.");
  }
  const staff = await prisma.staffMember.findUnique({
    where: { userId: user.id },
  });

  if (!staff) {
    return { stackUserId: user.id, ownerId: user.id, role: "OWNER" };
  }

  return { stackUserId: user.id, ownerId: staff.ownerId, role: staff.role };
}

export async function requireStaff(
  minimum: StaffRole,
): Promise<StaffContext> {
  const ctx = await getStaffContext();

  if (!hasSufficientRole(ctx.role, minimum)) {
    throw new Error("Tidak berwenang: butuh peran minimal " + minimum);
  }

  return ctx;
}
