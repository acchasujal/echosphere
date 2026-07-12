import type { NextFunction, Request, Response } from 'express';
import {
  createAudit,
  deleteAudit,
  getAllAudits,
  getAuditById,
  updateAudit,
} from '../services/audit.service.js';

type AuditBody = {
  title?: unknown;
  description?: unknown;
  auditDate?: unknown;
  status?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseAuditId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Audit id must be a positive integer.', 400);
  }

  return id;
}

function getRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} is required.`, 400);
  }

  return value.trim();
}

function getOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} must be a non-empty string.`, 400);
  }

  return value.trim();
}

function getRequiredDate(value: unknown, fieldName: string): Date {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createError(`${fieldName} is required.`, 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} must be a valid date string.`, 400);
  }

  return date;
}

function getOptionalDate(value: unknown, fieldName: string): Date | undefined {
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

export async function handleGetAudits(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, auditDate, title } = req.query as {
      status?: string;
      auditDate?: string;
      title?: string;
    };

    const filters: { status?: string; auditDate?: Date; title?: string } = {};

    if (status !== undefined) {
      filters.status = status;
    }

    if (auditDate !== undefined) {
      const parsed = new Date(auditDate);

      if (Number.isNaN(parsed.getTime())) {
        throw createError('auditDate query parameter must be a valid date string.', 400);
      }

      filters.auditDate = parsed;
    }

    if (title !== undefined) {
      filters.title = title;
    }

    const audits = await getAllAudits(filters);

    res.status(200).json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAuditById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseAuditId(req.params.id as string);
    const audit = await getAuditById(id);

    res.status(200).json({ success: true, data: audit });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as AuditBody;

    const title = getRequiredString(body.title, 'title');
    const description = getRequiredString(body.description, 'description');
    const auditDate = getRequiredDate(body.auditDate, 'auditDate');
    const status = getOptionalString(body.status, 'status');

    const audit = await createAudit({
      title,
      description,
      auditDate,
      ...(status !== undefined ? { status } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Audit created successfully.',
      data: audit,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseAuditId(req.params.id as string);
    const body = req.body as AuditBody;

    const data: {
      title?: string;
      description?: string;
      auditDate?: Date;
      status?: string;
    } = {};

    const title = getOptionalString(body.title, 'title');
    const description = getOptionalString(body.description, 'description');
    const auditDate = getOptionalDate(body.auditDate, 'auditDate');
    const status = getOptionalString(body.status, 'status');

    if (title !== undefined) {
      data.title = title;
    }

    if (description !== undefined) {
      data.description = description;
    }

    if (auditDate !== undefined) {
      data.auditDate = auditDate;
    }

    if (status !== undefined) {
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const audit = await updateAudit(id, data);

    res.status(200).json({
      success: true,
      message: 'Audit updated successfully.',
      data: audit,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseAuditId(req.params.id as string);
    const audit = await deleteAudit(id);

    res.status(200).json({
      success: true,
      message: 'Audit deleted successfully.',
      data: audit,
    });
  } catch (error) {
    next(error);
  }
}
