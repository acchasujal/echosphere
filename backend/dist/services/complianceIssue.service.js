import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
const complianceIssueInclude = {
    department: true,
};
const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function mapPrismaError(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw createError('Compliance issue not found.', 404);
        }
        if (error.code === 'P2003') {
            throw createError('Department not found.', 404);
        }
    }
    throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}
function normalizeEnumValue(value, allowedValues, fieldName) {
    const normalizedValue = value.trim().toUpperCase();
    if (!allowedValues.includes(normalizedValue)) {
        throw createError(`${fieldName} must be one of: ${allowedValues.join(', ')}.`, 400);
    }
    return normalizedValue;
}
function serializeComplianceIssue(issue) {
    return {
        ...issue,
        ownerId: Number(issue.owner),
    };
}
async function ensureDepartmentExists(departmentId) {
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: { id: true },
    });
    if (!department) {
        throw createError('Department not found.', 404);
    }
}
async function ensureEmployeeExists(employeeId) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true },
    });
    if (!employee) {
        throw createError('Employee not found.', 404);
    }
}
function buildNotificationMessage(issueId, kind) {
    if (kind === 'created') {
        return `⚠️ A new compliance issue has been assigned to you. (Issue #${issueId})`;
    }
    if (kind === 'resolved') {
        return `✅ Compliance issue #${issueId} has been resolved.`;
    }
    return `⚠️ Compliance issue #${issueId} is overdue.`;
}
async function createComplianceNotification(employeeId, issueId, kind) {
    await prisma.notification.create({
        data: {
            employeeId,
            message: buildNotificationMessage(issueId, kind),
        },
    });
}
export async function getAllComplianceIssues() {
    const issues = await prisma.complianceIssue.findMany({
        include: complianceIssueInclude,
        orderBy: {
            id: 'asc',
        },
    });
    return issues.map(serializeComplianceIssue);
}
export async function getComplianceIssueById(id) {
    const issue = await prisma.complianceIssue.findUnique({
        where: { id },
        include: complianceIssueInclude,
    });
    if (!issue) {
        throw createError('Compliance issue not found.', 404);
    }
    return serializeComplianceIssue(issue);
}
export async function createComplianceIssue(data) {
    const [department, owner] = await Promise.all([
        prisma.department.findUnique({
            where: { id: data.departmentId },
            select: { id: true },
        }),
        prisma.employee.findUnique({
            where: { id: data.ownerId },
            select: { id: true },
        }),
    ]);
    if (!department) {
        throw createError('Department not found.', 404);
    }
    if (!owner) {
        throw createError('Employee not found.', 404);
    }
    const status = normalizeEnumValue(data.status ?? 'OPEN', allowedStatuses, 'status');
    return prisma.$transaction(async (tx) => {
        const issue = await tx.complianceIssue.create({
            data: {
                departmentId: data.departmentId,
                description: data.description,
                owner: String(data.ownerId),
                dueDate: data.dueDate,
                status,
            },
            include: complianceIssueInclude,
        });
        await tx.notification.create({
            data: {
                employeeId: data.ownerId,
                message: buildNotificationMessage(issue.id, 'created'),
            },
        });
        return serializeComplianceIssue(issue);
    });
}
export async function updateComplianceIssue(id, data) {
    const issue = await prisma.complianceIssue.findUnique({
        where: { id },
        include: complianceIssueInclude,
    });
    if (!issue) {
        throw createError('Compliance issue not found.', 404);
    }
    const nextStatus = data.status !== undefined
        ? normalizeEnumValue(data.status, allowedStatuses, 'status')
        : undefined;
    const nextOwnerId = data.ownerId !== undefined ? data.ownerId : Number(issue.owner);
    if (data.departmentId !== undefined) {
        await ensureDepartmentExists(data.departmentId);
    }
    if (data.ownerId !== undefined) {
        await ensureEmployeeExists(data.ownerId);
    }
    const updateData = {};
    if (data.departmentId !== undefined) {
        updateData.departmentId = data.departmentId;
    }
    if (data.description !== undefined) {
        updateData.description = data.description;
    }
    if (data.ownerId !== undefined) {
        updateData.owner = String(data.ownerId);
    }
    if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate;
    }
    if (nextStatus !== undefined) {
        updateData.status = nextStatus;
    }
    const shouldNotifyResolution = nextStatus === 'RESOLVED' && issue.status !== 'RESOLVED';
    return prisma.$transaction(async (tx) => {
        const updatedIssue = await tx.complianceIssue.update({
            where: { id },
            data: updateData,
            include: complianceIssueInclude,
        });
        if (shouldNotifyResolution) {
            await tx.notification.create({
                data: {
                    employeeId: nextOwnerId,
                    message: buildNotificationMessage(updatedIssue.id, 'resolved'),
                },
            });
        }
        return serializeComplianceIssue(updatedIssue);
    });
}
export async function deleteComplianceIssue(id) {
    try {
        const issue = await prisma.complianceIssue.delete({
            where: { id },
            include: complianceIssueInclude,
        });
        return serializeComplianceIssue(issue);
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function getOverdueComplianceIssues() {
    const now = new Date();
    const issues = await prisma.complianceIssue.findMany({
        where: {
            dueDate: {
                lt: now,
            },
            status: {
                notIn: ['RESOLVED', 'resolved'],
            },
        },
        include: complianceIssueInclude,
        orderBy: {
            dueDate: 'asc',
        },
    });
    if (issues.length === 0) {
        return [];
    }
    const overdueMessages = issues.map((issue) => buildNotificationMessage(issue.id, 'overdue'));
    const existingNotifications = await prisma.notification.findMany({
        where: {
            message: {
                in: overdueMessages,
            },
        },
        select: {
            message: true,
        },
    });
    const existingMessages = new Set(existingNotifications.map((notification) => notification.message));
    await Promise.all(issues
        .filter((issue) => !existingMessages.has(buildNotificationMessage(issue.id, 'overdue')))
        .map((issue) => createComplianceNotification(Number(issue.owner), issue.id, 'overdue')));
    return issues.map(serializeComplianceIssue);
}
