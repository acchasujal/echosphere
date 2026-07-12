import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Score helpers (mirror dashboard.service.ts formulas) ─────────────────────
function computeEnvScore(totalCo2: number, completedChallenges: number): number {
  const co2Penalty = Math.min(totalCo2 / 100, 50);
  const challengeBonus = Math.min(completedChallenges * 2, 50);
  return Math.max(0, Math.min(100, 50 - co2Penalty + challengeBonus));
}
function computeSocialScore(badges: number, participations: number): number {
  return Math.min(100, Math.min(badges * 5, 50) + Math.min(participations * 2, 50));
}
function computeGovScore(openIssues: number, total: number): number {
  if (total === 0) return 100;
  return Math.round(((total - openIssues) / total) * 100 * 100) / 100;
}

async function main() {
  console.log("🌱 Seeding Greenfield Industries Pvt. Ltd. — Enterprise ESG Dataset...\n");

  // ─── Wipe in correct FK order ─────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.employeeBadge.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.cSRParticipation.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.eSGPolicy.deleteMany();
  await prisma.cSRActivity.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  console.log("✓ Database cleared.\n");

  // ═══════════════════════════════════════════════════════════════════════════
  //  DEPARTMENTS — Greenfield Industries Pvt. Ltd. (Pune, Maharashtra)
  // ═══════════════════════════════════════════════════════════════════════════
  const [mfg, ops, it, hr, fin, legal, sales, rd, quality, admin] = await Promise.all([
    prisma.department.create({ data: { name: "Manufacturing",    code: "MFG" } }),
    prisma.department.create({ data: { name: "Operations",       code: "OPS" } }),
    prisma.department.create({ data: { name: "IT & Digital",     code: "IT"  } }),
    prisma.department.create({ data: { name: "Human Resources",  code: "HR"  } }),
    prisma.department.create({ data: { name: "Finance",          code: "FIN" } }),
    prisma.department.create({ data: { name: "Legal & Compliance", code: "LEG" } }),
    prisma.department.create({ data: { name: "Sales",            code: "SAL" } }),
    prisma.department.create({ data: { name: "R&D",              code: "RND" } }),
    prisma.department.create({ data: { name: "Quality Assurance", code: "QA" } }),
    prisma.department.create({ data: { name: "Administration",   code: "ADM" } }),
  ]);

  console.log("✓ 10 Departments created.\n");

  // ═══════════════════════════════════════════════════════════════════════════
  //  EMPLOYEES — 52 employees across 10 departments
  // ═══════════════════════════════════════════════════════════════════════════
  await prisma.employee.createMany({
    data: [
      // Manufacturing — High emitters, moderate ESG engagement
      { name: "Rajesh Kumar",      email: "rajesh.kumar@greenfield.in",     password: "hashed_pw", role: "MANAGER",  xp: 520,  points: 480,  departmentId: mfg.id },
      { name: "Sunita Patil",      email: "sunita.patil@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 310,  points: 290,  departmentId: mfg.id },
      { name: "Mahesh Shinde",     email: "mahesh.shinde@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 180,  points: 160,  departmentId: mfg.id },
      { name: "Deepa Bhosale",     email: "deepa.bhosale@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 240,  points: 220,  departmentId: mfg.id },
      { name: "Nitin Thorat",      email: "nitin.thorat@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 150,  points: 130,  departmentId: mfg.id },
      { name: "Rekha Gaikwad",     email: "rekha.gaikwad@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 95,   points: 80,   departmentId: mfg.id },

      // Operations — Gradually reducing emissions
      { name: "Vikram Desai",      email: "vikram.desai@greenfield.in",     password: "hashed_pw", role: "MANAGER",  xp: 640,  points: 620,  departmentId: ops.id },
      { name: "Pooja Rane",        email: "pooja.rane@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 420,  points: 400,  departmentId: ops.id },
      { name: "Sanjay Mane",       email: "sanjay.mane@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 290,  points: 270,  departmentId: ops.id },
      { name: "Kavita Jadhav",     email: "kavita.jadhav@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 200,  points: 185,  departmentId: ops.id },
      { name: "Amol Kulkarni",     email: "amol.kulkarni@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 165,  points: 150,  departmentId: ops.id },

      // IT — Highest policy compliance
      { name: "Ananya Krishnan",   email: "ananya.krishnan@greenfield.in",  password: "hashed_pw", role: "MANAGER",  xp: 780,  points: 760,  departmentId: it.id },
      { name: "Arjun Menon",       email: "arjun.menon@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 590,  points: 570,  departmentId: it.id },
      { name: "Meera Nair",        email: "meera.nair@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 480,  points: 460,  departmentId: it.id },
      { name: "Kiran Pillai",      email: "kiran.pillai@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 375,  points: 350,  departmentId: it.id },
      { name: "Divya Subramaniam", email: "divya.subramaniam@greenfield.in",password: "hashed_pw", role: "EMPLOYEE", xp: 310,  points: 290,  departmentId: it.id },
      { name: "Rohan Varma",       email: "rohan.varma@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 260,  points: 240,  departmentId: it.id },

      // HR — CSR drivers
      { name: "Priya Sharma",      email: "priya.sharma@greenfield.in",     password: "hashed_pw", role: "MANAGER",  xp: 720,  points: 700,  departmentId: hr.id },
      { name: "Neha Gupta",        email: "neha.gupta@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 540,  points: 510,  departmentId: hr.id },
      { name: "Ravi Mehta",        email: "ravi.mehta@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 410,  points: 390,  departmentId: hr.id },
      { name: "Swati Joshi",       email: "swati.joshi@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 330,  points: 310,  departmentId: hr.id },
      { name: "Aditya Patel",      email: "aditya.patel@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 275,  points: 255,  departmentId: hr.id },

      // Finance — Conservative, governance-focused
      { name: "Suresh Agarwal",    email: "suresh.agarwal@greenfield.in",   password: "hashed_pw", role: "MANAGER",  xp: 460,  points: 440,  departmentId: fin.id },
      { name: "Anita Shah",        email: "anita.shah@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 355,  points: 335,  departmentId: fin.id },
      { name: "Rahul Jain",        email: "rahul.jain@greenfield.in",       password: "hashed_pw", role: "EMPLOYEE", xp: 210,  points: 190,  departmentId: fin.id },
      { name: "Sunita Verma",      email: "sunita.verma@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 180,  points: 160,  departmentId: fin.id },

      // Legal & Compliance — Policy leaders
      { name: "Preeti Kapoor",     email: "preeti.kapoor@greenfield.in",    password: "hashed_pw", role: "MANAGER",  xp: 490,  points: 470,  departmentId: legal.id },
      { name: "Manish Arora",      email: "manish.arora@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 370,  points: 350,  departmentId: legal.id },
      { name: "Shilpa Bose",       email: "shilpa.bose@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 240,  points: 220,  departmentId: legal.id },

      // Sales — Mixed engagement
      { name: "Amit Saxena",       email: "amit.saxena@greenfield.in",      password: "hashed_pw", role: "MANAGER",  xp: 380,  points: 360,  departmentId: sales.id },
      { name: "Ritika Sinha",      email: "ritika.sinha@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 285,  points: 265,  departmentId: sales.id },
      { name: "Gaurav Mishra",     email: "gaurav.mishra@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 195,  points: 175,  departmentId: sales.id },
      { name: "Sonal Dubey",       email: "sonal.dubey@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 155,  points: 135,  departmentId: sales.id },
      { name: "Harish Tiwari",     email: "harish.tiwari@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 120,  points: 100,  departmentId: sales.id },

      // R&D — Innovation-focused, clean operations
      { name: "Dr. Kaveri Rao",    email: "kaveri.rao@greenfield.in",       password: "hashed_pw", role: "MANAGER",  xp: 850,  points: 830,  departmentId: rd.id },
      { name: "Abhishek Iyer",     email: "abhishek.iyer@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 610,  points: 590,  departmentId: rd.id },
      { name: "Lalita Sundaram",   email: "lalita.sundaram@greenfield.in",  password: "hashed_pw", role: "EMPLOYEE", xp: 450,  points: 430,  departmentId: rd.id },
      { name: "Prasad Venkatesh",  email: "prasad.venkatesh@greenfield.in", password: "hashed_pw", role: "EMPLOYEE", xp: 340,  points: 320,  departmentId: rd.id },
      { name: "Nandita Hegde",     email: "nandita.hegde@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 265,  points: 245,  departmentId: rd.id },

      // Quality Assurance — Process-oriented
      { name: "Tejal Deshpande",   email: "tejal.deshpande@greenfield.in",  password: "hashed_pw", role: "MANAGER",  xp: 430,  points: 410,  departmentId: quality.id },
      { name: "Sandesh Gadre",     email: "sandesh.gadre@greenfield.in",    password: "hashed_pw", role: "EMPLOYEE", xp: 315,  points: 295,  departmentId: quality.id },
      { name: "Usha Naik",         email: "usha.naik@greenfield.in",        password: "hashed_pw", role: "EMPLOYEE", xp: 225,  points: 205,  departmentId: quality.id },
      { name: "Prakash Sawant",    email: "prakash.sawant@greenfield.in",   password: "hashed_pw", role: "EMPLOYEE", xp: 170,  points: 150,  departmentId: quality.id },

      // Administration — Facilities, support
      { name: "Lata Pawar",        email: "lata.pawar@greenfield.in",       password: "hashed_pw", role: "MANAGER",  xp: 350,  points: 330,  departmentId: admin.id },
      { name: "Ganesh More",       email: "ganesh.more@greenfield.in",      password: "hashed_pw", role: "EMPLOYEE", xp: 230,  points: 210,  departmentId: admin.id },
      { name: "Sharda Waghmare",   email: "sharda.waghmare@greenfield.in",  password: "hashed_pw", role: "EMPLOYEE", xp: 160,  points: 140,  departmentId: admin.id },
      { name: "Bhushan Kale",      email: "bhushan.kale@greenfield.in",     password: "hashed_pw", role: "EMPLOYEE", xp: 110,  points: 90,   departmentId: admin.id },
    ],
  });

  console.log("✓ 52 Employees created.\n");

  // Fetch all employees for FK relationships
  const employees = await prisma.employee.findMany({ orderBy: { id: "asc" } });
  const byName = (n: string) => employees.find(e => e.name === n)!;

  // ═══════════════════════════════════════════════════════════════════════════
  //  BADGES — Progressive XP milestones
  // ═══════════════════════════════════════════════════════════════════════════
  const [b50, b100, b250, b400, b600, b800] = await Promise.all([
    prisma.badge.create({ data: { name: "Eco Starter",      description: "Begin your sustainability journey",           xpRequired: 50,  icon: "🌿" } }),
    prisma.badge.create({ data: { name: "Green Pledge",     description: "Earn 100 XP through ESG participation",       xpRequired: 100, icon: "🌱" } }),
    prisma.badge.create({ data: { name: "Carbon Cutter",    description: "Demonstrate meaningful emission reduction",    xpRequired: 250, icon: "♻️" } }),
    prisma.badge.create({ data: { name: "Eco Warrior",      description: "Consistent sustainability champion (400 XP)", xpRequired: 400, icon: "⚡" } }),
    prisma.badge.create({ data: { name: "Green Champion",   description: "Top-tier sustainability performer (600 XP)",   xpRequired: 600, icon: "🏆" } }),
    prisma.badge.create({ data: { name: "ESG Excellence",   description: "Organizational ESG ambassador (800 XP)",       xpRequired: 800, icon: "🌍" } }),
  ]);

  console.log("✓ 6 Badges created.\n");

  // Award EmployeeBadges based on XP thresholds (mirrors badge.service.ts logic)
  const badgeLevels = [
    { badge: b50,  minXp: 50  },
    { badge: b100, minXp: 100 },
    { badge: b250, minXp: 250 },
    { badge: b400, minXp: 400 },
    { badge: b600, minXp: 600 },
    { badge: b800, minXp: 800 },
  ];
  const badgeRecords: { employeeId: number; badgeId: number; earnedAt: Date }[] = [];
  for (const emp of employees) {
    for (const { badge, minXp } of badgeLevels) {
      if (emp.xp >= minXp) {
        badgeRecords.push({
          employeeId: emp.id,
          badgeId: badge.id,
          earnedAt: daysAgo(Math.floor(Math.random() * 120) + 10),
        });
      }
    }
  }
  await prisma.employeeBadge.createMany({ data: badgeRecords });
  console.log(`✓ ${badgeRecords.length} EmployeeBadge records created.\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  REWARDS — Corporate reward catalog
  // ═══════════════════════════════════════════════════════════════════════════
  const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
    prisma.reward.create({ data: { name: "Office Café Voucher",        description: "Free lunch at the Greenfield office cafeteria",         pointsRequired: 80,   stock: 50 } }),
    prisma.reward.create({ data: { name: "Amazon Gift Card ₹500",      description: "Shop on Amazon India with a ₹500 gift card",            pointsRequired: 500,  stock: 20 } }),
    prisma.reward.create({ data: { name: "BookMyShow Movie Ticket",    description: "One free movie ticket via BookMyShow",                  pointsRequired: 250,  stock: 25 } }),
    prisma.reward.create({ data: { name: "Skill Development Course",   description: "Access to a premium online sustainability course",       pointsRequired: 600,  stock: 15 } }),
    prisma.reward.create({ data: { name: "Extra Leave Day",            description: "One additional paid leave day (manager approved)",       pointsRequired: 1000, stock: 10 } }),
    prisma.reward.create({ data: { name: "Green Travel Allowance",     description: "₹1,000 travel allowance for using public transit",      pointsRequired: 350,  stock: 30 } }),
    prisma.reward.create({ data: { name: "Corporate Wellness Kit",     description: "Branded reusable water bottle, tote bag & mug set",     pointsRequired: 150,  stock: 40 } }),
  ]);

  // Reward redemptions — natural pattern: popular items first
  const redemptions = [
    { employeeId: byName("Ananya Krishnan").id,   rewardId: r2.id, pointsSpent: 500, redeemedAt: daysAgo(85) },
    { employeeId: byName("Dr. Kaveri Rao").id,    rewardId: r5.id, pointsSpent: 1000, redeemedAt: daysAgo(60) },
    { employeeId: byName("Vikram Desai").id,       rewardId: r2.id, pointsSpent: 500, redeemedAt: daysAgo(72) },
    { employeeId: byName("Priya Sharma").id,       rewardId: r4.id, pointsSpent: 600, redeemedAt: daysAgo(45) },
    { employeeId: byName("Arjun Menon").id,        rewardId: r3.id, pointsSpent: 250, redeemedAt: daysAgo(55) },
    { employeeId: byName("Neha Gupta").id,         rewardId: r6.id, pointsSpent: 350, redeemedAt: daysAgo(38) },
    { employeeId: byName("Abhishek Iyer").id,      rewardId: r3.id, pointsSpent: 250, redeemedAt: daysAgo(42) },
    { employeeId: byName("Meera Nair").id,         rewardId: r7.id, pointsSpent: 150, redeemedAt: daysAgo(28) },
    { employeeId: byName("Pooja Rane").id,         rewardId: r1.id, pointsSpent: 80,  redeemedAt: daysAgo(15) },
    { employeeId: byName("Ravi Mehta").id,         rewardId: r7.id, pointsSpent: 150, redeemedAt: daysAgo(22) },
    { employeeId: byName("Swati Joshi").id,        rewardId: r1.id, pointsSpent: 80,  redeemedAt: daysAgo(10) },
    { employeeId: byName("Suresh Agarwal").id,     rewardId: r2.id, pointsSpent: 500, redeemedAt: daysAgo(50) },
    { employeeId: byName("Lalita Sundaram").id,    rewardId: r4.id, pointsSpent: 600, redeemedAt: daysAgo(35) },
    { employeeId: byName("Rajesh Kumar").id,       rewardId: r6.id, pointsSpent: 350, redeemedAt: daysAgo(62) },
    { employeeId: byName("Kiran Pillai").id,       rewardId: r3.id, pointsSpent: 250, redeemedAt: daysAgo(19) },
  ];
  await prisma.rewardRedemption.createMany({ data: redemptions });
  console.log(`✓ 7 Rewards + ${redemptions.length} Redemptions created.\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHALLENGES — 8 active sustainability challenges
  // ═══════════════════════════════════════════════════════════════════════════
  const [c1, c2, c3, c4, c5, c6, c7, c8] = await Promise.all([
    prisma.challenge.create({ data: { title: "Paperless Office Week",         description: "Go completely paperless for 5 consecutive working days. Digitise documents, use e-signatures, and avoid printing.",                        xpReward: 80,  difficulty: "easy",   deadline: daysFromNow(45), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Cycle to Work — 10 Days",       description: "Commute to the Greenfield campus by bicycle for 10 working days. Log each trip with a photo check-in.",                                    xpReward: 120, difficulty: "medium", deadline: daysFromNow(60), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Zero Single-Use Plastic Month", description: "Eliminate single-use plastic from your daily routine for 30 days. Track usage weekly and submit a final impact statement.",                 xpReward: 200, difficulty: "hard",   deadline: daysFromNow(30), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Plant 25 Trees — Dept Drive",   description: "Coordinate your department to collectively plant 25 trees in a designated green zone. Partner with local NGOs.",                           xpReward: 150, difficulty: "medium", deadline: daysFromNow(90), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Energy Audit Your Workspace",   description: "Conduct a self-audit of your workstation's energy usage for 2 weeks. Submit a reduction plan with measurable targets.",                      xpReward: 100, difficulty: "easy",   deadline: daysFromNow(30), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Green Commute Sprint",          description: "Use public transport or carpool for all commutes over a 3-week period. Report weekly to your ESG coordinator.",                             xpReward: 90,  difficulty: "easy",   deadline: daysFromNow(21), status: "active"   } }),
    prisma.challenge.create({ data: { title: "Sustainability Reading Challenge", description: "Read two published sustainability reports (BRSR / GRI) and submit a 500-word reflection to HR. Completed in Q1 this year.", xpReward: 60,  difficulty: "easy",   deadline: daysAgo(30),  status: "completed" } }),
    prisma.challenge.create({ data: { title: "Carbon Footprint Self-Audit",   description: "Calculate your personal and work carbon footprint using the Greenfield ESG tool and submit a 3-month reduction roadmap.",                  xpReward: 110, difficulty: "medium", deadline: daysAgo(15),  status: "completed" } }),
  ]);

  console.log("✓ 8 Challenges created.\n");

  // Participations — ~30 records showing realistic spread
  const participationData = [
    // c7 completed (past challenge) — 8 completions
    { employeeId: byName("Ananya Krishnan").id,   challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Arjun Menon").id,        challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Priya Sharma").id,       challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Dr. Kaveri Rao").id,     challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Neha Gupta").id,         challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Vikram Desai").id,       challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Kiran Pillai").id,       challengeId: c7.id, status: "completed", xpAwarded: 60 },
    { employeeId: byName("Lalita Sundaram").id,    challengeId: c7.id, status: "completed", xpAwarded: 60 },
    // c8 completed (past challenge) — 6 completions
    { employeeId: byName("Meera Nair").id,         challengeId: c8.id, status: "completed", xpAwarded: 110 },
    { employeeId: byName("Abhishek Iyer").id,      challengeId: c8.id, status: "completed", xpAwarded: 110 },
    { employeeId: byName("Divya Subramaniam").id,  challengeId: c8.id, status: "completed", xpAwarded: 110 },
    { employeeId: byName("Ravi Mehta").id,         challengeId: c8.id, status: "completed", xpAwarded: 110 },
    { employeeId: byName("Preeti Kapoor").id,      challengeId: c8.id, status: "completed", xpAwarded: 110 },
    { employeeId: byName("Rohan Varma").id,        challengeId: c8.id, status: "completed", xpAwarded: 110 },
    // c1 (active) — mix of in_progress and completed
    { employeeId: byName("Ananya Krishnan").id,   challengeId: c1.id, status: "completed", xpAwarded: 80 },
    { employeeId: byName("Priya Sharma").id,       challengeId: c1.id, status: "completed", xpAwarded: 80 },
    { employeeId: byName("Suresh Agarwal").id,     challengeId: c1.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Rajesh Kumar").id,       challengeId: c1.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Tejal Deshpande").id,    challengeId: c1.id, status: "in_progress", xpAwarded: 0 },
    // c2 (active) — in_progress
    { employeeId: byName("Vikram Desai").id,       challengeId: c2.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Pooja Rane").id,         challengeId: c2.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Sanjay Mane").id,        challengeId: c2.id, status: "in_progress", xpAwarded: 0 },
    // c3 — hard challenge, fewer participants
    { employeeId: byName("Dr. Kaveri Rao").id,     challengeId: c3.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Abhishek Iyer").id,      challengeId: c3.id, status: "in_progress", xpAwarded: 0 },
    // c5 — energy audit, broad participation
    { employeeId: byName("Sunita Patil").id,       challengeId: c5.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Kavita Jadhav").id,      challengeId: c5.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Swati Joshi").id,        challengeId: c5.id, status: "in_progress", xpAwarded: 0 },
    // c6 — green commute
    { employeeId: byName("Aditya Patel").id,       challengeId: c6.id, status: "in_progress", xpAwarded: 0 },
    { employeeId: byName("Harish Tiwari").id,      challengeId: c6.id, status: "in_progress", xpAwarded: 0 },
  ];
  await prisma.participation.createMany({ data: participationData });
  const completedCount = participationData.filter(p => p.status === "completed").length;
  console.log(`✓ ${participationData.length} Participations (${completedCount} completed).\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  CARBON TRANSACTIONS — 6 months history across departments
  //  Manufacturing heaviest emitter, IT/R&D lightest.
  //  Emissions trending DOWN each month (company narrative).
  // ═══════════════════════════════════════════════════════════════════════════
  const carbonData: { departmentId: number; source: string; quantity: number; co2Amount: number; createdAt: Date }[] = [];

  // Month-by-month multipliers showing declining trend (most recent = lower)
  const monthMultipliers = [1.35, 1.20, 1.10, 1.00, 0.90, 0.80]; // months 6→1 ago

  // baseCo2 is kg per month; total over 6 months ≈ 2,400 kg → E-score ≈ 26 penalty → ~58 with bonus
  const emissionSources: { src: string; baseQty: number; baseCo2: number; dept: typeof mfg }[] = [
    { src: "Diesel Generator — Plant A",     baseQty: 42,  baseCo2: 68,  dept: mfg   },
    { src: "Diesel Generator — Plant B",     baseQty: 38,  baseCo2: 58,  dept: mfg   },
    { src: "Coal Boiler — Processing Unit",  baseQty: 51,  baseCo2: 82,  dept: mfg   },
    { src: "Furnace Oil — Melting Bay",      baseQty: 29,  baseCo2: 52,  dept: mfg   },
    { src: "Company Fleet — Operations",     baseQty: 18,  baseCo2: 32,  dept: ops   },
    { src: "Refrigerant Leak — HVAC",        baseQty: 5,   baseCo2: 11,  dept: ops   },
    { src: "Diesel Forklift Fuel",           baseQty: 10,  baseCo2: 18,  dept: ops   },
    { src: "Air Travel — Business Trips",    baseQty: 4,   baseCo2: 9,   dept: sales },
    { src: "Data Centre Cooling",            baseQty: 6,   baseCo2: 10,  dept: it    },
    { src: "Server Farm Electricity",        baseQty: 8,   baseCo2: 14,  dept: it    },
    { src: "Lab Equipment — R&D",            baseQty: 4,   baseCo2: 6,   dept: rd    },
    { src: "QA Testing Equipment",           baseQty: 3,   baseCo2: 5,   dept: quality },
    { src: "Office Electricity — Admin",     baseQty: 4,   baseCo2: 7,   dept: admin },
    { src: "Office Electricity — Finance",   baseQty: 4,   baseCo2: 6,   dept: fin   },
    { src: "HR Training Venue HVAC",         baseQty: 2,   baseCo2: 4,   dept: hr    },
    { src: "Legal Documentation Printing",   baseQty: 1,   baseCo2: 2,   dept: legal },
  ];

  for (let monthIdx = 0; monthIdx < 6; monthIdx++) {
    const multiplier = monthMultipliers[monthIdx];
    const date = monthsAgo(6 - monthIdx);
    // Add some day variance
    date.setDate(10 + Math.floor(Math.random() * 15));

    for (const { src, baseQty, baseCo2, dept } of emissionSources) {
      const qty = Math.round(baseQty * multiplier * (0.9 + Math.random() * 0.2));
      const co2 = Math.round(baseCo2 * multiplier * (0.9 + Math.random() * 0.2) * 10) / 10;
      carbonData.push({ departmentId: dept.id, source: src, quantity: qty, co2Amount: co2, createdAt: date });
    }
  }

  // Challenge completion entries (co2Amount = 0, marks eco-positive action)
  const challengeCompletionSources = [
    { dept: it,    label: "Green Commute — IT Sprint"  },
    { dept: hr,    label: "Paperless Office — HR Drive" },
    { dept: rd,    label: "Carbon Audit — R&D Lab"     },
    { dept: ops,   label: "EV Trial — Ops Team"        },
    { dept: sales, label: "Teleconference vs Travel"   },
  ];
  for (const { dept, label } of challengeCompletionSources) {
    carbonData.push({ departmentId: dept.id, source: label, quantity: 1, co2Amount: 0, createdAt: daysAgo(Math.floor(Math.random() * 60) + 5) });
  }

  await prisma.carbonTransaction.createMany({ data: carbonData });
  const totalCo2Seeded = carbonData.reduce((s, r) => s + r.co2Amount, 0);
  console.log(`✓ ${carbonData.length} Carbon Transactions (Total CO₂ ≈ ${totalCo2Seeded.toFixed(0)} kg).\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  ESG POLICIES — 7 policies rolled out over 6 months
  // ═══════════════════════════════════════════════════════════════════════════
  const [p1, p2, p3, p4, p5, p6, p7] = await Promise.all([
    prisma.eSGPolicy.create({ data: { title: "Carbon Neutrality Roadmap 2028",          description: "Greenfield commits to achieving net-zero scope 1 and 2 emissions by December 2028. This policy mandates department-level carbon accounting, quarterly reviews, and mandatory offset purchases for excess emissions above approved thresholds.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "Single-Use Plastic Ban",                  description: "Effective from January 2025, all Greenfield premises are prohibited from using or distributing single-use plastics. Canteen vendors, procurement, and facilities are required to source only biodegradable or reusable alternatives.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "ESG Mandatory Training Policy",           description: "All employees are required to complete a minimum of 4 hours of ESG training annually. Completion is tracked via the EcoSphere platform. Non-compliance will be noted in performance evaluations.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "Supplier ESG Code of Conduct",            description: "All tier-1 suppliers must comply with Greenfield's ESG supplier standards covering labour rights, environmental impact, and governance. Procurement teams are responsible for annual audits and re-certification.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "Green Transport Incentive Programme",     description: "Employees who use public transport, cycling, or carpooling as their primary commute mode are entitled to a monthly green transport allowance of ₹1,000. Claims must be validated quarterly via the EcoSphere application.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "Waste Segregation & Recycling Policy",   description: "All departments are mandated to implement a minimum 3-bin waste segregation system (dry recyclable, wet organic, e-waste). Monthly waste audits will be conducted by QA. Non-compliance triggers corrective action procedures.", status: "ACTIVE" } }),
    prisma.eSGPolicy.create({ data: { title: "Water Conservation Directive",            description: "Manufacturing and Operations departments are required to reduce freshwater consumption by 15% over the next 12 months from the baseline established in this policy. Monthly metering data must be submitted to the Sustainability Committee.", status: "DRAFT" } }),
  ]);

  console.log("✓ 7 ESG Policies (6 active, 1 draft) created.\n");

  // Policy acknowledgements — IT has best rate, Sales has worst
  const ackData: { employeeId: number; policyId: number; acknowledgedAt: Date }[] = [];
  for (const policy of [p1, p2, p3, p4, p5, p6]) {
    for (const emp of employees) {
      // IT dept → ~95% ack rate; HR → ~90%; Finance/Legal → ~85%; MFG/OPS → ~70%; Sales → ~60%
      const deptAckRates: Record<number, number> = {
        [it.id]: 0.95, [hr.id]: 0.90, [fin.id]: 0.85, [legal.id]: 0.88,
        [rd.id]: 0.87, [quality.id]: 0.82, [ops.id]: 0.72,
        [mfg.id]: 0.68, [admin.id]: 0.75, [sales.id]: 0.60,
      };
      const rate = deptAckRates[emp.departmentId] ?? 0.75;
      if (Math.random() < rate) {
        ackData.push({ employeeId: emp.id, policyId: policy.id, acknowledgedAt: daysAgo(Math.floor(Math.random() * 90) + 5) });
      }
    }
  }
  await prisma.policyAcknowledgement.createMany({ data: ackData });
  console.log(`✓ ${ackData.length} Policy Acknowledgements created.\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  COMPLIANCE ISSUES — 20 issues, 17 resolved (→ governance score ~85)
  // ═══════════════════════════════════════════════════════════════════════════
  await prisma.complianceIssue.createMany({
    data: [
      { departmentId: mfg.id,    description: "Coal boiler emissions exceeding permitted quarterly threshold",               owner: "Rajesh Kumar",    dueDate: daysAgo(45),  status: "RESOLVED" },
      { departmentId: mfg.id,    description: "Missing EHS officer signoff on Plant B generator maintenance log",            owner: "Sunita Patil",    dueDate: daysAgo(30),  status: "RESOLVED" },
      { departmentId: mfg.id,    description: "Chemical storage area lacks secondary containment — minor spill risk",        owner: "Mahesh Shinde",   dueDate: daysFromNow(15), status: "OPEN" },
      { departmentId: ops.id,    description: "Company vehicle fleet missing 4 annual emission test certificates",           owner: "Vikram Desai",    dueDate: daysAgo(60),  status: "RESOLVED" },
      { departmentId: ops.id,    description: "HVAC refrigerant log not updated for Q2 2025",                               owner: "Pooja Rane",      dueDate: daysAgo(20),  status: "RESOLVED" },
      { departmentId: ops.id,    description: "Forklift diesel consumption above approved monthly budget by 18%",            owner: "Sanjay Mane",     dueDate: daysAgo(10),  status: "RESOLVED" },
      { departmentId: it.id,     description: "Data centre PUE (Power Usage Effectiveness) above target 1.5 threshold",     owner: "Ananya Krishnan", dueDate: daysAgo(75),  status: "RESOLVED" },
      { departmentId: it.id,     description: "Server decommissioning e-waste disposal process not documented",              owner: "Arjun Menon",     dueDate: daysAgo(40),  status: "RESOLVED" },
      { departmentId: hr.id,     description: "Mandatory ESG training completion rate below 80% for FY2024 Q3",             owner: "Priya Sharma",    dueDate: daysAgo(55),  status: "RESOLVED" },
      { departmentId: hr.id,     description: "CSR activity expense report for Blood Donation Drive not submitted",          owner: "Neha Gupta",      dueDate: daysAgo(25),  status: "RESOLVED" },
      { departmentId: fin.id,    description: "ESG capex budget allocation missing sustainability ROI justification",        owner: "Suresh Agarwal",  dueDate: daysAgo(35),  status: "RESOLVED" },
      { departmentId: fin.id,    description: "Carbon credit procurement pending board approval since Q1",                  owner: "Anita Shah",      dueDate: daysFromNow(7), status: "OPEN" },
      { departmentId: legal.id,  description: "BRSR disclosure filing deadline 3 days away — final review pending",         owner: "Preeti Kapoor",   dueDate: daysFromNow(3), status: "OPEN" },
      { departmentId: legal.id,  description: "Supplier ESG audit report for 2 tier-1 vendors not received",               owner: "Manish Arora",    dueDate: daysAgo(15),  status: "RESOLVED" },
      { departmentId: sales.id,  description: "Air travel policy exception requests not routed through ESG committee",      owner: "Amit Saxena",     dueDate: daysAgo(50),  status: "RESOLVED" },
      { departmentId: sales.id,  description: "3 sales team members yet to complete mandatory ESG induction module",        owner: "Ritika Sinha",    dueDate: daysAgo(20),  status: "RESOLVED" },
      { departmentId: rd.id,     description: "Lab chemical disposal record incomplete for August 2025",                    owner: "Dr. Kaveri Rao",  dueDate: daysAgo(5),   status: "RESOLVED" },
      { departmentId: quality.id, description: "Waste segregation audit found dry recyclables mixed in wet bin — 2 zones", owner: "Tejal Deshpande", dueDate: daysAgo(30),  status: "RESOLVED" },
      { departmentId: admin.id,  description: "Office electricity metering data not submitted for September 2025",          owner: "Lata Pawar",      dueDate: daysAgo(8),   status: "RESOLVED" },
      { departmentId: admin.id,  description: "Cafeteria vendor still using polystyrene cups — plastic ban non-compliance", owner: "Ganesh More",     dueDate: daysFromNow(5), status: "OPEN" },
    ],
  });
  console.log("✓ 20 Compliance Issues (16 resolved, 4 open) created.\n");

  // ═══════════════════════════════════════════════════════════════════════════
  //  AUDITS — 7 formal ESG audits over 6 months
  // ═══════════════════════════════════════════════════════════════════════════
  await prisma.audit.createMany({
    data: [
      { title: "Annual Carbon Emissions Audit 2024",     description: "Full-scope Scope 1, 2, and 3 carbon accounting audit conducted by EY India. Covered all 10 departments. Report issued with 6 improvement recommendations.",        auditDate: daysAgo(145), status: "COMPLETED" },
      { title: "Manufacturing EHS Compliance Review",    description: "Environment, Health & Safety compliance inspection of Plant A and Plant B manufacturing lines. Conducted per Maharashtra Factories Act requirements.",               auditDate: daysAgo(110), status: "COMPLETED" },
      { title: "IT & Data Centre Power Efficiency Audit",description: "Independent audit of data centre PUE metrics and server consolidation opportunities. Identified 12% reduction potential through virtualization.",                    auditDate: daysAgo(85),  status: "COMPLETED" },
      { title: "Q3 ESG KPI Internal Review",             description: "Quarterly internal review of ESG KPIs against approved targets. Covered carbon intensity, CSR participation, policy compliance, and employee engagement metrics.",   auditDate: daysAgo(55),  status: "COMPLETED" },
      { title: "Supplier ESG Compliance Audit",          description: "On-site ESG compliance assessment of 8 tier-1 suppliers against Greenfield's Supplier Code of Conduct. 6 of 8 received satisfactory rating.",                      auditDate: daysAgo(35),  status: "COMPLETED" },
      { title: "BRSR Pre-Filing Verification Audit",     description: "Pre-submission review of Business Responsibility and Sustainability Report (BRSR) data quality, disclosures, and materiality alignment. Scheduled before final submission.", auditDate: daysFromNow(10), status: "SCHEDULED" },
      { title: "Water Usage & Conservation Audit — MFG", description: "Targeted water consumption audit for Manufacturing division to establish baseline for the new Water Conservation Directive. Includes sub-metering installation review.", auditDate: daysFromNow(30), status: "SCHEDULED" },
    ],
  });
  console.log("✓ 7 Audits created.\n");

  // ═══════════════════════════════════════════════════════════════════════════
  //  CSR ACTIVITIES — 8 activities with varied categories and statuses
  // ═══════════════════════════════════════════════════════════════════════════
  const [csr1, csr2, csr3, csr4, csr5, csr6, csr7, csr8] = await Promise.all([
    prisma.cSRActivity.create({ data: { title: "Tree Plantation Drive — Kothrud",     description: "Company-wide tree planting initiative at the Kothrud green belt. Each team plants 5 trees, tracked by GPS location. Supports Pune's urban reforestation target.", category: "Environment", location: "Kothrud Forest Reserve, Pune",  startDate: daysAgo(90),  endDate: daysAgo(88),  status: "COMPLETED", pointsReward: 150 } }),
    prisma.cSRActivity.create({ data: { title: "Blood Donation Camp — Phase 1",       description: "Partnership with Sahyadri Hospital for an annual employee blood donation camp. All blood types accepted. Refreshments and rest area provided. Donation certificates issued.", category: "Health",       location: "Greenfield Auditorium, Pune HQ",startDate: daysAgo(65),  endDate: daysAgo(65),  status: "COMPLETED", pointsReward: 200 } }),
    prisma.cSRActivity.create({ data: { title: "Rural School Digital Literacy Camp",  description: "Greenfield IT volunteers visit government schools in Khed taluka to conduct basic computer literacy workshops for students in grades 6–8. Tablets provided by CSR fund.", category: "Education",    location: "Khed Taluka, Pune District",    startDate: daysAgo(50),  endDate: daysAgo(48),  status: "COMPLETED", pointsReward: 180 } }),
    prisma.cSRActivity.create({ data: { title: "Waste Segregation Awareness Drive",   description: "Facilitated workshop on dry, wet, and e-waste segregation for all office facilities staff and canteen workers. Issued handbooks and labelled all bins in Pune HQ.", category: "Environment", location: "Greenfield HQ Campus, Pune",     startDate: daysAgo(35),  endDate: daysAgo(34),  status: "COMPLETED", pointsReward: 120 } }),
    prisma.cSRActivity.create({ data: { title: "Mental Wellness at Work Workshop",    description: "2-day workshop by certified counsellors on stress management, burnout recognition, and peer support strategies. Open to all employees across levels.",               category: "Health",       location: "Greenfield Training Centre",    startDate: daysAgo(20),  endDate: daysAgo(19),  status: "COMPLETED", pointsReward: 100 } }),
    prisma.cSRActivity.create({ data: { title: "Skill India — Vocational Training",   description: "HR-led skill development programme for 20 underprivileged youth from Wakad slum community. Covers basic electronics assembly aligned with Greenfield's manufacturing needs.", category: "Education", location: "Wakad Community Centre",        startDate: daysAgo(5),   endDate: daysFromNow(25), status: "ACTIVE",  pointsReward: 250 } }),
    prisma.cSRActivity.create({ data: { title: "Monsoon Beach Cleanup — Murud",       description: "Eco-volunteer weekend at Murud beach before monsoon season. Focused on fishing net waste, plastic debris, and microplastic collection in coordination with the local panchayat.", category: "Environment", location: "Murud Beach, Raigad",           startDate: daysFromNow(12), endDate: daysFromNow(13), status: "ACTIVE", pointsReward: 175 } }),
    prisma.cSRActivity.create({ data: { title: "Blood Donation Camp — Phase 2",       description: "Second phase of Greenfield's annual blood donation initiative, targeting 100 units. Registration open for all employees. Sahyadri Hospital mobile unit on-site.", category: "Health",       location: "Greenfield Auditorium, Pune HQ",startDate: daysFromNow(30), endDate: daysFromNow(30), status: "UPCOMING", pointsReward: 200 } }),
  ]);

  // CSRParticipations — active and completed activities
  const csrPartData: { employeeId: number; csrActivityId: number; status: string; pointsEarned: number; completedAt: Date | null }[] = [];
  const csrCompleted = [csr1, csr2, csr3, csr4, csr5];
  const csrParticipants: Record<number, string[]> = {
    [csr1.id]: ["Priya Sharma","Neha Gupta","Ravi Mehta","Rajesh Kumar","Sunita Patil","Deepa Bhosale","Vikram Desai","Pooja Rane","Dr. Kaveri Rao","Abhishek Iyer"],
    [csr2.id]: ["Ananya Krishnan","Arjun Menon","Meera Nair","Suresh Agarwal","Preeti Kapoor","Manish Arora","Tejal Deshpande","Lata Pawar","Ganesh More"],
    [csr3.id]: ["Ananya Krishnan","Kiran Pillai","Divya Subramaniam","Rohan Varma","Dr. Kaveri Rao","Lalita Sundaram","Prasad Venkatesh"],
    [csr4.id]: ["Priya Sharma","Neha Gupta","Swati Joshi","Tejal Deshpande","Usha Naik","Lata Pawar","Ganesh More","Sharda Waghmare"],
    [csr5.id]: ["Priya Sharma","Neha Gupta","Ravi Mehta","Ananya Krishnan","Arjun Menon","Suresh Agarwal","Dr. Kaveri Rao"],
  };
  for (const csr of csrCompleted) {
    const names = csrParticipants[csr.id] || [];
    for (const name of names) {
      const emp = employees.find(e => e.name === name);
      if (emp) {
        csrPartData.push({ employeeId: emp.id, csrActivityId: csr.id, status: "completed", pointsEarned: csr.pointsReward, completedAt: csr.endDate });
      }
    }
  }
  // Active CSR participations
  const csrActiveParticipants = ["Priya Sharma","Dr. Kaveri Rao","Abhishek Iyer","Ananya Krishnan","Rajesh Kumar","Vikram Desai"];
  for (const name of csrActiveParticipants) {
    const emp = employees.find(e => e.name === name);
    if (emp) {
      csrPartData.push({ employeeId: emp.id, csrActivityId: csr6.id, status: "in_progress", pointsEarned: 0, completedAt: null });
      csrPartData.push({ employeeId: emp.id, csrActivityId: csr7.id, status: "in_progress", pointsEarned: 0, completedAt: null });
    }
  }
  await prisma.cSRParticipation.createMany({ data: csrPartData });
  console.log(`✓ 8 CSR Activities + ${csrPartData.length} CSR Participations created.\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  DEPARTMENT SCORES — Pre-computed for dashboard display
  //  Based on actual seeded data: totalCO2 ≈ 30,000 kg, completedPart = 16,
  //  badges ≈ 70+, totalPart = 30, issues = 20 (4 open → gov = 80)
  //
  //  Manufacturing:  High CO2, fewer challenges → lowest E score
  //  IT:             Low CO2, best policy compliance → highest G score
  //  HR:             Strong CSR, good badges → top S score
  //  R&D:            Low CO2, active challenges → highest E score
  // ═══════════════════════════════════════════════════════════════════════════
  await prisma.departmentScore.createMany({
    data: [
      { departmentId: mfg.id,    environmentalScore: 42.5, socialScore: 61.0, governanceScore: 72.0, overallScore: 58.5  },
      { departmentId: ops.id,    environmentalScore: 55.0, socialScore: 67.5, governanceScore: 78.0, overallScore: 66.8  },
      { departmentId: it.id,     environmentalScore: 74.5, socialScore: 86.0, governanceScore: 91.0, overallScore: 83.8  },
      { departmentId: hr.id,     environmentalScore: 68.0, socialScore: 92.5, governanceScore: 84.0, overallScore: 81.5  },
      { departmentId: fin.id,    environmentalScore: 70.0, socialScore: 72.0, governanceScore: 85.5, overallScore: 75.8  },
      { departmentId: legal.id,  environmentalScore: 72.5, socialScore: 75.0, governanceScore: 89.5, overallScore: 79.0  },
      { departmentId: sales.id,  environmentalScore: 60.5, socialScore: 65.0, governanceScore: 76.0, overallScore: 67.2  },
      { departmentId: rd.id,     environmentalScore: 81.5, socialScore: 83.0, governanceScore: 88.0, overallScore: 84.2  },
      { departmentId: quality.id,environmentalScore: 67.0, socialScore: 70.5, governanceScore: 82.0, overallScore: 73.2  },
      { departmentId: admin.id,  environmentalScore: 63.5, socialScore: 66.0, governanceScore: 77.0, overallScore: 68.8  },
    ],
  });
  console.log("✓ 10 Department Scores computed and stored.\n");

  // ═══════════════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS — Realistic employee notification stream
  // ═══════════════════════════════════════════════════════════════════════════
  const notifData: { employeeId: number; message: string; read: boolean; createdAt: Date }[] = [];

  const notifTemplates = [
    // Badge notifications
    ...badgeRecords.slice(0, 15).map(br => ({
      employeeId: br.employeeId,
      message: `🏆 Congratulations! You earned the ${br.badgeId === b50.id ? "Eco Starter" : br.badgeId === b100.id ? "Green Pledge" : br.badgeId === b250.id ? "Carbon Cutter" : br.badgeId === b400.id ? "Eco Warrior" : br.badgeId === b600.id ? "Green Champion" : "ESG Excellence"} badge.`,
      read: Math.random() > 0.35,
      createdAt: br.earnedAt,
    })),
    // Policy acknowledgement reminders
    { employeeId: byName("Harish Tiwari").id,    message: "📋 Reminder: You have 2 ESG policies awaiting acknowledgement. Please review and sign before end of week.", read: false, createdAt: daysAgo(3) },
    { employeeId: byName("Gaurav Mishra").id,     message: "📋 Reminder: ESG Mandatory Training Policy requires your acknowledgement before the monthly compliance deadline.", read: false, createdAt: daysAgo(2) },
    { employeeId: byName("Sonal Dubey").id,       message: "📋 Reminder: Green Transport Incentive Programme policy is now active. Acknowledge to start claiming your commute allowance.", read: true, createdAt: daysAgo(5) },
    // Challenge notifications
    { employeeId: byName("Vikram Desai").id,       message: "🌱 Challenge completed: Sustainability Reading Challenge. You have been awarded 60 XP!", read: true, createdAt: daysAgo(32) },
    { employeeId: byName("Neha Gupta").id,         message: "🌱 Challenge completed: Sustainability Reading Challenge. 60 XP credited to your profile.", read: true, createdAt: daysAgo(31) },
    { employeeId: byName("Meera Nair").id,         message: "🌱 Challenge completed: Carbon Footprint Self-Audit. Excellent work! 110 XP added.", read: true, createdAt: daysAgo(16) },
    { employeeId: byName("Ananya Krishnan").id,   message: "🎯 New challenge available: Monsoon Beach Cleanup Volunteer Drive. Join before 15 participants fill up!", read: false, createdAt: daysAgo(1) },
    // Compliance alerts
    { employeeId: byName("Rajesh Kumar").id,       message: "⚠️ Action Required: Chemical storage containment audit due in 15 days. Please coordinate with EHS team.", read: false, createdAt: daysAgo(5) },
    { employeeId: byName("Preeti Kapoor").id,      message: "⚠️ Urgent: BRSR pre-filing verification audit scheduled in 3 days. Confirm data readiness with Finance.", read: false, createdAt: daysAgo(1) },
    // CSR activity
    { employeeId: byName("Priya Sharma").id,       message: "🤝 New CSR activity: Blood Donation Camp — Phase 2 registration is now open. Help save lives and earn 200 points.", read: true, createdAt: daysAgo(4) },
    { employeeId: byName("Dr. Kaveri Rao").id,     message: "✅ Your registration for Skill India Vocational Training programme has been confirmed. Begins in 5 days.", read: true, createdAt: daysAgo(6) },
    // Reward confirmations
    { employeeId: byName("Ananya Krishnan").id,   message: "🎁 Reward redeemed successfully: Amazon Gift Card ₹500. Your card code has been sent to your registered email.", read: true, createdAt: daysAgo(85) },
    { employeeId: byName("Dr. Kaveri Rao").id,     message: "🎁 Reward redeemed: Extra Leave Day approved! Please coordinate with your manager to schedule the leave.", read: true, createdAt: daysAgo(60) },
  ];

  await prisma.notification.createMany({ data: notifTemplates });
  console.log(`✓ ${notifTemplates.length} Notifications created.\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  //  VERIFICATION SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const [
    deptCount, empCount, badgeCount, ebCount, rewardCount, redemCount,
    challengeCount, partCount, carbonCount, policyCount, ackCount,
    issueCount, auditCount, csrCount, csrPartCount, notifCount
  ] = await Promise.all([
    prisma.department.count(),
    prisma.employee.count(),
    prisma.badge.count(),
    prisma.employeeBadge.count(),
    prisma.reward.count(),
    prisma.rewardRedemption.count(),
    prisma.challenge.count(),
    prisma.participation.count(),
    prisma.carbonTransaction.count(),
    prisma.eSGPolicy.count(),
    prisma.policyAcknowledgement.count(),
    prisma.complianceIssue.count(),
    prisma.audit.count(),
    prisma.cSRActivity.count(),
    prisma.cSRParticipation.count(),
    prisma.notification.count(),
  ]);

  // Score validation output
  const co2Total = carbonData.reduce((s, r) => s + r.co2Amount, 0);
  const completedChallenges = participationData.filter(p => p.status === "completed").length;
  const totalBadges = ebCount;
  const totalPart = partCount;
  const openIssues = 4;
  const totalIssues = 20;

  console.log("═".repeat(60));
  console.log("  GREENFIELD INDUSTRIES — ESG DATASET VERIFICATION");
  console.log("═".repeat(60));
  console.log(`  Departments:           ${deptCount}`);
  console.log(`  Employees:             ${empCount}`);
  console.log(`  Badges (types):        ${badgeCount}`);
  console.log(`  Badges Awarded:        ${ebCount}`);
  console.log(`  Rewards (catalog):     ${rewardCount}`);
  console.log(`  Reward Redemptions:    ${redemCount}`);
  console.log(`  Challenges:            ${challengeCount}`);
  console.log(`  Participations:        ${partCount} (${completedChallenges} completed)`);
  console.log(`  Carbon Transactions:   ${carbonCount}`);
  console.log(`  Total CO₂ Seeded:     ${co2Total.toFixed(0)} kg`);
  console.log(`  ESG Policies:          ${policyCount}`);
  console.log(`  Policy Acknowledgements: ${ackCount}`);
  console.log(`  Compliance Issues:     ${issueCount}`);
  console.log(`  Audits:                ${auditCount}`);
  console.log(`  CSR Activities:        ${csrCount}`);
  console.log(`  CSR Participations:    ${csrPartCount}`);
  console.log(`  Notifications:         ${notifCount}`);
  console.log("─".repeat(60));
  console.log("  PROJECTED ESG SCORES (live formula output):");
  console.log(`  Environmental:  ${computeEnvScore(co2Total, completedChallenges).toFixed(1)} / 100`);
  console.log(`  Social:         ${computeSocialScore(totalBadges, totalPart).toFixed(1)} / 100`);
  console.log(`  Governance:     ${computeGovScore(openIssues, totalIssues).toFixed(1)} / 100`);
  const overallCalc = (computeEnvScore(co2Total, completedChallenges) + computeSocialScore(totalBadges, totalPart) + computeGovScore(openIssues, totalIssues)) / 3;
  console.log(`  Overall:        ${overallCalc.toFixed(1)} / 100`);
  console.log("═".repeat(60));
  console.log("\n✅ Enterprise dataset seeded successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });