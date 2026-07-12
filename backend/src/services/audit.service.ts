import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

// TODO: Send a notification when an audit is created.
// The existing createNotification service requires an employeeId, but the
// Audit model has no employee relation. Wire this up once a responsible
// employee / auditor field is added to the schema.

const allowedStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

type AuditStatus = (typeof allowedStatuses)[number];

type AuditCreateInput = {
  title: string;
  description: string;
  auditDate: Date;
  status?: string;
};

type AuditUpdateInput = {
  title?: string;
  description?: string;
  auditDate?: Date;
  status?: string;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw createError('Audit not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

function normalizeStatus(value: string): AuditStatus {
  const normalized = value.trim().toUpperCase() as AuditStatus;

  if (!allowedStatuses.includes(normalized)) {
    throw createError(
      `status must be one of: ${allowedStatuses.join(', ')}.`,
      400,
    );
  }

  return normalized;
}

export async function getAllAudits(filters: {
  status?: string;
  auditDate?: Date;
  title?: string;
}) {
  const where: Prisma.AuditWhereInput = {};

  if (filters.status !== undefined) {
    where.status = normalizeStatus(filters.status);
  }

  if (filters.auditDate !== undefined) {
    const start = new Date(filters.auditDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    where.auditDate = {
      gte: start,
      lt: end,
    };
  }

  if (filters.title !== undefined) {
    where.title = {
      contains: filters.title,
      mode: 'insensitive',
    };
  }

  return prisma.audit.findMany({
    where,
    orderBy: { id: 'asc' },
  });
}

export async function getAuditById(id: number) {
  const audit = await prisma.audit.findUnique({ where: { id } });

  if (!audit) {
    throw createError('Audit not found.', 404);
  }

  return audit;
}

export async function createAudit(data: AuditCreateInput) {
  const status = normalizeStatus(data.status ?? 'PLANNED');

  return prisma.audit.create({
    data: {
      title: data.title,
      description: data.description,
      auditDate: data.auditDate,
      status,
    },
  });
}

export async function updateAudit(id: number, data: AuditUpdateInput) {
  const audit = await prisma.audit.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!audit) {
    throw createError('Audit not found.', 404);
  }

  const updateData: Prisma.AuditUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.auditDate !== undefined) {
    updateData.auditDate = data.auditDate;
  }

  if (data.status !== undefined) {
    updateData.status = normalizeStatus(data.status);
  }

  try {
    return await prisma.audit.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteAudit(id: number) {
  try {
    return await prisma.audit.delete({ where: { id } });
  } catch (error) {
    mapPrismaError(error);
  }
}
