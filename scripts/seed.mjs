import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding SC-QPMS Database with default institutional accounts...");

  const defaultPassword = "Admin@Secure2026!";
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  const seedUsers = [
    {
      name: "Security Administrator",
      email: "admin@sc-qpms.edu",
      password: hashedPassword,
      role: "Admin",
      isActive: true,
    },
    {
      name: "Dr. Evelyn Vance (Question Setter)",
      email: "setter@sc-qpms.edu",
      password: hashedPassword,
      role: "Question Setter",
      isActive: true,
    },
    {
      name: "Prof. Arthur Pendelton (Reviewer)",
      email: "reviewer@sc-qpms.edu",
      password: hashedPassword,
      role: "Reviewer",
      isActive: true,
    },
    {
      name: "Dean Marcus Sterling (Examination Authority)",
      email: "authority@sc-qpms.edu",
      password: hashedPassword,
      role: "Examination Authority",
      isActive: true,
    },
    {
      name: "Chief Invigilator - Center Alpha",
      email: "examcenter@sc-qpms.edu",
      password: hashedPassword,
      role: "Examination Center",
      isActive: true,
    },
  ];

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: u.password,
        isActive: true,
      },
      create: u,
    });
    console.log(`✅ Seeded: ${user.name} (${user.role}) -> ${user.email}`);
  }

  console.log("\n🎉 Seed complete! Default password for all seed accounts: Admin@Secure2026!\n");
  await prisma.$disconnect();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("❌ Seed Error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
