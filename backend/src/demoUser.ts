import { prisma } from "./prisma";

/**
 * Phase 3 uses a temporary demo user (full authentication comes later).
 * This makes sure a demo role + demo user exist and returns the user id,
 * so newly created vehicles can be assigned an owner.
 */
const DEMO_EMAIL = "demo@mot-uk.local";

export async function ensureDemoUser(): Promise<string> {
  const role = await prisma.role.upsert({
    where: { name: "Owner" },
    update: {},
    create: { name: "Owner" },
  });

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      name: "Demo User",
      email: DEMO_EMAIL,
      roleId: role.id,
    },
  });

  return user.id;
}
