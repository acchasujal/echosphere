import type { NextFunction, Request, Response } from 'express';
import {
  createComplianceIssue,
  deleteComplianceIssue,
  getAllComplianceIssues,
  getComplianceIssueById,
  getOverdueComplianceIssues,
  updateComplianceIssue,
} from '../services/complianceIssue.service.js';

type ComplianceIssueBody = {
  departmentId?: unknown;
  description?: unknown;
  ownerId?: unknown;
  owner?: unknown;
  dueDate?: unknown;
  status?: unknown;
};

const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseComplianceIssueId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Compliance issue id must be a positive integer.', 400);
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

function getRequiredDate(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} is required.`, 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} must be a valid date string.`, 400);
  }

  return date;
}

function getOptionalDate(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} must be a valid date string.`, 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} must be a valid date string.`, 400);
  }

  return date;
}

function normalizeEnumValue(value: string, allowedValues: readonly string[], fieldName: string) {
  const normalizedValue = value.trim().toUpperCase();

  if (!allowedValues.includes(normalizedValue)) {
    throw createError(`${fieldName} must be one of: ${allowedValues.join(', ')}.`, 400);
  }

  return normalizedValue;
}

function getOwnerId(body: ComplianceIssueBody, required: boolean) {
  const ownerId = getOptionalInteger(body.ownerId, 'ownerId');

  if (ownerId !== undefined) {
    return ownerId;
  }

  if (body.owner === undefined) {
    if (required) {
      throw createError('ownerId is required.', 400);
    }

    return undefined;
  }

  if (typeof body.owner !== 'number' || !Number.isInteger(body.owner)) {
    throw createError('owner must be an integer employee id.', 400);
  }

  return body.owner;
}

export async function handleGetComplianceIssues(_req: Request, res: Response, next: NextFunction) {
  try {
    const complianceIssues = await getAllComplianceIssues();

    res.status(200).json({
      success: true,
      data: complianceIssues,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetComplianceIssueById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseComplianceIssueId(req.params.id as string);
    const complianceIssue = await getComplianceIssueById(id);

    res.status(200).json({
      success: true,
      data: complianceIssue,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetOverdueComplianceIssues(_req: Request, res: Response, next: NextFunction) {
  try {
    const complianceIssues = await getOverdueComplianceIssues();

    res.status(200).json({
      success: true,
      data: complianceIssues,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateComplianceIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as ComplianceIssueBody;

    const departmentId = getRequiredInteger(body.departmentId, 'departmentId');
    const description = getRequiredString(body.description, 'description');
    const ownerId = getOwnerId(body, true)!;
    const dueDate = getRequiredDate(body.dueDate, 'dueDate');
    const status = body.status !== undefined
      ? normalizeEnumValue(getRequiredString(body.status, 'status'), allowedStatuses, 'status')
      : undefined;

    const complianceIssue = await createComplianceIssue({
      departmentId,
      description,
      ownerId,
      dueDate,
      ...(status !== undefined ? { status } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Compliance issue created successfully.',
      data: complianceIssue,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateComplianceIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseComplianceIssueId(req.params.id as string);
    const body = req.body as ComplianceIssueBody;

    const data: {
      departmentId?: number;
      description?: string;
      ownerId?: number;
      dueDate?: Date;
      status?: string;
    } = {};

    const departmentId = getOptionalInteger(body.departmentId, 'departmentId');
    const description = getOptionalString(body.description, 'description');
    const ownerId = getOwnerId(body, false);
    const dueDate = getOptionalDate(body.dueDate, 'dueDate');
    const status = body.status !== undefined
      ? normalizeEnumValue(getRequiredString(body.status, 'status'), allowedStatuses, 'status')
      : undefined;

    if (departmentId !== undefined) {
      data.departmentId = departmentId;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (ownerId !== undefined) {
      data.ownerId = ownerId;
    }

    if (dueDate !== undefined) {
      data.dueDate = dueDate;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const complianceIssue = await updateComplianceIssue(id, data);

    res.status(200).json({
      success: true,
      message: 'Compliance issue updated successfully.',
      data: complianceIssue,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteComplianceIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseComplianceIssueId(req.params.id as string);
    const complianceIssue = await deleteComplianceIssue(id);

    res.status(200).json({
      success: true,
      message: 'Compliance issue deleted successfully.',
      data: complianceIssue,
    });
  } catch (error) {
    next(error);
  }
}