import { prisma } from '../prisma/client.js';
const dashboardEmployeeInclude = {
    department: true,
};
const dashboardDepartmentScoreInclude = {
    department: true,
};
function sanitizeEmployee(employee) {
    const { password, ...employeeData } = employee;
    return employeeData;
}
function averageScores(scores, key) {
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
export async function getEsgScores() {
    const [totalCo2, completedEcoChallenges, totalBadges, totalParticipations, openComplianceIssues, totalComplianceIssues,] = await Promise.all([
        prisma.carbonTransaction.aggregate({
            _sum: { co2Amount: true },
        }),
        prisma.participation.count({
            where: { status: 'completed' },
        }),
        prisma.employeeBadge.count(),
        prisma.participation.count(),
        prisma.complianceIssue.count({
            where: { status: { notIn: ['RESOLVED', 'resolved'] } },
        }),
        prisma.complianceIssue.count(),
    ]);
    const totalCo2Amount = totalCo2._sum.co2Amount ?? 0;
    const environmentalScore = computeEnvironmentalScore(totalCo2Amount, completedEcoChallenges);
    const socialScore = computeSocialScore(totalBadges, totalParticipations);
    const governanceScore = computeGovernanceScore(openComplianceIssues, totalComplianceIssues);
    const overallScore = (environmentalScore + socialScore + governanceScore) / 3;
    return {
        environmentalScore: round2(environmentalScore),
        socialScore: round2(socialScore),
        governanceScore: round2(governanceScore),
        overallScore: round2(overallScore),
    };
}
function round2(value) {
    return Math.round(value * 100) / 100;
}
function computeEnvironmentalScore(totalCo2, completedEcoChallenges) {
    const co2Penalty = Math.min(totalCo2 / 100, 50);
    const challengeBonus = Math.min(completedEcoChallenges * 2, 50);
    return Math.max(0, Math.min(100, 50 - co2Penalty + challengeBonus));
}
function computeSocialScore(totalBadges, totalParticipations) {
    const badgeScore = Math.min(totalBadges * 5, 50);
    const participationScore = Math.min(totalParticipations * 2, 50);
    return Math.min(100, badgeScore + participationScore);
}
function computeGovernanceScore(openIssues, totalIssues) {
    if (totalIssues === 0) {
        return 100;
    }
    const resolvedRatio = (totalIssues - openIssues) / totalIssues;
    return Math.round(resolvedRatio * 100 * 100) / 100;
}
