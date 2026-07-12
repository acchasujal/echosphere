import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const challengeInclude = {
  participations: true,
} as const;

type ChallengeWithRelations = Prisma.ChallengeGetPayload<{
  include: typeof challengeInclude;
}>;

type ChallengeCreateInput = {
  title: string;
  description: string;
  xpReward: number;
  difficulty: string;
  deadline: Date;
  status: string;
};

type ChallengeUpdateInput = Partial<ChallengeCreateInput>;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function sanitizeChallenge(challenge: ChallengeWithRelations) {
  return challenge;
}

function mapPrismaError(error: unknown): never {
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

export async function getChallengeById(id: number) {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: challengeInclude,
  });

  if (!challenge) {
    throw createError('Challenge not found.', 404);
  }

  return sanitizeChallenge(challenge);
}

export async function createChallenge(data: ChallengeCreateInput) {
  try {
    const challenge = await prisma.challenge.create({
      data,
      include: challengeInclude,
    });

    return sanitizeChallenge(challenge);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateChallenge(id: number, data: ChallengeUpdateInput) {
  try {
    const challenge = await prisma.challenge.update({
      where: { id },
      data,
      include: challengeInclude,
    });

    return sanitizeChallenge(challenge);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteChallenge(id: number) {
  try {
    const challenge = await prisma.challenge.delete({
      where: { id },
      include: challengeInclude,
    });

    return sanitizeChallenge(challenge);
  } catch (error) {
    mapPrismaError(error);
  }
}
