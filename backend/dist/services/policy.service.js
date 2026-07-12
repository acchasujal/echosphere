import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
import { createNotification } from './notification.service.js';
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function mapPrismaError(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw createError('ESG Policy not found.', 404);
        }
    }
    throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}
export async function getAllPolicies(filters) {
    const { status, title } = filters;
    const where = {};
    if (status !== undefined) {
        where.status = status;
    }
    if (title !== undefined) {
        where.title = {
            contains: title,
            mode: 'insensitive',
        };
    }
    return prisma.eSGPolicy.findMany({
        where,
        orderBy: {
            id: 'asc',
        },
    });
}
export async function getPolicyById(id) {
    const policy = await prisma.eSGPolicy.findUnique({
        where: { id },
    });
    if (!policy) {
        throw createError('ESG Policy not found.', 404);
    }
    return policy;
}
export async function createPolicy(data) {
    try {
        const policy = await prisma.eSGPolicy.create({
            data,
        });
        // Send notification when a new ESG Policy is created using the Notification module's reusable createNotification function
        const employees = await prisma.employee.findMany({
            select: { id: true },
        });
        if (employees.length > 0) {
            await Promise.all(employees.map((emp) => createNotification({
                employeeId: emp.id,
                message: `New ESG Policy: ${policy.title}`,
            }).catch((err) => {
                console.error(`Failed to send notification to employee ${emp.id}:`, err);
            })));
        }
        return policy;
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function updatePolicy(id, data) {
    try {
        const policy = await prisma.eSGPolicy.update({
            where: { id },
            data,
        });
        return policy;
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function deletePolicy(id) {
    try {
        return await prisma.eSGPolicy.delete({
            where: { id },
        });
    }
    catch (error) {
        mapPrismaError(error);
    }
}
