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
            throw createError('Policy acknowledgement not found.', 404);
        }
    }
    throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}
const acknowledgementInclude = {
    employee: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            departmentId: true,
        },
    },
    policy: {
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
        },
    },
};
export async function getAllAcknowledgements() {
    return prisma.policyAcknowledgement.findMany({
        include: acknowledgementInclude,
        orderBy: { id: 'asc' },
    });
}
export async function getAcknowledgementById(id) {
    const acknowledgement = await prisma.policyAcknowledgement.findUnique({
        where: { id },
        include: acknowledgementInclude,
    });
    if (!acknowledgement) {
        throw createError('Policy acknowledgement not found.', 404);
    }
    return acknowledgement;
}
export async function getAcknowledgementsByEmployee(employeeId) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true },
    });
    if (!employee) {
        throw createError('Employee not found.', 404);
    }
    return prisma.policyAcknowledgement.findMany({
        where: { employeeId },
        include: acknowledgementInclude,
        orderBy: { acknowledgedAt: 'desc' },
    });
}
export async function getAcknowledgementsByPolicy(policyId) {
    const policy = await prisma.eSGPolicy.findUnique({
        where: { id: policyId },
        select: { id: true },
    });
    if (!policy) {
        throw createError('ESG Policy not found.', 404);
    }
    return prisma.policyAcknowledgement.findMany({
        where: { policyId },
        include: acknowledgementInclude,
        orderBy: { acknowledgedAt: 'desc' },
    });
}
export async function createAcknowledgement(employeeId, policyId) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, name: true },
    });
    if (!employee) {
        throw createError('Employee not found.', 404);
    }
    const policy = await prisma.eSGPolicy.findUnique({
        where: { id: policyId },
        select: { id: true, title: true },
    });
    if (!policy) {
        throw createError('ESG Policy not found.', 404);
    }
    const existing = await prisma.policyAcknowledgement.findFirst({
        where: { employeeId, policyId },
    });
    if (existing) {
        throw createError(`Employee ${employeeId} has already acknowledged policy ${policyId}.`, 409);
    }
    try {
        const acknowledgement = await prisma.policyAcknowledgement.create({
            data: { employeeId, policyId },
            include: acknowledgementInclude,
        });
        // Send a notification to the employee upon successful acknowledgement
        await createNotification({
            employeeId,
            message: `You have successfully acknowledged the ESG Policy: "${policy.title}".`,
        }).catch((err) => {
            console.error(`Failed to send acknowledgement notification to employee ${employeeId}:`, err);
        });
        return acknowledgement;
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function deleteAcknowledgement(id) {
    try {
        return await prisma.policyAcknowledgement.delete({
            where: { id },
            include: acknowledgementInclude,
        });
    }
    catch (error) {
        mapPrismaError(error);
    }
}
