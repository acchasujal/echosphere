import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import { prisma } from '../prisma/client.js';
const DEFAULT_INSIGHTS = {
    overallSummary: 'AI insights are temporarily unavailable.',
    environmentalAnalysis: 'Environmental performance should be reviewed against recent carbon activity and department scores.',
    socialAnalysis: 'Social performance should be reviewed against participation, recognition, and reward engagement trends.',
    governanceAnalysis: 'Governance performance should be reviewed against compliance, audit, and policy acknowledgement trends.',
    strengths: [],
    weaknesses: [],
    priorityActions: [],
    riskLevel: 'medium',
    priorityDepartment: 'No priority department identified',
    executiveSummary: 'AI insights are temporarily unavailable. Deterministic recommendations were generated from current ESG metrics.',
};
function round2(value) {
    return Math.round(value * 100) / 100;
}
function getStatusCount(items) {
    return items.reduce((counts, item) => {
        const status = item.status.toLowerCase();
        counts[status] = (counts[status] ?? 0) + 1;
        return counts;
    }, {});
}
function isResolvedStatus(status) {
    return status.toLowerCase() === 'resolved';
}
function extractJson(text) {
    const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Gemini response did not contain JSON.');
    }
    return JSON.parse(trimmed.slice(start, end + 1));
}
function toStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim());
}
function normalizeRiskLevel(value) {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
            return normalized;
        }
    }
    return 'medium';
}
function normalizeInsights(value) {
    return {
        overallSummary: typeof value.overallSummary === 'string' ? value.overallSummary : DEFAULT_INSIGHTS.overallSummary,
        environmentalAnalysis: typeof value.environmentalAnalysis === 'string' ? value.environmentalAnalysis : DEFAULT_INSIGHTS.environmentalAnalysis,
        socialAnalysis: typeof value.socialAnalysis === 'string' ? value.socialAnalysis : DEFAULT_INSIGHTS.socialAnalysis,
        governanceAnalysis: typeof value.governanceAnalysis === 'string' ? value.governanceAnalysis : DEFAULT_INSIGHTS.governanceAnalysis,
        strengths: toStringArray(value.strengths),
        weaknesses: toStringArray(value.weaknesses),
        priorityActions: toStringArray(value.priorityActions),
        riskLevel: normalizeRiskLevel(value.riskLevel),
        priorityDepartment: typeof value.priorityDepartment === 'string' && value.priorityDepartment.trim().length > 0
            ? value.priorityDepartment.trim()
            : DEFAULT_INSIGHTS.priorityDepartment,
        executiveSummary: typeof value.executiveSummary === 'string' ? value.executiveSummary : DEFAULT_INSIGHTS.executiveSummary,
    };
}
async function collectEsgData() {
    const now = new Date();
    const [departmentScores, recentCarbonTransactions, complianceIssues, csrActivities, challengeParticipations, topEmployees, rewardRedemptions, badgesAwarded, recentNotifications, recentAudits, recentPolicies, recentPolicyAcknowledgements, carbonAggregate, participationCount, completedParticipationCount, csrParticipationCount, completedCsrParticipationCount,] = await Promise.all([
        prisma.departmentScore.findMany({
            select: {
                environmentalScore: true,
                socialScore: true,
                governanceScore: true,
                overallScore: true,
                updatedAt: true,
                department: { select: { id: true, name: true, code: true } },
            },
            orderBy: { overallScore: 'asc' },
        }),
        prisma.carbonTransaction.findMany({
            select: {
                source: true,
                quantity: true,
                co2Amount: true,
                createdAt: true,
                department: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 15,
        }),
        prisma.complianceIssue.findMany({
            select: {
                description: true,
                owner: true,
                dueDate: true,
                status: true,
                department: { select: { id: true, name: true, code: true } },
            },
            orderBy: { dueDate: 'asc' },
            take: 25,
        }),
        prisma.cSRActivity.findMany({
            select: {
                title: true,
                category: true,
                status: true,
                pointsReward: true,
                startDate: true,
                endDate: true,
                _count: { select: { participations: true } },
            },
            orderBy: { startDate: 'desc' },
            take: 15,
        }),
        prisma.participation.findMany({
            select: {
                status: true,
                xpAwarded: true,
                employee: {
                    select: {
                        name: true,
                        department: { select: { id: true, name: true, code: true } },
                    },
                },
                challenge: { select: { title: true, difficulty: true, status: true } },
            },
            orderBy: { id: 'desc' },
            take: 25,
        }),
        prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                xp: true,
                points: true,
                department: { select: { id: true, name: true, code: true } },
            },
            orderBy: [{ xp: 'desc' }, { points: 'desc' }],
            take: 10,
        }),
        prisma.rewardRedemption.findMany({
            select: {
                redeemedAt: true,
                pointsSpent: true,
                employee: {
                    select: {
                        name: true,
                        department: { select: { id: true, name: true, code: true } },
                    },
                },
                reward: { select: { name: true, pointsRequired: true } },
            },
            orderBy: { redeemedAt: 'desc' },
            take: 15,
        }),
        prisma.employeeBadge.findMany({
            select: {
                earnedAt: true,
                employee: {
                    select: {
                        name: true,
                        department: { select: { id: true, name: true, code: true } },
                    },
                },
                badge: { select: { name: true, xpRequired: true } },
            },
            orderBy: { earnedAt: 'desc' },
            take: 15,
        }),
        prisma.notification.findMany({
            select: {
                message: true,
                read: true,
                createdAt: true,
                employee: {
                    select: {
                        name: true,
                        department: { select: { id: true, name: true, code: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 15,
        }),
        prisma.audit.findMany({
            select: {
                title: true,
                status: true,
                auditDate: true,
            },
            orderBy: { auditDate: 'desc' },
            take: 15,
        }),
        prisma.eSGPolicy.findMany({
            select: {
                title: true,
                status: true,
                _count: { select: { acknowledgements: true } },
            },
            orderBy: { id: 'desc' },
            take: 15,
        }),
        prisma.policyAcknowledgement.findMany({
            select: {
                acknowledgedAt: true,
                employee: {
                    select: {
                        name: true,
                        department: { select: { id: true, name: true, code: true } },
                    },
                },
                policy: { select: { title: true, status: true } },
            },
            orderBy: { acknowledgedAt: 'desc' },
            take: 15,
        }),
        prisma.carbonTransaction.aggregate({
            _sum: { co2Amount: true },
            _avg: { co2Amount: true },
            _count: { id: true },
        }),
        prisma.participation.count(),
        prisma.participation.count({ where: { status: 'completed' } }),
        prisma.cSRParticipation.count(),
        prisma.cSRParticipation.count({ where: { status: 'completed' } }),
    ]);
    const openComplianceIssues = complianceIssues.filter((issue) => !isResolvedStatus(issue.status));
    const overdueComplianceIssues = openComplianceIssues.filter((issue) => issue.dueDate < now);
    const weakestDepartment = departmentScores[0];
    const highestEmissionTransaction = recentCarbonTransactions.reduce((highest, transaction) => transaction.co2Amount > highest.co2Amount ? transaction : highest, recentCarbonTransactions[0]);
    return {
        scoreSummary: {
            averageEnvironmentalScore: round2(departmentScores.reduce((sum, score) => sum + score.environmentalScore, 0) / (departmentScores.length || 1)),
            averageSocialScore: round2(departmentScores.reduce((sum, score) => sum + score.socialScore, 0) / (departmentScores.length || 1)),
            averageGovernanceScore: round2(departmentScores.reduce((sum, score) => sum + score.governanceScore, 0) / (departmentScores.length || 1)),
            averageOverallScore: round2(departmentScores.reduce((sum, score) => sum + score.overallScore, 0) / (departmentScores.length || 1)),
            weakestDepartment: weakestDepartment ? {
                name: weakestDepartment.department.name,
                code: weakestDepartment.department.code,
                overallScore: round2(weakestDepartment.overallScore),
            } : null,
        },
        departmentScores: departmentScores.map((score) => ({
            department: score.department.name,
            code: score.department.code,
            environmentalScore: round2(score.environmentalScore),
            socialScore: round2(score.socialScore),
            governanceScore: round2(score.governanceScore),
            overallScore: round2(score.overallScore),
            updatedAt: score.updatedAt.toISOString(),
        })),
        carbon: {
            totalTransactions: carbonAggregate._count.id,
            totalCo2Amount: round2(carbonAggregate._sum.co2Amount ?? 0),
            averageCo2Amount: round2(carbonAggregate._avg.co2Amount ?? 0),
            highestRecentEmitter: highestEmissionTransaction ? {
                department: highestEmissionTransaction.department.name,
                source: highestEmissionTransaction.source,
                co2Amount: round2(highestEmissionTransaction.co2Amount),
            } : null,
            recentTransactions: recentCarbonTransactions.map((transaction) => ({
                department: transaction.department.name,
                source: transaction.source,
                quantity: round2(transaction.quantity),
                co2Amount: round2(transaction.co2Amount),
                createdAt: transaction.createdAt.toISOString(),
            })),
        },
        compliance: {
            totalReviewedIssues: complianceIssues.length,
            openIssues: openComplianceIssues.length,
            overdueIssues: overdueComplianceIssues.length,
            statusBreakdown: getStatusCount(complianceIssues),
            recentIssues: complianceIssues.slice(0, 10).map((issue) => ({
                department: issue.department.name,
                owner: issue.owner,
                status: issue.status,
                dueDate: issue.dueDate.toISOString(),
                isOverdue: !isResolvedStatus(issue.status) && issue.dueDate < now,
            })),
        },
        csrActivities: {
            statusBreakdown: getStatusCount(csrActivities),
            totalParticipations: csrParticipationCount,
            completedParticipations: completedCsrParticipationCount,
            recentActivities: csrActivities.map((activity) => ({
                title: activity.title,
                category: activity.category,
                status: activity.status,
                participationCount: activity._count.participations,
                pointsReward: activity.pointsReward,
            })),
        },
        challengeParticipation: {
            totalParticipations: participationCount,
            completedParticipations: completedParticipationCount,
            completionRate: round2((completedParticipationCount / (participationCount || 1)) * 100),
            statusBreakdown: getStatusCount(challengeParticipations),
            recentParticipations: challengeParticipations.map((participation) => ({
                employee: participation.employee.name,
                department: participation.employee.department.name,
                challenge: participation.challenge.title,
                difficulty: participation.challenge.difficulty,
                status: participation.status,
                xpAwarded: participation.xpAwarded,
            })),
        },
        topEmployees: topEmployees.map((employee) => ({
            name: employee.name,
            role: employee.role,
            department: employee.department.name,
            xp: employee.xp,
            points: employee.points,
        })),
        rewardRedemptions: rewardRedemptions.map((redemption) => ({
            employee: redemption.employee.name,
            department: redemption.employee.department.name,
            reward: redemption.reward.name,
            pointsSpent: redemption.pointsSpent,
            redeemedAt: redemption.redeemedAt.toISOString(),
        })),
        badgesAwarded: badgesAwarded.map((employeeBadge) => ({
            employee: employeeBadge.employee.name,
            department: employeeBadge.employee.department.name,
            badge: employeeBadge.badge.name,
            earnedAt: employeeBadge.earnedAt.toISOString(),
        })),
        notifications: {
            unreadCount: recentNotifications.filter((notification) => !notification.read).length,
            recent: recentNotifications.map((notification) => ({
                employee: notification.employee.name,
                department: notification.employee.department.name,
                read: notification.read,
                createdAt: notification.createdAt.toISOString(),
            })),
        },
        audits: {
            statusBreakdown: getStatusCount(recentAudits),
            recent: recentAudits.map((audit) => ({
                title: audit.title,
                status: audit.status,
                auditDate: audit.auditDate.toISOString(),
            })),
        },
        policies: {
            statusBreakdown: getStatusCount(recentPolicies),
            recentPolicies: recentPolicies.map((policy) => ({
                title: policy.title,
                status: policy.status,
                acknowledgementCount: policy._count.acknowledgements,
            })),
            recentAcknowledgements: recentPolicyAcknowledgements.map((acknowledgement) => ({
                employee: acknowledgement.employee.name,
                department: acknowledgement.employee.department.name,
                policy: acknowledgement.policy.title,
                policyStatus: acknowledgement.policy.status,
                acknowledgedAt: acknowledgement.acknowledgedAt.toISOString(),
            })),
        },
    };
}
function buildPrompt(esgData) {
    return `You are an ESG consultant.

Analyze the following organization's ESG data.

Return JSON only.

{
  "overallSummary": "string",
  "environmentalAnalysis": "string",
  "socialAnalysis": "string",
  "governanceAnalysis": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "priorityActions": ["string"],
  "riskLevel": "low | medium | high",
  "priorityDepartment": "string",
  "executiveSummary": "string"
}

Keep recommendations practical and concise.

ESG data:
${JSON.stringify(esgData)}`;
}
async function generateGeminiInsights(prompt) {
    console.log('[AI Insights] Gemini called');
    const apiKey = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)?.trim();
    const model = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash").trim();
    if (!apiKey) {
        throw new Error("Gemini API key is not configured.");
    }
    console.log('[AI Insights] Gemini API key loaded:', Boolean(apiKey));
    console.log('[AI Insights] Gemini model:', model);
    const ai = new GoogleGenAI({
        apiKey,
    });
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            temperature: 0.2,
            responseMimeType: "application/json",
        },
    });
    const text = response.text;
    console.log('[AI Insights] Gemini raw response:', text);
    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }
    const parsed = normalizeInsights(extractJson(text));
    console.log('[AI Insights] JSON parsed');
    return parsed;
}
function generateFallbackInsights(esgData) {
    const strengths = [];
    const weaknesses = [];
    const priorityActions = [];
    const totalCo2 = esgData.carbon.totalCo2Amount;
    const overdueIssues = esgData.compliance.overdueIssues;
    const openIssues = esgData.compliance.openIssues;
    const completionRate = esgData.challengeParticipation.completionRate;
    const weakestDepartment = esgData.scoreSummary.weakestDepartment;
    if (esgData.scoreSummary.averageOverallScore >= 75) {
        strengths.push('Overall ESG performance is strong across scored departments.');
    }
    if (completionRate >= 60) {
        strengths.push('Challenge participation completion is healthy.');
    }
    if (esgData.badgesAwarded.length > 0) {
        strengths.push('Employees are earning badges, showing visible ESG engagement.');
    }
    if (overdueIssues > 0) {
        weaknesses.push(`${overdueIssues} overdue compliance issue${overdueIssues === 1 ? '' : 's'} require management attention.`);
        priorityActions.push('Resolve overdue governance and compliance issues first.');
    }
    if (openIssues > 0) {
        priorityActions.push('Assign owners and target dates for all open compliance issues.');
    }
    if (totalCo2 > 1000) {
        weaknesses.push('Carbon emissions are elevated based on current transaction totals.');
        priorityActions.push('Increase sustainability initiatives in departments with high carbon activity.');
    }
    if (completionRate < 50) {
        weaknesses.push('Challenge completion is below target.');
        priorityActions.push('Improve employee participation with simpler challenges and department-level nudges.');
    }
    if (weakestDepartment) {
        priorityActions.push(`Create a focused ESG improvement plan for ${weakestDepartment.name}.`);
    }
    if (strengths.length === 0) {
        strengths.push('Live ESG data is available for management review.');
    }
    if (weaknesses.length === 0) {
        weaknesses.push('No critical weakness was detected from current fallback metrics.');
    }
    if (priorityActions.length === 0) {
        priorityActions.push('Continue monitoring ESG scores, policy acknowledgement, and carbon activity weekly.');
    }
    const riskLevel = overdueIssues > 0 || totalCo2 > 1000
        ? 'high'
        : openIssues > 0 || esgData.scoreSummary.averageOverallScore < 60
            ? 'medium'
            : 'low';
    return {
        overallSummary: DEFAULT_INSIGHTS.overallSummary,
        environmentalAnalysis: totalCo2 > 1000
            ? 'Carbon emissions are high and should be reduced through targeted sustainability initiatives.'
            : 'Carbon activity is currently within the fallback monitoring threshold.',
        socialAnalysis: completionRate < 50
            ? 'Employee challenge completion needs improvement to strengthen social engagement.'
            : 'Employee participation and recognition indicators show usable engagement momentum.',
        governanceAnalysis: overdueIssues > 0
            ? 'Overdue compliance issues increase governance risk and should be resolved promptly.'
            : 'No overdue governance issue was detected in the reviewed compliance data.',
        strengths,
        weaknesses,
        priorityActions,
        riskLevel,
        priorityDepartment: weakestDepartment?.name ?? DEFAULT_INSIGHTS.priorityDepartment,
        executiveSummary: DEFAULT_INSIGHTS.executiveSummary,
    };
}
export async function getDashboardInsights() {
    console.log('[AI Insights] getDashboardInsights entered');
    const generatedAt = new Date().toISOString();
    const esgData = await collectEsgData();
    console.log('[AI Insights] Collected ESG data');
    try {
        const prompt = buildPrompt(esgData);
        console.log(`[AI Insights] Prompt built (size: ${prompt.length} chars)`);
        const insights = await generateGeminiInsights(prompt);
        console.log("✅ Gemini response received successfully.");
        return {
            generatedAt,
            ...insights,
        };
    }
    catch (error) {
        console.error("❌ Gemini Error:");
        console.error(error);
        return {
            generatedAt,
            ...generateFallbackInsights(esgData),
        };
    }
}
