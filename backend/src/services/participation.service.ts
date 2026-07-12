import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const participationInclude = {
  employee: {
    include: {
      department: true,
    },
  },
  challenge: true,
} as const;

type ParticipationWithRelations = Prisma.ParticipationGetPayload<{
  include: typeof participationInclude;
}>;

type ParticipationCreateInput = {
  employeeId: number;
  challengeId: number;
  status: string;
  proof?: string;
};

type ParticipationPatchInput = {
  status?: string;
  proof?: string;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw createError('Participation not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

async function evaluateAndAwardBadges(
  tx: Prisma.TransactionClient,
  employeeId: number,
  updatedXp: number,
): Promise<void> {
  const [eligibleBadges, alreadyEarned] = await Promise.all([
    tx.badge.findMany({
      where: { xpRequired: { lte: updatedXp } },
      select: { id: true, name: true },
    }),
    tx.employeeBadge.findMany({
      where: { employeeId },
      select: { badgeId: true },
    }),
  ]);

  const earnedBadgeIds = new Set(alreadyEarned.map((eb) => eb.badgeId));
  const newBadges = eligibleBadges.filter((b) => !earnedBadgeIds.has(b.id));

  if (newBadges.length === 0) {
    return;
  }

  await Promise.all([
    ...newBadges.map((badge) =>
      tx.employeeBadge.create({
        data: { employeeId, badgeId: badge.id },
      }),
    ),
    ...newBadges.map((badge) =>
      tx.notification.create({
        data: {
          employeeId,
          message: `🏆 Congratulations! You earned the ${badge.name} badge.`,
        },
      }),
    ),
  ]);
}

export async function getAllParticipations(): Promise<ParticipationWithRelations[]> {
  return prisma.participation.findMany({
    include: participationInclude,
    orderBy: { id: 'asc' },
  });
}

export async function getParticipationById(id: number): Promise<ParticipationWithRelations> {
  const participation = await prisma.participation.findUnique({
    where: { id },
    include: participationInclude,
  });

  if (!participation) {
    throw createError('Participation not found.', 404);
  }

  return participation;
}

export async function createParticipation(
  data: ParticipationCreateInput,
): Promise<ParticipationWithRelations> {
  const [employee, challenge] = await Promise.all([
    prisma.employee.findUnique({ where: { id: data.employeeId }, select: { id: true } }),
    prisma.challenge.findUnique({ where: { id: data.challengeId }, select: { id: true } }),
  ]);

  if (!employee) {
    throw createError('Employee not found.', 404);
  }

  if (!challenge) {
    throw createError('Challenge not found.', 404);
  }

  const existing = await prisma.participation.findFirst({
    where: { employeeId: data.employeeId, challengeId: data.challengeId },
    select: { id: true },
  });

  if (existing) {
    throw createError('Employee has already joined this challenge.', 400);
  }

  try {
    return await prisma.participation.create({
      data: {
        employeeId: data.employeeId,
        challengeId: data.challengeId,
        status: data.status,
        proof: data.proof,
      },
      include: participationInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateParticipation(
  id: number,
  data: ParticipationPatchInput,
): Promise<ParticipationWithRelations> {
  const participation = await prisma.participation.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, xp: true, points: true, departmentId: true } },
      challenge: { select: { id: true, xpReward: true } },
    },
  });

  if (!participation) {
    throw createError('Participation not found.', 404);
  }

  const isCompletingNow =
    data.status === 'completed' && participation.status !== 'completed';

  if (data.status === 'completed' && participation.status === 'completed') {
    throw createError('Participation is already marked as completed.', 400);
  }

  if (!isCompletingNow) {
    try {
      return await prisma.participation.update({
        where: { id },
        data,
        include: participationInclude,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  const xpReward = participation.challenge.xpReward;
  const pointsReward = xpReward;
  const newXp = participation.employee.xp + xpReward;

  return prisma.$transaction(async (tx) => {
    const [updated] = await Promise.all([
      tx.participation.update({
        where: { id },
        data: { status: 'completed', xpAwarded: xpReward, ...(data.proof !== undefined ? { proof: data.proof } : {}) },
        include: participationInclude,
      }),
      tx.employee.update({
        where: { id: participation.employee.id },
        data: {
          xp: { increment: xpReward },
          points: { increment: pointsReward },
        },
      }),
    ]);

    await tx.carbonTransaction.create({
      data: {
        departmentId: participation.employee.departmentId,
        source: `challenge_completion:${participation.challenge.id}`,
        quantity: 1,
        co2Amount: 0,
      },
    });

    await tx.notification.create({
      data: {
        employeeId: participation.employee.id,
        message: '🌱 Challenge completed successfully.',
      },
    });

    await evaluateAndAwardBadges(tx, participation.employee.id, newXp);

    return updated;
  });
}

export async function deleteParticipation(id: number): Promise<ParticipationWithRelations> {
  try {
    return await prisma.participation.delete({
      where: { id },
      include: participationInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}
