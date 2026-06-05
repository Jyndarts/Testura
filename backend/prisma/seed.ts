import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo@test.com" },
    update: {},
    create: {
      name: "Demo QA",
      email: "demo@test.com",
      passwordHash,
    },
  });

  console.log("✅ Created demo user (demo@test.com / password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
