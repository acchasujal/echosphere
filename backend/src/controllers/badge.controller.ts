import type { NextFunction, Request, Response } from 'express';
import {
  awardEligibleBadgesToEmployee,
  createBadge,
  deleteBadge,
  getAllBadges,
  getBadgeById,
  updateBadge,
} from '../services/badge.service.js';

type BadgeBody = {
  name?: unknown;
  description?: unknown;
  xpRequired?: unknown;
  icon?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseBadgeId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Badge id must be a positive integer.', 400);
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

export async function handleGetBadges(_req: Request, res: Response, next: NextFunction) {
  try {
    const badges = await getAllBadges();

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetBadgeById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseBadgeId(req.params.id as string);
    const badge = await getBadgeById(id);

    res.status(200).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as BadgeBody;

    const name = getRequiredString(body.name, 'name');
    const description = getRequiredString(body.description, 'description');
    const xpRequired = getRequiredInteger(body.xpRequired, 'xpRequired');
    const icon = getRequiredString(body.icon, 'icon');

    const badge = await createBadge({ name, description, xpRequired, icon });

    res.status(201).json({
      success: true,
      message: 'Badge created successfully.',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseBadgeId(req.params.id as string);
    const body = req.body as BadgeBody;

    const data: { name?: string; description?: string; xpRequired?: number; icon?: string } = {};

    const name = getOptionalString(body.name, 'name');
    const description = getOptionalString(body.description, 'description');
    const xpRequired = getOptionalInteger(body.xpRequired, 'xpRequired');
    const icon = getOptionalString(body.icon, 'icon');

    if (name !== undefined) {
      data.name = name;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (xpRequired !== undefined) {
      data.xpRequired = xpRequired;
    }

    if (icon !== undefined) {
      data.icon = icon;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const badge = await updateBadge(id, data);

    res.status(200).json({
      success: true,
      message: 'Badge updated successfully.',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseBadgeId(req.params.id as string);
    const badge = await deleteBadge(id);

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully.',
      data: badge,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleAwardBadges(req: Request, res: Response, next: NextFunction) {
  try {
    const employeeId = parseEmployeeId(req.params.employeeId as string);
    const result = await awardEligibleBadgesToEmployee(employeeId);

    res.status(200).json({
      success: true,
      message: `${result.awarded.length} badge(s) awarded.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
