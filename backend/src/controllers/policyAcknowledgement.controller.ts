import type { NextFunction, Request, Response } from 'express';
import {
  createAcknowledgement,
  deleteAcknowledgement,
  getAllAcknowledgements,
  getAcknowledgementById,
  getAcknowledgementsByEmployee,
  getAcknowledgementsByPolicy,
} from '../services/policyAcknowledgement.service.js';

type AcknowledgementBody = {
  employeeId?: unknown;
  policyId?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parsePositiveInteger(value: string, fieldName: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError(`${fieldName} must be a positive integer.`, 400);
  }

  return id;
}

function getRequiredInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw createError(`${fieldName} is required and must be a positive integer.`, 400);
  }

  return value;
}

export async function handleGetAcknowledgements(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getAllAcknowledgements();

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAcknowledgementById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parsePositiveInteger(req.params.id as string, 'id');
    const data = await getAcknowledgementById(id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAcknowledgementsByEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employeeId = parsePositiveInteger(req.params.employeeId as string, 'employeeId');
    const data = await getAcknowledgementsByEmployee(employeeId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAcknowledgementsByPolicy(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const policyId = parsePositiveInteger(req.params.policyId as string, 'policyId');
    const data = await getAcknowledgementsByPolicy(policyId);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateAcknowledgement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = req.body as AcknowledgementBody;

    const employeeId = getRequiredInteger(body.employeeId, 'employeeId');
    const policyId = getRequiredInteger(body.policyId, 'policyId');

    const data = await createAcknowledgement(employeeId, policyId);

    res.status(201).json({
      success: true,
      message: 'Policy acknowledged successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteAcknowledgement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = parsePositiveInteger(req.params.id as string, 'id');
    const data = await deleteAcknowledgement(id);

    res.status(200).json({
      success: true,
      message: 'Policy acknowledgement deleted successfully.',
      data,
    });
  } catch (error) {
    next(error);
  }
}
