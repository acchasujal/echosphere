import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const carbonTransactionInclude = {
  department: true,
} as const;

type CarbonTransactionWithDepartment = Prisma.CarbonTransactionGetPayload<{
  include: typeof carbonTransactionInclude;
}>;

type CarbonTransactionWriteInput = {
  departmentId: number;
  source: string;
  quantity: number;
  co2Amount: number;
};

type CarbonTransactionPatchInput = Partial<CarbonTransactionWriteInput>;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2003') {
      throw createError('The provided departmentId does not reference an existing department.', 400);
    }

    if (error.code === 'P2025') {
      throw createError('Carbon transaction not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

export async function getAllCarbonTransactions(): Promise<CarbonTransactionWithDepartment[]> {
  return prisma.carbonTransaction.findMany({
    include: carbonTransactionInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getCarbonTransactionById(id: number): Promise<CarbonTransactionWithDepartment> {
  const transaction = await prisma.carbonTransaction.findUnique({
    where: { id },
    include: carbonTransactionInclude,
  });

  if (!transaction) {
    throw createError('Carbon transaction not found.', 404);
  }

  return transaction;
}

export async function createCarbonTransaction(data: CarbonTransactionWriteInput): Promise<CarbonTransactionWithDepartment> {
  const departmentExists = await prisma.department.findUnique({
    where: { id: data.departmentId },
    select: { id: true },
  });

  if (!departmentExists) {
    throw createError('The provided departmentId does not reference an existing department.', 400);
  }

  if (data.quantity <= 0) {
    throw createError('quantity must be a positive number.', 400);
  }

  if (data.co2Amount < 0) {
    throw createError('co2Amount must be a non-negative number.', 400);
  }

  try {
    return await prisma.carbonTransaction.create({
      data,
      include: carbonTransactionInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateCarbonTransaction(id: number, data: CarbonTransactionPatchInput): Promise<CarbonTransactionWithDepartment> {
  if (data.departmentId !== undefined) {
    const departmentExists = await prisma.department.findUnique({
      where: { id: data.departmentId },
      select: { id: true },
    });

    if (!departmentExists) {
      throw createError('The provided departmentId does not reference an existing department.', 400);
    }
  }

  if (data.quantity !== undefined && data.quantity <= 0) {
    throw createError('quantity must be a positive number.', 400);
  }

  if (data.co2Amount !== undefined && data.co2Amount < 0) {
    throw createError('co2Amount must be a non-negative number.', 400);
  }

  try {
    return await prisma.carbonTransaction.update({
      where: { id },
      data,
      include: carbonTransactionInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteCarbonTransaction(id: number): Promise<CarbonTransactionWithDepartment> {
  try {
    return await prisma.carbonTransaction.delete({
      where: { id },
      include: carbonTransactionInclude,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}
