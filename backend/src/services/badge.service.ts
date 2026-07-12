import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const badgeInclude = {
  employees: {
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          xp: true,
          points: true,
          departmentId: true,
        },
      },
    },
  },
} as const;

type BadgeWithRelations = Prisma.BadgeGetPayload<{
  include: typeof badgeInclude;
}>;

type BadgeCreateInput = {
  name: string;
  description: string;
  xpRequired: number;
  icon: string;
};

type BadgeUpdateInput = Partial<BadgeCreateInput>;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw createError('Badge not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

export async function getAllBadges(): Promise<BadgeWithRelations[]> {
  return prisma.badge.findMany({
    include: badgeInclude,
    orderBy: { xpRequired: 'asc' },
  });
}

export async function getBadgeById(id: number): Promise<BadgeWithRelations> {
  const badge = await prisma.badge.findUnique({
    where: { id },
    include: badgeInclude,
  });

  if (!badge) {
    throw createError('Badge not found.', 404);
  }

  return badge;
}

export async function createBadge(data: BadgeCreateInput): Promise<BadgeWithRelations> {
  if (data.xpRequired < 0) {
    throw createError('xpRequired must be a non-negative integer.', 400);
  }

  try {
    return await prisma.badge.create({
      data,
      include: badgeInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateBadge(
  id: number,
  data: BadgeUpdateInput,
): Promise<BadgeWithRelations> {
  if (data.xpRequired !== undefined && data.xpRequired < 0) {
    throw createError('xpRequired must be a non-negative integer.', 400);
  }

  try {
    return await prisma.badge.update({
      where: { id },
      data,
      include: badgeInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteBadge(id: number): Promise<BadgeWithRelations> {
  try {
    return await prisma.badge.delete({
      where: { id },
      include: badgeInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function awardEligibleBadgesToEmployee(
  employeeId: number,
): Promise<{ awarded: number[] }> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true, xp: true },
  });

  if (!employee) {
    throw createError('Employee not found.', 404);
  }

  const [eligibleBadges, alreadyEarned] = await Promise.all([
    prisma.badge.findMany({
      where: { xpRequired: { lte: employee.xp } },
      select: { id: true, name: true },
    }),
    prisma.employeeBadge.findMany({
      where: { employeeId },
      select: { badgeId: true },
    }),
  ]);

  const earnedBadgeIds = new Set(alreadyEarned.map((eb) => eb.badgeId));
  const newBadges = eligibleBadges.filter((b) => !earnedBadgeIds.has(b.id));

  if (newBadges.length === 0) {
    return { awarded: [] };
  }

  await Promise.all([
    ...newBadges.map((badge) =>
      prisma.employeeBadge.create({ data: { employeeId, badgeId: badge.id } }),
    ),
    ...newBadges.map((badge) =>
      prisma.notification.create({
        data: {
          employeeId,
          message: `🏆 Congratulations! You earned the ${badge.name} badge.`,
        },
      }),
    ),
  ]);

  return { awarded: newBadges.map((b) => b.id) };
}
