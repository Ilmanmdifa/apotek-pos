import type { StaffRole } from "@prisma/client";

const ROLE_RANK: Record<StaffRole, number> = {
  KASIR: 1,
  APOTEKER: 2,
  OWNER: 3,
};

export function hasSufficientRole(
  role: StaffRole,
  minimum: StaffRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
