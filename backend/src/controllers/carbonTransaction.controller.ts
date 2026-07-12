import type { NextFunction, Request, Response } from 'express';
import {
  createCarbonTransaction,
  deleteCarbonTransaction,
  getAllCarbonTransactions,
  getCarbonTransactionById,
  updateCarbonTransaction,
} from '../services/carbonTransaction.service.js';

type CarbonTransactionBody = {
  departmentId?: unknown;
  source?: unknown;
  quantity?: unknown;
  co2Amount?: unknown;
};

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function parseCarbonTransactionId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError('Carbon transaction id must be a positive integer.', 400);
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

function getRequiredPositiveFloat(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw createError(`${fieldName} is required and must be a number.`, 400);
  }

  return value;
}

function getOptionalFloat(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw createError(`${fieldName} must be a number.`, 400);
  }

  return value;
}

export async function handleGetCarbonTransactions(_req: Request, res: Response, next: NextFunction) {
  try {
    const transactions = await getAllCarbonTransactions();

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetCarbonTransactionById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseCarbonTransactionId(req.params.id as string);
    const transaction = await getCarbonTransactionById(id);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateCarbonTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as CarbonTransactionBody;

    const departmentId = getRequiredInteger(body.departmentId, 'departmentId');
    const source = getRequiredString(body.source, 'source');
    const quantity = getRequiredPositiveFloat(body.quantity, 'quantity');
    const co2Amount = getRequiredPositiveFloat(body.co2Amount, 'co2Amount');

    const transaction = await createCarbonTransaction({
      departmentId,
      source,
      quantity,
      co2Amount,
    });

    res.status(201).json({
      success: true,
      message: 'Carbon transaction created successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateCarbonTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseCarbonTransactionId(req.params.id as string);
    const body = req.body as CarbonTransactionBody;

    const data: {
      departmentId?: number;
      source?: string;
      quantity?: number;
      co2Amount?: number;
    } = {};

    const departmentId = getOptionalInteger(body.departmentId, 'departmentId');
    const source = getOptionalString(body.source, 'source');
    const quantity = getOptionalFloat(body.quantity, 'quantity');
    const co2Amount = getOptionalFloat(body.co2Amount, 'co2Amount');

    if (departmentId !== undefined) {
      data.departmentId = departmentId;
    }

    if (source !== undefined) {
      data.source = source;
    }

    if (quantity !== undefined) {
      data.quantity = quantity;
    }

    if (co2Amount !== undefined) {
      data.co2Amount = co2Amount;
    }

    if (Object.keys(data).length === 0) {
      throw createError('At least one field must be provided for update.', 400);
    }

    const transaction = await updateCarbonTransaction(id, data);

    res.status(200).json({
      success: true,
      message: 'Carbon transaction updated successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteCarbonTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseCarbonTransactionId(req.params.id as string);
    const transaction = await deleteCarbonTransaction(id);

    res.status(200).json({
      success: true,
      message: 'Carbon transaction deleted successfully.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
}
