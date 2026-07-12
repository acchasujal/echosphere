import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

type NotificationCreateInput = {
  employeeId: number;
  message: string;
  read?: boolean;
};

type NotificationUpdateInput = {
  read?: boolean;
  message?: string;
  employeeId?: number;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw createError('Notification not found.', 404);
    }
    if (error.code === 'P2003') {
      throw createError('Employee not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

export async function getAllNotifications() {
  return prisma.notification.findMany({
    orderBy: {
      id: 'asc',
    },
  });
}

export async function getNotificationById(id: number) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw createError('Notification not found.', 404);
  }

  return notification;
}

export async function createNotification(data: NotificationCreateInput) {
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
    select: { id: true },
  });

  if (!employee) {
    throw createError('Employee not found.', 404);
  }

  try {
    return await prisma.notification.create({
      data,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateNotification(id: number, data: NotificationUpdateInput) {
  if (data.employeeId !== undefined) {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { id: true },
    });

    if (!employee) {
      throw createError('Employee not found.', 404);
    }
  }

  try {
    return await prisma.notification.update({
      where: { id },
      data,
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteNotification(id: number) {
  try {
    return await prisma.notification.delete({
      where: { id },
    });
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function getEmployeeNotifications(employeeId: number) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });

  if (!employee) {
    throw createError('Employee not found.', 404);
  }

  return prisma.notification.findMany({
    where: { employeeId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
