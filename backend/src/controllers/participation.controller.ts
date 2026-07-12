import type { NextFunction, Request, Response } from 'express';
import {
  createParticipation,
  deleteParticipation,
  getAllParticipations,
  getParticipationById,
  updateParticipation,
} from '../services/participation.service.js';

type ParticipationBody = {
  employeeId?: unknown;
  challengeId?: unknown;
  status?: unknown;
  proof?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseParticipationId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Participation id must be a positive integer.', 400);
  }

  return id;
}

function getRequiredInteger(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw createError(`${fieldName} is required and must be an integer.`, 400);
  }

  return value;
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

export async function handleGetParticipations(_req: Request, res: Response, next: NextFunction) {
  try {
    const participations = await getAllParticipations();

    res.status(200).json({
      success: true,
      data: participations,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetParticipationById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseParticipationId(req.params.id as string);
    const participation = await getParticipationById(id);

    res.status(200).json({
      success: true,
      data: participation,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateParticipation(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as ParticipationBody;

    const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
    const challengeId = getRequiredInteger(body.challengeId, 'challengeId');
    const status = getRequiredString(body.status, 'status');
    const proof = getOptionalString(body.proof, 'proof');

    const participation = await createParticipation({
      employeeId,
      challengeId,
      status,
      ...(proof !== undefined ? { proof } : {}),
    });

    res.status(201).json({
      success: true,
      message: 'Participation created successfully.',
      data: participation,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateParticipation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseParticipationId(req.params.id as string);
    const body = req.body as ParticipationBody;

    const data: { status?: string; proof?: string } = {};

    const status = getOptionalString(body.status, 'status');
    const proof = getOptionalString(body.proof, 'proof');

    if (status !== undefined) {
      data.status = status;
    }

    if (proof !== undefined) {
      data.proof = proof;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const participation = await updateParticipation(id, data);

    res.status(200).json({
      success: true,
      message: 'Participation updated successfully.',
      data: participation,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteParticipation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseParticipationId(req.params.id as string);
    const participation = await deleteParticipation(id);

    res.status(200).json({
      success: true,
      message: 'Participation deleted successfully.',
      data: participation,
    });
  } catch (error) {
    next(error);
  }
}
