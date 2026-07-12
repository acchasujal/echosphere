import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';
const challengeInclude = {
    participations: true,
};
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}
function sanitizeChallenge(challenge) {
    return challenge;
}
function mapPrismaError(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw createError('Challenge not found.', 404);
        }
    }
    throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}
export async function getAllChallenges() {
    const challenges = await prisma.challenge.findMany({
        include: challengeInclude,
        orderBy: {
            id: 'asc',
        },
    });
    return challenges.map(sanitizeChallenge);
}
export async function getChallengeById(id) {
    const challenge = await prisma.challenge.findUnique({
        where: { id },
        include: challengeInclude,
    });
    if (!challenge) {
        throw createError('Challenge not found.', 404);
    }
    return sanitizeChallenge(challenge);
}
export async function createChallenge(data) {
    try {
        const challenge = await prisma.challenge.create({
            data,
            include: challengeInclude,
        });
        const employees = await prisma.employee.findMany({
            select: { id: true },
        });
        if (employees.length > 0) {
            await Promise.all(employees.map((emp) => prisma.notification.create({
                data: {
                    employeeId: emp.id,
                    message: `New challenge: ${challenge.title}`,
                },
            })));
        }
        return sanitizeChallenge(challenge);
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function updateChallenge(id, data) {
    try {
        const challenge = await prisma.challenge.update({
            where: { id },
            data,
            include: challengeInclude,
        });
        return sanitizeChallenge(challenge);
    }
    catch (error) {
        mapPrismaError(error);
    }
}
export async function deleteChallenge(id) {
    try {
        const challenge = await prisma.challenge.delete({
            where: { id },
            include: challengeInclude,
        });
        return sanitizeChallenge(challenge);
    }
    catch (error) {
        mapPrismaError(error);
    }
}
