import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const rewardInclude = {
  redemptions: true,
} as const;

type RewardWithRelations = Prisma.RewardGetPayload<{
  include: typeof rewardInclude;
}>;

type RewardCreateInput = {
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
};

type RewardUpdateInput = Partial<RewardCreateInput>;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function sanitizeReward(reward: RewardWithRelations) {
  return reward;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw createError('Reward not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

export async function getAllRewards() {
  const rewards = await prisma.reward.findMany({
    include: rewardInclude,
    orderBy: {
      id: 'asc',
    },
  });

  return rewards.map(sanitizeReward);
}

export async function getRewardById(id: number) {
  const reward = await prisma.reward.findUnique({
    where: { id },
    include: rewardInclude,
  });

  if (!reward) {
    throw createError('Reward not found.', 404);
  }

  return sanitizeReward(reward);
}

export async function createReward(data: RewardCreateInput) {
  try {
    const reward = await prisma.reward.create({
      data,
      include: rewardInclude,
    });

    return sanitizeReward(reward);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateReward(id: number, data: RewardUpdateInput) {
  try {
    const reward = await prisma.reward.update({
      where: { id },
      data,
      include: rewardInclude,
    });

    return sanitizeReward(reward);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteReward(id: number) {
  try {
    const reward = await prisma.reward.delete({
      where: { id },
      include: rewardInclude,
    });

    return sanitizeReward(reward);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function redeemReward(rewardId: number, employeeId: number) {
  return prisma.$transaction(async (transaction) => {
    const employee = await transaction.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw createError('Employee not found.', 404);
    }

    const reward = await transaction.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw createError('Reward not found.', 404);
    }

    if (employee.points < reward.pointsRequired) {
      throw createError('Not enough points.', 400);
    }

    await transaction.employee.update({
      where: { id: employeeId },
      data: {
        points: {
          decrement: reward.pointsRequired,
        },
      },
    });

    const redemption = await transaction.rewardRedemption.create({
      data: {
        employeeId,
        rewardId,
        pointsSpent: reward.pointsRequired,
      },
    });

    return redemption;
  });
}