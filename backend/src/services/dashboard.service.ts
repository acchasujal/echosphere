import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const dashboardEmployeeInclude = {
  department: true,
} as const;

const dashboardDepartmentScoreInclude = {
  department: true,
} as const;

type DashboardEmployee = Prisma.EmployeeGetPayload<{
  include: typeof dashboardEmployeeInclude;
}>;

type DashboardDepartmentScore = Prisma.DepartmentScoreGetPayload<{
  include: typeof dashboardDepartmentScoreInclude;
}>;

function sanitizeEmployee(employee: DashboardEmployee) {
  const { password, ...employeeData } = employee;
  return employeeData;
}

function averageScores(scores: DashboardDepartmentScore[], key: keyof Pick<DashboardDepartmentScore, 'environmentalScore' | 'socialScore' | 'governanceScore'>) {
  if (scores.length === 0) {
    return 0;
  }

  return scores.reduce((total, score) => total + score[key], 0) / scores.length;
}

export async function getDashboard() {
  const [departmentScores, employees, challenges, scoreSummary, employeeCount, challengeCount, rewardCount, departmentCount, carbonTransactionCount] = await Promise.all([
    prisma.departmentScore.findMany({
      include: dashboardDepartmentScoreInclude,
      orderBy: {
        departmentId: 'asc',
      },
    }),
    prisma.employee.findMany({
      include: dashboardEmployeeInclude,
      orderBy: {
        xp: 'desc',
      },
      take: 5,
    }),
    prisma.challenge.findMany({
      orderBy: {
        deadline: 'desc',
      },
      take: 5,
    }),
    prisma.departmentScore.aggregate({
      _avg: {
        overallScore: true,
      },
    }),
    prisma.employee.count(),
    prisma.challenge.count(),
    prisma.reward.count(),
    prisma.department.count(),
    prisma.carbonTransaction.count(),
  ]);

  return {
    environmentalScore: averageScores(departmentScores, 'environmentalScore'),
    socialScore: averageScores(departmentScores, 'socialScore'),
    governanceScore: averageScores(departmentScores, 'governanceScore'),
    overallScore: scoreSummary._avg.overallScore ?? 0,
    departmentScores,
    topEmployees: employees.map(sanitizeEmployee),
    recentChallenges: challenges,
    statistics: {
      employeeCount,
      challengeCount,
      rewardCount,
      departmentCount,
      carbonTransactionCount,
    },
  };
}