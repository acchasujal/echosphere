import type { NextFunction, Request, Response } from 'express';
import {
  createNotification,
  deleteNotification,
  getAllNotifications,
  getEmployeeNotifications,
  getNotificationById,
  updateNotification,
} from '../services/notification.service.js';

type NotificationBody = {
  employeeId?: unknown;
  message?: unknown;
  read?: unknown;
  isRead?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseNotificationId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Notification id must be a positive integer.', 400);
  }

  return id;
}

function parseEmployeeId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Employee id must be a positive integer.', 400);
  }

  return id;
}

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} is required.`, 400);
  }

  return value.trim();
}

function getOptionalString(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} must be a non-empty string.`, 400);
  }

  return value.trim();
}

function getRequiredInteger(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw createError(`${fieldName} is required and must be an integer.`, 400);
  }

  return value;
}

function getOptionalInteger(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw createError(`${fieldName} must be an integer.`, 400);
  }

  return value;
}

function getOptionalBoolean(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw createError(`${fieldName} must be a boolean.`, 400);
  }

  return value;
}

export async function handleGetNotifications(_req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await getAllNotifications();

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetNotificationById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseNotificationId(req.params.id as string);
    const notification = await getNotificationById(id);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as NotificationBody;

    const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
    const message = getRequiredString(body.message, 'message');
    const read = getOptionalBoolean(body.read, 'read');

    const notification = await createNotification({
      employeeId,
      message,
      ...(read !== undefined ? { read } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseNotificationId(req.params.id as string);
    const body = req.body as NotificationBody;

    const data: { read?: boolean; message?: string; employeeId?: number } = {};

    const isRead = getOptionalBoolean(body.isRead, 'isRead');
    const read = getOptionalBoolean(body.read, 'read');
    const message = getOptionalString(body.message, 'message');
    const employeeId = getOptionalInteger(body.employeeId, 'employeeId');

    if (isRead !== undefined) {
      data.read = isRead;
    } else if (read !== undefined) {
      data.read = read;
    }

    if (message !== undefined) {
      data.message = message;
    }

    if (employeeId !== undefined) {
      data.employeeId = employeeId;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const notification = await updateNotification(id, data);

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseNotificationId(req.params.id as string);
    const notification = await deleteNotification(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetEmployeeNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = parseEmployeeId(req.params.employeeId as string);
    const notifications = await getEmployeeNotifications(employeeId);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}
