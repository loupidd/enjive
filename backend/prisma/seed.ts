import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  const passwordHash = await bcrypt.hash("Admin@1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@enjive.com" },
    update: {},
    create: {
      email: "admin@enjive.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅  Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
