import { prisma } from '../prisma/client.js';
function buildDateRange(startDate, endDate) {
    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;
    if (gte && Number.isNaN(gte.getTime())) {
        throw createError('startDate must be a valid ISO date string.', 400);
    }
    if (lte && Number.isNaN(lte.getTime())) {
        throw createError('endDate must be a valid ISO date string.', 400);
    }
    if (!gte && !lte)
        return undefined;
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function round2(value) {
    return Math.round(value * 100) / 100;
}
export async function getEnvironmentReport(filters = {}) {
    const { departmentId, startDate, endDate } = filters;
    const createdAtRange = buildDateRange(startDate, endDate);
    const carbonWhere = {
        ...(departmentId !== undefined ? { departmentId } : {}),
        ...(createdAtRange ? { createdAt: createdAtRange } : {}),
    };
    const [totalTransactions, aggregated, departmentGroups, recentTransactions, topContributors,] = await Promise.all([
        // Total count
        prisma.carbonTransaction.count({ where: carbonWhere }),
        // CO2 aggregates
        prisma.carbonTransaction.aggregate({
            where: carbonWhere,
            _sum: { co2Amount: true, quantity: true },
        }),
        // Department-wise totals
        prisma.carbonTransaction.groupBy({
            by: ['departmentId'],
            where: carbonWhere,
            _sum: { co2Amount: true, quantity: true },
            _count: { id: true },
            orderBy: { _sum: { co2Amount: 'desc' } },
        }),
        // Recent transactions
        prisma.carbonTransaction.findMany({
            where: carbonWhere,
            include: { department: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        // Top contributors by lowest CO2 (environmentally positive)
        prisma.carbonTransaction.groupBy({
            by: ['departmentId'],
            where: carbonWhere,
            _sum: { co2Amount: true },
            orderBy: { _sum: { co2Amount: 'asc' } },
            take: 5,
        }),
    ]);
    // Enrich department groups with department names
    const departmentIds = [...new Set([
            ...departmentGroups.map((g) => g.departmentId),
            ...topContributors.map((g) => g.departmentId),
        ])];
    const departments = await prisma.department.findMany({
        where: { id: { in: departmentIds } },
        select: { id: true, name: true, code: true },
    });
    const departmentMap = new Map(departments.map((d) => [d.id, d]));
    const totalCo2 = aggregated._sum.co2Amount ?? 0;
    const totalQuantity = aggregated._sum.quantity ?? 0;
    // Heuristic: transactions with co2Amount === 0 represent "saved" (eco-challenge completions)
    const savedAgg = await prisma.carbonTransaction.aggregate({
        where: { ...carbonWhere, co2Amount: 0 },
        _count: { id: true },
    });
    return {
        summary: {
            totalTransactions,
            totalCarbonEmitted: round2(totalCo2),
            totalQuantity: round2(totalQuantity),
            carbonSaved: savedAgg._count.id,
            netCarbonImpact: round2(totalCo2),
        },
        departmentWiseTotals: departmentGroups.map((g) => ({
            department: departmentMap.get(g.departmentId) ?? { id: g.departmentId },
            totalCo2Emitted: round2(g._sum.co2Amount ?? 0),
            totalQuantity: round2(g._sum.quantity ?? 0),
            transactionCount: g._count.id,
        })),
        topEnvironmentalContributors: topContributors.map((g) => ({
            department: departmentMap.get(g.departmentId) ?? { id: g.departmentId },
            totalCo2Emitted: round2(g._sum.co2Amount ?? 0),
        })),
        recentCarbonTransactions: recentTransactions,
    };
}
export async function getSocialReport(filters = {}) {
    const { departmentId, employeeId, startDate, endDate } = filters;
    const redeemedAtRange = buildDateRange(startDate, endDate);
    const employeeWhere = {
        ...(departmentId !== undefined ? { departmentId } : {}),
        ...(employeeId !== undefined ? { id: employeeId } : {}),
    };
    const participationWhere = {
        ...(employeeId !== undefined ? { employeeId } : {}),
        ...(departmentId !== undefined ? { employee: { departmentId } } : {}),
    };
    const redemptionWhere = {
        ...(employeeId !== undefined ? { employeeId } : {}),
        ...(departmentId !== undefined ? { employee: { departmentId } } : {}),
        ...(redeemedAtRange ? { redeemedAt: redeemedAtRange } : {}),
    };
    const badgeWhere = {
        ...(employeeId !== undefined ? { employeeId } : {}),
        ...(departmentId !== undefined ? { employee: { departmentId } } : {}),
    };
    const [totalEmployees, totalParticipations, completedParticipations, activeParticipations, totalBadges, totalRedemptions, topEmployees, departmentParticipation,] = await Promise.all([
        prisma.employee.count({ where: employeeWhere }),
        prisma.participation.count({ where: participationWhere }),
        prisma.participation.count({ where: { ...participationWhere, status: 'completed' } }),
        prisma.participation.count({ where: { ...participationWhere, status: 'in_progress' } }),
        prisma.employeeBadge.count({ where: badgeWhere }),
        prisma.rewardRedemption.count({ where: redemptionWhere }),
        // Top employees by points
        prisma.employee.findMany({
            where: employeeWhere,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                xp: true,
                points: true,
                departmentId: true,
                department: { select: { id: true, name: true, code: true } },
            },
            orderBy: { points: 'desc' },
            take: 10,
        }),
        // Department participation groupBy
        prisma.participation.groupBy({
            by: ['employeeId'],
            where: participationWhere,
            _count: { id: true },
        }),
    ]);
    // Aggregate department participation counts
    const empIds = departmentParticipation.map((p) => p.employeeId);
    const empDeptMap = await prisma.employee.findMany({
        where: {
            id: { in: empIds },
            ...(departmentId !== undefined ? { departmentId } : {}),
        },
        select: { id: true, departmentId: true },
    });
    const deptParticipationCount = new Map();
    for (const ep of empDeptMap) {
        const match = departmentParticipation.find((p) => p.employeeId === ep.id);
        const count = match?._count.id ?? 0;
        deptParticipationCount.set(ep.departmentId, (deptParticipationCount.get(ep.departmentId) ?? 0) + count);
    }
    const deptIds = [...deptParticipationCount.keys()];
    const deptList = await prisma.department.findMany({
        where: { id: { in: deptIds } },
        select: { id: true, name: true, code: true },
    });
    const deptNameMap = new Map(deptList.map((d) => [d.id, d]));
    return {
        summary: {
            totalEmployees,
            totalParticipations,
            completedParticipations,
            activeParticipations,
            totalBadgesAwarded: totalBadges,
            totalRewardRedemptions: totalRedemptions,
        },
        topEmployeesByPoints: topEmployees,
        departmentParticipation: [...deptParticipationCount.entries()].map(([dId, count]) => ({
            department: deptNameMap.get(dId) ?? { id: dId },
            participationCount: count,
        })),
    };
}
export async function getGovernanceReport(filters = {}) {
    const { departmentId, startDate, endDate } = filters;
    const now = new Date();
    const dueDateRange = buildDateRange(startDate, endDate);
    const baseWhere = {
        ...(departmentId !== undefined ? { departmentId } : {}),
        ...(dueDateRange ? { dueDate: dueDateRange } : {}),
    };
    const [totalIssues, openIssues, resolvedIssues, overdueIssues, departmentGroups, recentIssues,] = await Promise.all([
        prisma.complianceIssue.count({ where: baseWhere }),
        prisma.complianceIssue.count({
            where: { ...baseWhere, status: { notIn: ['RESOLVED', 'resolved'] } },
        }),
        prisma.complianceIssue.count({
            where: { ...baseWhere, status: { in: ['RESOLVED', 'resolved'] } },
        }),
        prisma.complianceIssue.count({
            where: {
                ...baseWhere,
                dueDate: { lt: now },
                status: { notIn: ['RESOLVED', 'resolved'] },
            },
        }),
        // Group by department
        prisma.complianceIssue.groupBy({
            by: ['departmentId'],
            where: baseWhere,
            _count: { id: true },
        }),
        // Recent issues
        prisma.complianceIssue.findMany({
            where: baseWhere,
            include: { department: true },
            orderBy: { id: 'desc' },
            take: 10,
        }),
    ]);
    const compliancePercentage = totalIssues > 0
        ? round2((resolvedIssues / totalIssues) * 100)
        : 100;
    // Enrich department groups
    const deptIds = departmentGroups.map((g) => g.departmentId);
    const deptList = await prisma.department.findMany({
        where: { id: { in: deptIds } },
        select: { id: true, name: true, code: true },
    });
    const deptMap = new Map(deptList.map((d) => [d.id, d]));
    return {
        summary: {
            totalIssues,
            openIssues,
            resolvedIssues,
            overdueIssues,
            compliancePercentage,
        },
        complianceByDepartment: departmentGroups.map((g) => ({
            department: deptMap.get(g.departmentId) ?? { id: g.departmentId },
            totalIssues: g._count.id,
        })),
        recentComplianceIssues: recentIssues,
    };
}
export async function getEsgSummary(filters = {}) {
    const [environmentReport, socialReport, governanceReport] = await Promise.all([
        getEnvironmentReport(filters),
        getSocialReport(filters),
        getGovernanceReport(filters),
    ]);
    // Compute component scores (0–100 each)
    const totalCo2 = environmentReport.summary.totalCarbonEmitted;
    const completedEcoChallenges = socialReport.summary.completedParticipations;
    const totalBadges = socialReport.summary.totalBadgesAwarded;
    const totalParticipations = socialReport.summary.totalParticipations;
    const { openIssues, totalIssues } = governanceReport.summary;
    const environmentalScore = computeEnvironmentalScore(totalCo2, completedEcoChallenges);
    const socialScore = computeSocialScore(totalBadges, totalParticipations);
    const governanceScore = computeGovernanceScore(openIssues, totalIssues);
    const overallEsgScore = round2((environmentalScore + socialScore + governanceScore) / 3);
    // Department-level scores from DepartmentScore table (already computed by ESG scoring module)
    const departmentScoreWhere = filters.departmentId !== undefined
        ? { departmentId: filters.departmentId }
        : {};
    const departmentScores = await prisma.departmentScore.findMany({
        where: departmentScoreWhere,
        include: { department: true },
        orderBy: { overallScore: 'desc' },
    });
    return {
        environmental: {
            score: environmentalScore,
            ...environmentReport.summary,
        },
        social: {
            score: socialScore,
            ...socialReport.summary,
        },
        governance: {
            score: governanceScore,
            ...governanceReport.summary,
        },
        overallEsgScore,
        departmentScores,
        latestStatistics: {
            recentCarbonTransactions: environmentReport.recentCarbonTransactions.slice(0, 5),
            topEmployeesByPoints: socialReport.topEmployeesByPoints.slice(0, 5),
            recentComplianceIssues: governanceReport.recentComplianceIssues.slice(0, 5),
        },
    };
}
// ─── Score helpers (mirrored from dashboard.service) ──────────────────────────
function computeEnvironmentalScore(totalCo2, completedEcoChallenges) {
    const co2Penalty = Math.min(totalCo2 / 100, 50);
    const challengeBonus = Math.min(completedEcoChallenges * 2, 50);
    return round2(Math.max(0, Math.min(100, 50 - co2Penalty + challengeBonus)));
}
function computeSocialScore(totalBadges, totalParticipations) {
    const badgeScore = Math.min(totalBadges * 5, 50);
    const participationScore = Math.min(totalParticipations * 2, 50);
    return round2(Math.min(100, badgeScore + participationScore));
}
function computeGovernanceScore(openIssues, totalIssues) {
    if (totalIssues === 0)
        return 100;
    const resolvedRatio = (totalIssues - openIssues) / totalIssues;
    return round2(resolvedRatio * 100);
}
