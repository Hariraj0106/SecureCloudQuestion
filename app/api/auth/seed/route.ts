import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    const isExplicitSeed = req.headers.get("x-seed-force") === "true";

    if (userCount > 0 && !isExplicitSeed) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized with institutional accounts",
        count: userCount,
      });
    }

    const defaultPassword = "Admin@Secure2026!";
    const hashedPassword = await hashPassword(defaultPassword);

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

    for (const userData of seedUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: userData.password,
          isActive: true,
        },
        create: userData,
      });
    }

    await logAudit({
      action: "CREATE_USER",
      description: "Institutional demonstration accounts seeded successfully",
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Default institutional roles seeded successfully",
      defaultAccounts: seedUsers.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        defaultPassword: "Admin@Secure2026!",
      })),
    });
  } catch (error) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { success: false, message: "Database seeding failed" },
      { status: 500 }
    );
  }
}
