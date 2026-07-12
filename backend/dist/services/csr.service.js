import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
const csrActivityInclude = {
    participations: true,
};
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function mapPrismaError(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw createError('CSR Activity not found.', 404);
        }
    }
    throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}
export async function getAllCSRActivities(filters) {
    const { status, departmentId, startDate, endDate } = filters;
    const where = {};
    if (status !== undefined) {
        where.status = status;
    }
    if (departmentId !== undefined) {
        where.participations = {
            some: {
                employee: {
                    departmentId: departmentId,
                },
            },
        };
    }
    if (startDate !== undefined) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
            throw createError('startDate must be a valid ISO date string.', 400);
        }
        where.startDate = { gte: start };
    }
    if (endDate !== undefined) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
            throw createError('endDate must be a valid ISO date string.', 400);
        }
        where.endDate = { lte: end };
    }
    return prisma.cSRActivity.findMany({
        where,
        include: csrActivityInclude,
        orderBy: {
            id: 'asc',
        },
    });
}
export async function getCSRActivityById(id) {
    const activity = await prisma.cSRActivity.findUnique({
        where: { id },
        include: csrActivityInclude,
    });
    if (!activity) {
        throw createError('CSR Activity not found.', 404);
    }
    return activity;
}
export async function createCSRActivity(data) {
    try {
        const activity = await prisma.cSRActivity.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location ?? null,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status,
                pointsReward: data.pointsReward ?? 0,
            },
            include: csrActivityInclude,
        });
        // Send a notification when a CSR Activity is created (matching challenge.service.ts pattern)
        const employees = await prisma.employee.findMany({
            select: { id: true },
        });
        if (employees.length > 0) {
            await Promise.all(employees.map((emp) => prisma.notification.create({
                data: {
                    employeeId: emp.id,
                    message: `New CSR Activity: ${activity.title}`,
                },
            })));
        }
        return activity;
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function updateCSRActivity(id, data) {
    try {
        const activity = await prisma.cSRActivity.update({
            where: { id },
            data,
            include: csrActivityInclude,
        });
        return activity;
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function deleteCSRActivity(id) {
    try {
        return await prisma.cSRActivity.delete({
            where: { id },
            include: csrActivityInclude,
        });
    }
    catch (error) {
        mapPrismaError(error);
    }
}
