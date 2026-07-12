import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // -----------------------
  // Departments
  // -----------------------
  const it = await prisma.department.create({
    data: {
      name: "IT",
      code: "IT",
    },
  });

  const hr = await prisma.department.create({
    data: {
      name: "HR",
      code: "HR",
    },
  });

  const finance = await prisma.department.create({
    data: {
      name: "Finance",
      code: "FIN",
    },
  });

  // -----------------------
  // Employees
  // -----------------------
  await prisma.employee.createMany({
    data: [
      {
        name: "Rahul",
        email: "rahul@eco.com",
        password: "password",
        role: "EMPLOYEE",
        xp: 120,
        points: 250,
        departmentId: it.id,
      },
      {
        name: "Priya",
        email: "priya@eco.com",
        password: "password",
        role: "EMPLOYEE",
        xp: 80,
        points: 180,
        departmentId: hr.id,
      },
      {
        name: "Amit",
        email: "amit@eco.com",
        password: "password",
        role: "MANAGER",
        xp: 300,
        points: 500,
        departmentId: finance.id,
      },
      {
        name: "Sara",
        email: "sara@eco.com",
        password: "password",
        role: "EMPLOYEE",
        xp: 150,
        points: 320,
        departmentId: it.id,
      },
    ],
  });

  // -----------------------
  // Challenges
  // -----------------------
  await prisma.challenge.createMany({
    data: [
      {
        title: "Plant 10 Trees",
        description: "Plant ten trees this month.",
        xpReward: 100,
        difficulty: "Medium",
        deadline: new Date("2026-12-31"),
        status: "ACTIVE",
      },
      {
        title: "Cycle to Work",
        description: "Cycle to work for one week.",
        xpReward: 80,
        difficulty: "Easy",
        deadline: new Date("2026-12-31"),
        status: "ACTIVE",
      },
      {
        title: "Zero Plastic Week",
        description: "Avoid single-use plastic.",
        xpReward: 120,
        difficulty: "Hard",
        deadline: new Date("2026-12-31"),
        status: "ACTIVE",
      },
    ],
  });

  // -----------------------
  // Rewards
  // -----------------------
  await prisma.reward.createMany({
    data: [
      {
        name: "Coffee Coupon",
        description: "Free coffee at office café",
        pointsRequired: 100,
        stock: 20,
      },
      {
        name: "Amazon Voucher",
        description: "₹500 Amazon Gift Card",
        pointsRequired: 500,
        stock: 10,
      },
      {
        name: "Movie Ticket",
        description: "One free movie ticket",
        pointsRequired: 300,
        stock: 15,
      },
    ],
  });

  // -----------------------
  // Badges
  // -----------------------
  await prisma.badge.createMany({
    data: [
      {
        name: "Eco Warrior",
        description: "Earn 100 XP",
        xpRequired: 100,
        icon: "🌱",
      },
      {
        name: "Green Champion",
        description: "Earn 300 XP",
        xpRequired: 300,
        icon: "🏆",
      },
      {
        name: "CSR Hero",
        description: "Outstanding sustainability contribution",
        xpRequired: 500,
        icon: "⭐",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });